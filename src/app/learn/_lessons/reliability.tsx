import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table } from "@/components/lesson";

const timeoutScript = `const BASE = "https://api.testingapis.com";

try {
  const res = await fetch(\`\${BASE}/api/chaos/timeout?seconds=10\`, {
    signal: AbortSignal.timeout(2000),
  });
  console.log("got", res.status);
} catch (err) {
  console.log(err.name, err.message);
}`;

const timeoutOutput = `TimeoutError The operation was aborted due to timeout`;

const curlTimeout = `$ curl -sS -m 2 "https://api.testingapis.com/api/chaos/timeout?seconds=10"
curl: (28) Operation timed out after 2003 milliseconds with 0 bytes received`;

const retryAttempts = `$ curl -i "https://api.testingapis.com/api/chaos/retry/my-key?succeedAfter=3"
HTTP/1.1 503 Service Unavailable
retry-after: 1
x-attempt: 1

{"status":503,"error":"Service Unavailable","message":"Attempt 1 failed. The first 3 attempt(s) fail; attempt 4 succeeds.","attempt":1,"succeedAfter":3,"remainingFailures":2}

(attempts 2 and 3 fail the same way)

HTTP/1.1 200 OK
x-attempt: 4

{"message":"Succeeded on attempt 4.","attempt":4,"succeedAfter":3}

$ curl -X DELETE https://api.testingapis.com/api/chaos/retry/my-key`;

const retryScript = `const BASE = "https://api.testingapis.com";

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

async function fetchWithRetry(url, { attempts = 5, baseDelayMs = 200, ...init } = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, init);
    if (!RETRYABLE.has(res.status) || attempt === attempts) return res;

    // Honour Retry-After when the server sends it, otherwise back off
    // exponentially: 200, 400, 800 ms... plus up to 100 ms of jitter.
    const retryAfter = Number(res.headers.get("retry-after"));
    const delay = retryAfter > 0
      ? retryAfter * 1000
      : baseDelayMs * 2 ** (attempt - 1) + Math.random() * 100;
    console.log(\`attempt \${attempt}: \${res.status}, waiting \${Math.round(delay)} ms\`);
    await new Promise((r) => setTimeout(r, delay));
  }
}

const key = \`retry-demo-\${Date.now()}\`;
const res = await fetchWithRetry(\`\${BASE}/api/chaos/retry/\${key}?succeedAfter=3\`);
console.log(res.status, await res.json());
await fetch(\`\${BASE}/api/chaos/retry/\${key}\`, { method: "DELETE" });`;

const retryOutput = `attempt 1: 503, waiting 1000 ms
attempt 2: 503, waiting 1000 ms
attempt 3: 503, waiting 1000 ms
200 { message: 'Succeeded on attempt 4.', attempt: 4, succeedAfter: 3 }`;

const paymentBody = `{"userId":101,"amount":49.99,"currency":"usd","method":"card","cardLast4":"4242","description":"Order #1001"}`;

const paymentCurl = `curl -i -X POST https://api.testingapis.com/api/Payments \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: 1298984a-69f8-4027-acbf-da8050d8e02b" \\
  -d '${paymentBody}'`;

const paymentResponses = `# First request
HTTP/1.1 201 Created

{"message":"Payment created successfully","idempotencyKey":"1298984a-69f8-4027-acbf-da8050d8e02b","data":{"id":13,"userId":101,"orderId":null,"amount":49.99,"currency":"USD","method":"card","status":"succeeded","description":"Order #1001","cardLast4":"4242","createdAt":"2026-09-30T18:34:06Z","refundedAt":null}}

# Same key, same body
HTTP/1.1 201 Created
idempotent-replayed: true

{"message":"Payment created successfully","idempotencyKey":"1298984a-69f8-4027-acbf-da8050d8e02b","data":{"id":13, ... same as above}}

# Same key, amount changed to 99.99
HTTP/1.1 422 Unprocessable Entity

{"status":422,"error":"Unprocessable Entity","message":"This Idempotency-Key was already used with a different request body."}

# No Idempotency-Key header
HTTP/1.1 400 Bad Request

{"status":400,"error":"Bad Request","message":"Missing Idempotency-Key header. Send a unique value (e.g. a UUID) per logical payment."}`;

const inFlight = `# Two requests with the same key, the second sent one second after the first.
# ?processingSeconds=3 keeps the first one open for three seconds.

HTTP/1.1 409 Conflict
{"status":409,"error":"Conflict","message":"A request with this Idempotency-Key is still being processed. Retry shortly."}

HTTP/1.1 201 Created
{"message":"Payment created successfully","idempotencyKey":"573ab03f-8b15-49ca-bf8d-bddd8e602fe2","data":{"id":14, ...}}`;

const rateLimit = `$ curl -i -H "X-Client-Id: lesson-10868" https://api.testingapis.com/api/RateLimit
HTTP/1.1 200 OK
x-ratelimit-limit: 5
x-ratelimit-remaining: 4
x-ratelimit-reset: 1790793324

{"message":"Request allowed.","clientId":"id:lesson-10868","used":1,"remaining":4,"limit":5,"windowSeconds":60}

(requests 2 to 5 succeed, remaining counts down to 0)

HTTP/1.1 429 Too Many Requests
retry-after: 56
x-ratelimit-limit: 5
x-ratelimit-remaining: 0
x-ratelimit-reset: 1790793324

{"status":429,"error":"Too Many Requests","message":"Rate limit of 5 requests per 60s exceeded. Retry in 56s.","retryAfter":56}`;

const rateStatus = `$ curl -H "X-Client-Id: lesson-10868" https://api.testingapis.com/api/RateLimit/status
{"clientId":"id:lesson-10868","used":5,"remaining":0,"limit":5,"resetsInSeconds":56}

$ curl -X POST -H "X-Client-Id: lesson-10868" https://api.testingapis.com/api/RateLimit/reset
{"message":"Rate limit window reset.","clientId":"id:lesson-10868"}`;

const noClientId = `$ curl https://api.testingapis.com/api/RateLimit/status
{"clientId":"ip:::1","used":0,"remaining":5,"limit":5,"resetsInSeconds":60}`;

const drops = `$ curl -sS -o /dev/null -w "%{http_code} %{size_download}\\n" https://api.testingapis.com/api/chaos/abort
502 0

$ curl -sS -o /dev/null -w "%{http_code} %{size_download}\\n" https://api.testingapis.com/api/chaos/partial
502 223038`;

const simulated = `HTTP/1.1 503 Service Unavailable
Content-Type: application/json; charset=utf-8
x-simulated: true

{"status":503,"error":"Service Unavailable","message":"Simulated error. Use ?error={code} to test different status codes.","simulated":true}`;

export default function Reliability() {
  return (
    <>
      <P>
        Everything so far assumed a healthy server that answers every request
        in a few hundred milliseconds. Production is less polite. Servers get
        slow under load, return 503 for the thirty seconds a deploy takes,
        drop connections, and refuse requests when a client sends too many.
        None of that shows up in a test suite that only runs against a
        healthy server.
      </P>
      <P>
        This lesson covers two sides of the same problem. One is testing the
        features an API provides for bad days: idempotency keys, rate limits
        and <C>Retry-After</C> headers. The other is testing clients,
        including your own test code, when the server misbehaves. This API
        has a <A href="/docs/chaos">Chaos</A> group built for the second part.
      </P>

      <H2 id="timeouts">Timeouts</H2>
      <P>
        <C>fetch</C> has no timeout by default. If the server accepts the
        connection and never answers, the request waits until something
        lower down gives up, which can take minutes. A test runner eventually
        kills the test, and you get a vague &quot;test timed out&quot; with no
        hint about which request hung.
      </P>
      <P>
        Set a timeout on every request. <C>/api/chaos/timeout</C> hangs for
        as many seconds as you ask, so it is easy to see what happens:
      </P>
      <Code code={timeoutScript} lang="javascript" />
      <Code code={timeoutOutput} lang="text" label="Output" />
      <P>curl does the same with <C>-m</C>, the maximum time in seconds:</P>
      <Code code={curlTimeout} lang="text" label="Terminal" />
      <P>
        Exit code 28 means a timeout. In a shell script you can check for it
        and tell it apart from a connection refused (7) or a DNS failure (6).
      </P>
      <P>
        Picking the number is the hard part. Too short and you fail requests
        that would have succeeded. Too long and one slow dependency ties up
        every worker in your service. A reasonable starting point is a few
        times the p99 latency you measure in normal conditions (the{" "}
        <A href="/learn/performance">performance lesson</A> covers
        percentiles). For tests, pick something short enough that a hung
        request fails the test quickly with a clear message.
      </P>
      <P>
        To test how your own client or UI handles a slow response, add{" "}
        <C>?delay=N</C> to any endpoint on this API. It waits N seconds, up to
        10, before answering normally. <C>/api/Products/1?delay=2</C> took
        about 2.5 seconds end to end when I ran it: the two-second delay plus
        the usual network time.
      </P>

      <H3>The request you gave up on may still succeed</H3>
      <P>
        A client timeout ends the client&apos;s wait. It doesn&apos;t
        necessarily stop the server. This API stops waiting as soon as the
        client disconnects, but plenty of servers finish the work anyway. If
        the request was a GET, that doesn&apos;t matter. If it was a POST that
        charged a card, the client now has no idea whether the charge
        happened. That is the problem idempotency keys solve, further down.
      </P>

      <H2 id="retries">Retries</H2>
      <P>
        Many failures are temporary, and the right response is to try again.
        The question is which failures, how many times, and how long to wait.
      </P>
      <Table
        head={["Response", "Retry?"]}
        rows={[
          ["400, 401, 403, 404, 422", "No. The same request will fail the same way."],
          ["408 Request Timeout", "Yes"],
          ["429 Too Many Requests", "Yes, after the Retry-After delay"],
          ["500 Internal Server Error", "Sometimes. It may be a bug that fails every time."],
          ["502, 503, 504", "Yes. These usually mean a proxy or server is briefly unavailable."],
          ["Timeout or dropped connection", "Only if the request is idempotent, or carries an idempotency key"],
        ]}
      />
      <P>
        The last row matters most. As the{" "}
        <A href="/learn/http-methods">HTTP methods lesson</A> explained, GET,
        PUT and DELETE are idempotent: sending them twice has the same effect
        as sending them once. POST and PATCH are not. Retrying a POST after a
        timeout can create two orders.
      </P>

      <H3>Testing retry logic deterministically</H3>
      <P>
        Retry code is hard to test against a real server because real
        failures are random. <C>/api/chaos/retry/&#123;key&#125;</C> fails a
        fixed number of times and then succeeds. The key is any name you
        choose, and the server counts attempts per key:
      </P>
      <Code code={retryAttempts} lang="text" label="Terminal" />
      <P>
        Every response has an <C>X-Attempt</C> header, and failures include{" "}
        <C>Retry-After: 1</C>. Browsers can&apos;t read <C>X-Attempt</C>{" "}
        because the API doesn&apos;t expose it to cross-origin scripts, but
        the body has the same number in <C>attempt</C>. The DELETE resets the
        counter so the next run starts from attempt 1.
      </P>
      <P>Here is a small retry wrapper, run against a fresh key:</P>
      <Code code={retryScript} lang="javascript" />
      <Code code={retryOutput} lang="text" label="Output" />
      <P>
        Three details in that function are easy to get wrong. It gives up
        after a fixed number of attempts, so a server that is down for an
        hour doesn&apos;t get retried forever. It respects{" "}
        <C>Retry-After</C> when the server sends one, which here is why every
        wait is exactly one second. And when there is no{" "}
        <C>Retry-After</C>, it doubles the wait each time and adds a random
        amount on top. That random part is called jitter. Without it, a
        thousand clients that failed at the same moment all retry at the same
        moment, and the server that was recovering falls over again.
      </P>

      <H3>Random failures</H3>
      <P>
        <C>/api/chaos/flaky</C> fails with a 503 at random, half the time by
        default. Ten requests in a row gave me{" "}
        <C>200 200 503 200 200 200 503 503 503 503</C>. Press Send a few
        times:
      </P>
      <Run path="/api/chaos/flaky" />
      <P>
        Use this one to see how a client behaves over many requests, not to
        test retry logic. A test that calls it once passes or fails by chance,
        which is the definition of a flaky test. Set{" "}
        <C>?failRate=1</C> or <C>?failRate=0</C> if you need it to be
        predictable.
      </P>

      <H2 id="idempotency-keys">Idempotency keys</H2>
      <P>
        Payment APIs have the timeout problem in its worst form: a POST that
        moves money, where the client can&apos;t tell whether it went
        through. The common fix, used by Stripe and many others, is an{" "}
        <C>Idempotency-Key</C> header. The client generates a unique value per
        logical operation, usually a UUID, and sends the same value on every
        retry of that operation. The server remembers the key and the
        response. If the same key arrives again, it returns the stored
        response instead of doing the work twice.
      </P>
      <P>
        <C>POST /api/Payments</C> requires one. Here are four real requests.
        The first two send identical bodies with the same key, the third
        changes the amount, and the fourth leaves the header out:
      </P>
      <Code code={paymentCurl} lang="curl" />
      <Code code={paymentResponses} lang="text" label="Responses" />
      <P>
        The replay returns the same payment, id 13, with an{" "}
        <C>Idempotent-Replayed: true</C> header. No second payment was
        created. Reusing a key with a different body is an error, because it
        almost always means a client bug: two different payments sharing a
        key.
      </P>
      <P>
        One more case is worth testing in any API that uses keys: what
        happens when two requests with the same key arrive at the same time?
        The server can&apos;t replay a response it hasn&apos;t produced yet.
        This API holds a request open with <C>?processingSeconds=3</C>, so
        you can send a duplicate while the first is still running:
      </P>
      <Code code={inFlight} lang="text" label="Responses" />
      <P>
        The duplicate gets a 409 and the original completes. A server that
        got this wrong would create two payments here, and that bug only
        appears when a client retries quickly, which is exactly when a
        network is misbehaving.
      </P>
      <P>
        The button below sends the payment with a fixed key. Everyone who
        reads this page shares that key, so unless you are the first since
        the server last restarted, you will get a replay:
      </P>
      <Run
        method="POST"
        path="/api/Payments"
        headers={{ "Idempotency-Key": "learn-reliability-demo-1" }}
        body={paymentBody}
        showHeaders={["Idempotent-Replayed"]}
      />
      <P>
        Payments can&apos;t be deleted on this API, so each new key you try
        adds one record. Payments reset when the server restarts.
      </P>

      <H2 id="rate-limits">Rate limits</H2>
      <P>
        Most public APIs limit how many requests a client can send in a
        period of time. When you go over, you get a 429 and should wait.{" "}
        <C>/api/RateLimit</C> has a real limiter: five requests per 60 seconds
        per client. You identify yourself with an <C>X-Client-Id</C> header
        of your choosing.
      </P>
      <Code code={rateLimit} lang="text" label="Terminal" />
      <P>
        The limiter sends three headers on every response: the limit, how many
        requests are left, and <C>X-RateLimit-Reset</C>, the Unix time when
        the window resets. The 429 adds <C>Retry-After</C> in seconds. Two
        more endpoints let you look at the window without using it up, and
        reset it:
      </P>
      <Code code={rateStatus} lang="text" label="Terminal" />
      <P>Things to test on a rate-limited endpoint:</P>
      <Table
        head={["Check", "Why"]}
        rows={[
          ["Request N+1 in a window returns 429", "The limit is actually enforced"],
          ["The 429 has Retry-After, and waiting that long works", "Clients depend on it to back off correctly"],
          ["Remaining counts down by one per request", "Clients use it to slow down before hitting the limit"],
          ["Two clients have separate windows", "One busy client shouldn't block everyone else"],
          ["The window really resets", "An off-by-one here locks clients out for a whole extra window"],
          ["Status and reset calls don't count as requests", "Otherwise checking the limit uses it up"],
        ]}
      />
      <P>
        Rate limit tests should use a client id that no other test uses, and
        reset the window when they finish. Otherwise they interfere with each
        other, and the suite fails depending on which test ran first.
      </P>

      <H3>Two problems found while writing this lesson</H3>
      <P>
        Send a request without <C>X-Client-Id</C> and look at the client id
        the server picked:
      </P>
      <Code code={noClientId} lang="text" label="Terminal" />
      <P>
        <C>::1</C> is the IPv6 address for localhost. The API runs behind a
        proxy, and the limiter sees the proxy&apos;s address instead of the
        caller&apos;s. Every client that doesn&apos;t send the header shares a
        single window of five requests per minute. This is a common bug in
        real systems: a limiter keyed on the connection address works in
        development and turns into a global limit once a load balancer is put
        in front of it. The fix is to read the original address from a header
        the proxy sets, such as <C>X-Forwarded-For</C>, and to trust that
        header only when it comes from your own proxy. On this API, always
        send your own <C>X-Client-Id</C>.
      </P>
      <P>
        The second problem: every other endpoint also returns{" "}
        <C>X-RateLimit-*</C> headers, but they never change. They always say
        1000, 999 and <C>1721300000</C>, which is a date in July 2024. The
        documentation says they are informational. A client that trusted them
        would think it had 999 requests left forever. If an API sends these
        headers, make two requests and check that <C>Remaining</C> goes down.
      </P>

      <H2 id="dropped-connections">Dropped connections</H2>
      <P>
        Some failures have no status code at all. The server closes the
        connection halfway, or never sends anything. Node&apos;s fetch rejects
        with a <C>TypeError</C> whose message is &quot;fetch failed&quot;.
        curl reports errors such as &quot;Empty reply from server&quot; (exit
        code 52) or a transfer that ended early (exit code 18).
      </P>
      <P>
        This API has two endpoints that drop the connection on purpose.{" "}
        <C>/api/chaos/abort</C> closes it without answering, and{" "}
        <C>/api/chaos/partial</C> promises 10,000 bytes, sends about 70, then
        closes. Here is what you actually get from the public address:
      </P>
      <Code code={drops} lang="text" label="Terminal" />
      <P>
        Two 502 Bad Gateway responses. The first has an empty body. The
        second is a 223 KB HTML error page from the hosting provider. The
        dropped connection happens between the proxy and the application, and
        the proxy turns it into a 502 before it reaches you. If you ran the
        API locally, with no proxy in front, you would see the raw network
        errors described above.
      </P>
      <P>
        This is worth knowing beyond this API. The failure a client sees
        depends on everything between it and the server: load balancers, CDNs
        and gateways each translate errors in their own way. A client needs
        to handle both a network error and a 502 whose body is HTML, even
        though the API only ever returns JSON. Code that calls{" "}
        <C>res.json()</C> on every response throws a parse error on that HTML
        page, and the log then shows a JSON error instead of the 502 that
        caused it. Check the status and <C>Content-Type</C> before parsing.
      </P>

      <H2 id="simulated-errors">Simulating errors in your own tests</H2>
      <P>
        When the thing under test is a client, such as a web page or a mobile
        app, you need the API to fail on demand. Every endpoint on this API
        accepts <C>?error=</C> with one of 400, 401, 403, 404, 408, 429, 500,
        502 or 503:
      </P>
      <Run path="/api/Products/1?error=503" showHeaders={["X-Simulated"]} />
      <Code code={simulated} lang="text" label="Response" />
      <P>
        Combine it with <C>delay</C>, as in{" "}
        <C>?delay=3&amp;error=503</C>, to check that a loading indicator
        appears and is then replaced by an error message rather than hanging.
        In your own projects the same idea usually takes the form of a mock
        server or a feature flag that makes one dependency fail. The point is
        the same: error handling that has never run is error handling that
        doesn&apos;t work.
      </P>

      <Note title="Keep chaos out of shared environments">
        <P>
          Failure injection is fine on a practice API or in your own test
          environment. Don&apos;t point a load of retries or deliberately slow
          requests at a staging server other teams depend on without telling
          them first.
        </P>
      </Note>

      <Exercise>
        <P>
          Turn <C>fetchWithRetry</C> into a module and write three{" "}
          <C>node:test</C> tests for it against{" "}
          <C>/api/chaos/retry/&#123;key&#125;</C>, each with its own key and a
          DELETE at the end:
        </P>
        <P>
          With <C>succeedAfter=2</C>, it returns 200 and the body says{" "}
          <C>attempt: 3</C>. With <C>succeedAfter=10</C> and{" "}
          <C>attempts: 3</C>, it gives up and returns the last 503. With{" "}
          <C>failStatus=500</C>, check that your function does what you decided
          500s should do.
        </P>
        <P>
          Then test the in-flight case of <C>POST /api/Payments</C>: send two
          requests with the same new key and <C>?processingSeconds=3</C> using{" "}
          <C>Promise.all</C>, and assert that exactly one gets 201 and the other
          gets 409. Run it a few times. If it ever produces two 201s, you have
          found a race condition worth reporting.
        </P>
      </Exercise>
    </>
  );
}
