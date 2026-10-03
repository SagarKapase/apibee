import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const jobBody = `{"type":"report","durationSeconds":5}`;

const jobCreate = `$ curl -i -X POST https://api.testingapis.com/api/jobs \\
  -H "Content-Type: application/json" \\
  -d '${jobBody}'

HTTP/1.1 202 Accepted
Content-Type: application/json; charset=utf-8
location: /api/jobs/job_1001
retry-after: 2

{"message":"Job accepted. Poll the Location URL for status.","data":{"id":"job_1001","type":"report","status":"queued","progress":0,"durationSeconds":5,"createdAt":"2026-09-30T18:34:50Z","startedAt":null,"finishedAt":null,"statusUrl":"/api/jobs/job_1001","resultUrl":null,"error":null}}`;

const jobLifecycle = `# While it runs
GET /api/jobs/job_1002
HTTP/1.1 200 OK
retry-after: 1
{"id":"job_1002","type":"report","status":"running","progress":56, ... "resultUrl":null,"error":null}

# Asking for the result before the job has started
GET /api/jobs/job_1002/result
HTTP/1.1 409 Conflict
retry-after: 1
{"status":409,"error":"Conflict","message":"Job is still queued (0%). Poll /api/jobs/job_1002 and retry."}

# After it finishes
GET /api/jobs/job_1001
HTTP/1.1 200 OK
{"id":"job_1001","type":"report","status":"completed","progress":100,"durationSeconds":5,"createdAt":"2026-09-30T18:34:50Z","startedAt":"2026-09-30T18:34:52Z","finishedAt":"2026-09-30T18:34:57Z","statusUrl":"/api/jobs/job_1001","resultUrl":"/api/jobs/job_1001/result","error":null}

GET /api/jobs/job_1001/result
HTTP/1.1 200 OK
{"jobId":"job_1001","type":"report","result":{"reportName":"Monthly Sales Summary","period":"2026-08","rows":[ ... ],"totals":{"revenue":323986.45,"orders":3884}}}`;

const jobCancel = `DELETE /api/jobs/job_1002           (while running)
HTTP/1.1 200 OK
{"message":"Job cancelled","data":{"id":"job_1002","status":"cancelled","progress":71, ...}}

GET /api/jobs/job_1002/result
HTTP/1.1 409 Conflict
{"status":409,"error":"Conflict","message":"Job was cancelled, so no result is available."}

DELETE /api/jobs/job_1001           (already completed)
HTTP/1.1 409 Conflict
{"status":409,"error":"Conflict","message":"Job is already completed and cannot be cancelled."}`;

const jobTest = `import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = "https://api.testingapis.com";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Poll until the job leaves queued/running, or give up after timeoutMs.
async function waitForJob(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(url);
    assert.equal(res.status, 200);
    const job = await res.json();
    if (job.status !== "queued" && job.status !== "running") return job;
    const retryAfter = Number(res.headers.get("retry-after") ?? 1);
    await sleep(retryAfter * 1000);
  }
  throw new Error(\`job at \${url} did not finish within \${timeoutMs} ms\`);
}

test("a report job completes and has a result", { timeout: 30_000 }, async () => {
  const res = await fetch(\`\${BASE}/api/jobs\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "report", durationSeconds: 3 }),
  });
  assert.equal(res.status, 202);
  const location = res.headers.get("location");
  assert.match(location, /^\\/api\\/jobs\\/job_\\d+$/);

  const job = await waitForJob(BASE + location, 15_000);
  assert.equal(job.status, "completed");
  assert.equal(job.progress, 100);

  const result = await fetch(BASE + job.resultUrl);
  assert.equal(result.status, 200);
  const body = await result.json();
  assert.equal(body.jobId, job.id);
  assert.ok(body.result.totals.revenue > 0);
});

test("a failing job ends as failed with an error message", { timeout: 30_000 }, async () => {
  const res = await fetch(\`\${BASE}/api/jobs\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "fail", durationSeconds: 2 }),
  });
  const job = await waitForJob(BASE + res.headers.get("location"), 15_000);
  assert.equal(job.status, "failed");
  assert.ok(job.error);

  const result = await fetch(\`\${BASE}/api/jobs/\${job.id}/result\`);
  assert.equal(result.status, 409);
});`;

const jobTestOutput = `✔ a report job completes and has a result (6766.4482ms)
✔ a failing job ends as failed with an error message (3809.7777ms)
ℹ tests 2
ℹ pass 2
ℹ fail 0`;

const failedJob = `{"id":"job_1003","type":"fail","status":"failed","progress":60,"durationSeconds":2, ... "resultUrl":null,"error":"Simulated failure: worker crashed while processing batch 3 of 5."}`;

const binCreate = `$ curl -i -X POST https://api.testingapis.com/api/webhooks/bins \\
  -H "Content-Type: application/json" -d '{"name":"orders"}'

HTTP/1.1 201 Created

{"message":"Webhook bin created","data":{"id":"80b072a4ae14","name":"orders","createdAt":"2026-09-30T18:36:34Z","requestCount":0,"url":"http://api.testingapis.com/api/webhooks/80b072a4ae14","inspectUrl":"http://api.testingapis.com/api/webhooks/bins/80b072a4ae14"}}`;

const binSend = `$ curl -X POST https://api.testingapis.com/api/webhooks/80b072a4ae14/orders/created \\
  -H "Content-Type: application/json" \\
  -H "X-Event-Type: order.created" \\
  -d '{"event":"order.created","orderId":1001,"total":49.99}'

{"received":true,"binId":"80b072a4ae14","requestId":"req_620e34d8e1c5","message":"Request captured"}`;

const binInspect = `$ curl https://api.testingapis.com/api/webhooks/bins/80b072a4ae14

{
  "id": "80b072a4ae14",
  "name": "orders",
  "requestCount": 1,
  "requests": [
    {
      "id": "req_620e34d8e1c5",
      "method": "POST",
      "path": "/api/webhooks/80b072a4ae14/orders/created",
      "subPath": "orders/created",
      "query": {},
      "headers": {
        "User-Agent": "curl/8.18.0",
        "Content-Type": "application/json",
        "Content-Length": "54",
        "X-Event-Type": "order.created",
        ... (proxy headers trimmed)
      },
      "contentType": "application/json",
      "bodySize": 54,
      "bodyEncoding": "utf-8",
      "bodyTruncated": false,
      "body": "{\\"event\\":\\"order.created\\",\\"orderId\\":1001,\\"total\\":49.99}",
      "receivedAt": "2026-09-30T18:36:35.291Z"
    }
  ]
}

$ curl -X DELETE https://api.testingapis.com/api/webhooks/bins/80b072a4ae14
{"message":"Webhook bin deleted"}`;

const githubSample = `$ curl -i https://api.testingapis.com/api/webhooks/samples/github
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
x-github-delivery: 72d3162e-cc78-11e3-81ab-4c9367dc0958
x-github-event: push
x-hub-signature-256: sha256=fa0176693e0fbf3a50fbdde6039875593019d842a76bdc6bf74ec5bac6ca5899

{"ref":"refs/heads/main","before":"6113728f27ae82c7b1a177c8d03f9e96e0adf246", ... }`;

const verifyScript = `import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = "whsec_apibee_test_secret";

function verifyGitHub(rawBody, signatureHeader) {
  const expected = "sha256=" + createHmac("sha256", SECRET).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader ?? "");
  return a.length === b.length && timingSafeEqual(a, b);
}

const res = await fetch("https://api.testingapis.com/api/webhooks/samples/github");
const raw = await res.text(); // the exact bytes, not JSON.parse + stringify
const signature = res.headers.get("x-hub-signature-256");

console.log("original body:", verifyGitHub(raw, signature));
console.log("re-serialized:", verifyGitHub(JSON.stringify(JSON.parse(raw), null, 2), signature));
console.log("one byte changed:", verifyGitHub(raw.replace("main", "mainx"), signature));`;

const verifyOutput = `original body: true
re-serialized: false
one byte changed: false`;

const sseCurl = `$ curl -N -i "https://api.testingapis.com/api/stream/sse?count=3&interval=300"
HTTP/1.1 200 OK
Content-Type: text/event-stream
Transfer-Encoding: chunked
Cache-Control: no-cache

: connected, streaming events 1..3
retry: 3000

id: 1
event: message
data: {"id":1,"message":"Event 1 of 3","timestamp":"2026-09-30T18:37:07.822Z"}

id: 2
event: message
data: {"id":2,"message":"Event 2 of 3","timestamp":"2026-09-30T18:37:08.123Z"}

id: 3
event: message
data: {"id":3,"message":"Event 3 of 3","timestamp":"2026-09-30T18:37:08.423Z"}

event: done
data: {"total":3}`;

const sseResume = `$ curl -N -H "Last-Event-ID: 2" "https://api.testingapis.com/api/stream/sse?count=4&interval=200"
: connected, streaming events 3..4
retry: 3000

id: 3
event: message
data: {"id":3,"message":"Event 3 of 4","timestamp":"2026-09-30T18:37:08.948Z"}

id: 4
event: message
data: {"id":4,"message":"Event 4 of 4","timestamp":"2026-09-30T18:37:09.148Z"}

event: done
data: {"total":4}`;

const sseTest = `import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = "https://api.testingapis.com";

// Read an SSE response and yield { event, id, data, at } for each event.
async function* readEvents(res) {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let end;
    while ((end = buffer.indexOf("\\n\\n")) !== -1) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const event = { event: "message", at: Date.now() };
      for (const line of block.split("\\n")) {
        if (line.startsWith(":")) continue; // comment
        const i = line.indexOf(":");
        const field = line.slice(0, i);
        const value = line.slice(i + 1).trimStart();
        if (field === "data") event.data = JSON.parse(value);
        else if (field === "id" || field === "event") event[field] = value;
      }
      if (event.data !== undefined) yield event;
    }
  }
}

test("SSE stream sends numbered events in order, then done", { timeout: 15_000 }, async () => {
  const res = await fetch(\`\${BASE}/api/stream/sse?count=5&interval=500\`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /^text\\/event-stream/);

  const events = [];
  for await (const e of readEvents(res)) events.push(e);

  const messages = events.filter((e) => e.event === "message");
  assert.deepEqual(messages.map((e) => e.id), ["1", "2", "3", "4", "5"]);
  const last = events.at(-1);
  assert.equal(last.event, "done");
  assert.deepEqual(last.data, { total: 5 });

  // If a proxy buffered the stream, every event would arrive at once.
  const spread = messages.at(-1).at - messages[0].at;
  assert.ok(spread > 1500, \`events arrived within \${spread} ms of each other\`);
});

test("Last-Event-ID resumes after the given event", { timeout: 15_000 }, async () => {
  const res = await fetch(\`\${BASE}/api/stream/sse?count=5&interval=100\`, {
    headers: { "Last-Event-ID": "3" },
  });
  const ids = [];
  for await (const e of readEvents(res)) if (e.event === "message") ids.push(e.id);
  assert.deepEqual(ids, ["4", "5"]);
});`;

const sseTestOutput = `✔ SSE stream sends numbered events in order, then done (2513.3192ms)
✔ Last-Event-ID resumes after the given event (670.9452ms)
ℹ tests 2
ℹ pass 2
ℹ fail 0`;

const ndjson = `$ curl -N -i https://api.testingapis.com/api/stream/ndjson/3
HTTP/1.1 200 OK
Content-Type: application/x-ndjson
Transfer-Encoding: chunked
Cache-Control: no-cache

{"id":1,"name":"Alpha-001","value":3.14,"even":false}
{"id":2,"name":"Bravo-002","value":6.28,"even":true}
{"id":3,"name":"Charlie-003","value":9.42,"even":false}`;

const wsPlain = `$ curl -i https://api.testingapis.com/ws/echo
HTTP/1.1 400 Bad Request

{"status":400,"error":"Bad Request","message":"This endpoint only accepts WebSocket connections. Connect with a WebSocket client to ws://api.testingapis.com/ws/echo"}`;

const wsScript = `const ws = new WebSocket("wss://api.testingapis.com/ws/echo");

ws.addEventListener("open", () => ws.send(JSON.stringify({ hello: "world" })));
ws.addEventListener("message", (e) => {
  console.log("received:", e.data);
  if (e.data === '{"hello":"world"}') ws.send("close");
});
ws.addEventListener("close", (e) => console.log("closed:", e.code, e.reason));`;

const wsOutput = `received: {"type":"welcome","message":"Connected to APIBee echo. Every text/binary message is echoed back. Send \\u0022close\\u0022 to disconnect."}
received: {"hello":"world"}
closed: 1006`;

export default function AsyncApis() {
  return (
    <>
      <P>
        The tests in earlier lessons all follow one pattern: send a request,
        wait for the response, check it. That pattern assumes the server
        finishes its work before it answers. Plenty of APIs don&apos;t. A
        report that takes two minutes to build, a payment provider that tells
        you about a refund an hour later, a price feed that keeps sending
        updates: none of these fit in a single request and response.
      </P>
      <P>
        This lesson covers the three common shapes: jobs that the client
        polls, webhooks that the server sends to you, and connections that
        stay open and stream data. What they have in common, from a testing
        point of view, is time. Your test has to wait for something, and how
        it waits decides whether the test is reliable.
      </P>

      <H2 id="jobs">Jobs you poll</H2>
      <P>
        The usual pattern: the client starts the work with a POST, the server
        replies at once with <C>202 Accepted</C> and a URL to check, and the
        client checks that URL until the work is done. The{" "}
        <A href="/docs/jobs">Jobs</A> endpoints on this API work that way.
        Each job is queued for two seconds, then runs for as long as you ask.
      </P>
      <Code code={jobCreate} lang="text" label="Terminal" />
      <P>
        Three things in that response are the contract. The status is 202,
        not 200 or 201, which says the work has been accepted but not done.{" "}
        <C>Location</C> points at the job. <C>Retry-After: 2</C> tells the
        client how long to wait before the first check, and it matches the two
        seconds the job spends queued.
      </P>
      <Run
        method="POST"
        path="/api/jobs"
        body={jobBody}
        showHeaders={["Location", "Retry-After"]}
      />
      <P>
        Then the job moves through its states. These are real responses from
        two jobs, one left to finish and one cancelled while running:
      </P>
      <Code code={jobLifecycle} lang="text" label="Responses" />
      <Code code={jobCancel} lang="text" label="Responses" />
      <P>
        A job of type <C>fail</C> stops at 60% and reports why:
      </P>
      <Code code={failedJob} lang="json" />
      <P>
        Put together, the states form a small state machine: queued, then
        running, then one of completed, failed or cancelled. Most bugs in job
        APIs are transitions that shouldn&apos;t be possible. A few worth a
        test each:
      </P>
      <Ul>
        <li>progress never goes backwards between two polls</li>
        <li>a finished job can&apos;t be cancelled (the 409 above)</li>
        <li>a result is only available for completed jobs, and the error says why otherwise</li>
        <li><C>finishedAt</C> is set exactly when the status is final</li>
        <li>an unknown job id returns 404, and an unknown job type is rejected when the job is created, not when it runs</li>
      </Ul>
      <P>
        The last one holds here: <C>&#123;&quot;type&quot;:&quot;banana&quot;&#125;</C>{" "}
        gets a 400 listing the supported types (report, export, import and
        fail).
      </P>

      <H3>Waiting properly</H3>
      <P>
        The tempting way to test a job is to start it, sleep for ten seconds
        and check the result. That test is slow when the job is fast and fails
        when the job is slow. Poll instead, with a deadline:
      </P>
      <Code code={jobTest} lang="javascript" />
      <Code code={jobTestOutput} lang="text" label="Output" />
      <P>
        <C>waitForJob</C> returns as soon as the job reaches a final state, so
        the fast case is fast. It respects <C>Retry-After</C>, so it
        doesn&apos;t hammer the server. It has its own deadline, shorter than
        the test&apos;s timeout, so a stuck job fails with a message naming the
        URL rather than a generic timeout. The same helper, with a different
        condition, works for anything eventually consistent: a search index
        that updates a few seconds after a write, an email that arrives after
        signup, a webhook bin that should receive a request.
      </P>
      <P>
        Jobs can&apos;t be deleted on this API once they finish. The store
        keeps the newest 200 and drops the oldest, so the ones your tests
        create clean themselves up.
      </P>

      <H2 id="webhooks">Webhooks</H2>
      <P>
        A webhook reverses the direction of the call. Instead of your code
        asking &quot;has the payment gone through yet&quot;, the payment
        provider sends an HTTP request to a URL you gave it when something
        happens. GitHub does this for pushes, Stripe for payments, Shopify for
        orders.
      </P>
      <P>
        That makes testing awkward in both directions. If you are testing the
        system that sends webhooks, you need something to receive them and
        show you what arrived. If you are testing a receiver, you need
        realistic requests, signed the way the real provider signs them. This
        API has tools for both.
      </P>

      <H3>Capturing webhooks with a bin</H3>
      <P>A bin is a URL that records every request sent to it.</P>
      <Code code={binCreate} lang="text" label="Terminal" />
      <P>
        One detail: the <C>url</C> in the response starts with{" "}
        <C>http://</C>, although the API is served over HTTPS. The server sits
        behind a proxy and builds the URL from the plain HTTP connection it
        receives. Use <C>https://</C>. A URL built from the wrong scheme is
        the kind of thing to report when you see it in an API you test, since
        some webhook senders refuse to deliver to plain HTTP.
      </P>
      <P>
        Normally the system under test sends to the bin. Here, curl plays that
        part. Anything after the bin id is recorded as <C>subPath</C>:
      </P>
      <Code code={binSend} lang="text" label="Terminal" />
      <Code code={binInspect} lang="text" label="Terminal" />
      <P>
        In a test of a sender, the steps are: create a bin, configure the
        system to send to it, trigger the event, then poll the bin with the
        same kind of deadline loop as <C>waitForJob</C> until the request
        arrives. Then check what a receiver would care about:
      </P>
      <Ul>
        <li>the method, path and <C>Content-Type</C></li>
        <li>the body, against a schema (see <A href="/learn/schemas-contracts">schemas and contracts</A>)</li>
        <li>an event id and an event type, so the receiver can tell events apart</li>
        <li>the signature header, and that it verifies with the shared secret</li>
        <li>that one event produces exactly one delivery</li>
      </Ul>
      <P>
        Failures on the receiving side matter as much. Add{" "}
        <C>?status=500</C> to the bin URL and the bin replies with a 500 (it
        still records the request). A well-behaved sender should retry with
        backoff, and a test can count how many deliveries arrive and how far
        apart. Delete the bin when the test is done.
      </P>

      <H3>Verifying signatures</H3>
      <P>
        Anyone who finds your webhook URL can post to it. Providers sign each
        request with a secret shared between you and them, and the receiver
        must check the signature before trusting anything in the body.{" "}
        <C>/api/webhooks/samples</C> returns signed sample events in the
        formats GitHub, Stripe and Shopify use, all signed with the secret{" "}
        <C>whsec_apibee_test_secret</C>.
      </P>
      <Code code={githubSample} lang="text" label="Terminal" />
      <P>
        GitHub&apos;s scheme is an HMAC-SHA256 of the raw body, written as hex
        after <C>sha256=</C>. Verifying it:
      </P>
      <Code code={verifyScript} lang="javascript" />
      <Code code={verifyOutput} lang="text" label="Output" />
      <P>
        The second line is the mistake almost everyone makes once. Web
        frameworks usually parse JSON bodies before your handler runs. If you
        then call <C>JSON.stringify</C> on the parsed object and verify that,
        the whitespace and key order differ from what was signed, and every
        genuine webhook is rejected. Verify the bytes exactly as they arrived.{" "}
        <C>timingSafeEqual</C> compares in constant time, so an attacker
        can&apos;t learn the correct signature one byte at a time by measuring
        how quickly you reject wrong ones.
      </P>
      <P>
        The other providers differ in small ways. Shopify sends the same HMAC
        in base64 in <C>X-Shopify-Hmac-Sha256</C>. Stripe signs the string{" "}
        <C>&#123;timestamp&#125;.&#123;body&#125;</C> and sends{" "}
        <C>t=1721300000,v1=&lt;hex&gt;</C>. The timestamp is there so that a
        captured request can&apos;t be replayed later, and Stripe&apos;s own
        libraries reject events more than five minutes old by default. The
        sample&apos;s timestamp is 18 July 2024, so a receiver with that check
        should reject it, and a test can confirm that it does.
      </P>
      <Table
        head={["Receiver test", "Expected"]}
        rows={[
          ["Valid signature", "Accepted, usually 200 or 204"],
          ["Body changed by one byte", "Rejected"],
          ["Signature header missing", "Rejected, with 400 or 401"],
          ["Signed with the wrong secret", "Rejected"],
          ["Timestamp older than the tolerance (Stripe style)", "Rejected"],
          ["Same event delivered twice", "Processed once. Providers retry, so duplicates are normal."],
        ]}
      />

      <H2 id="streams">Streams</H2>
      <P>
        Some responses don&apos;t end quickly. The server keeps the connection
        open and sends data as it becomes available. Two formats cover most
        HTTP streaming.
      </P>

      <H3>Server-Sent Events</H3>
      <P>
        SSE is a text format with <C>Content-Type: text/event-stream</C>.
        Each event is a few <C>field: value</C> lines followed by a blank line.
        curl buffers output by default; <C>-N</C> turns that off so you see
        events as they arrive:
      </P>
      <Code code={sseCurl} lang="text" label="Terminal" />
      <P>
        Lines starting with a colon are comments. <C>retry: 3000</C> tells
        browsers to wait three seconds before reconnecting if the connection
        drops. Each event has an <C>id</C>, and when a browser reconnects it
        sends the last id it saw in a <C>Last-Event-ID</C> header. The server
        should continue from there:
      </P>
      <Code code={sseResume} lang="text" label="Terminal" />
      <P>
        A test needs to read the stream event by event. Here is a small
        parser and two tests. The first checks order, the final{" "}
        <C>done</C> event, and that events really arrived over time. The
        second checks resuming.
      </P>
      <Code code={sseTest} lang="javascript" />
      <Code code={sseTestOutput} lang="text" label="Output" />
      <P>
        The timing check catches a problem that is easy to miss. A proxy or a
        compression layer that buffers responses turns a stream into one big
        response at the end. Every event still arrives, in the right order,
        and a test that only looks at the content passes. The user sees
        nothing for ten seconds and then everything at once. Measuring the
        gap between the first and last event is the only way to notice from a
        test.
      </P>
      <P>
        The parser is deliberately small. It handles the events this endpoint
        sends, and it assumes every <C>data</C> line is JSON. The full format
        also allows multi-line data and events without data. If you test a
        real SSE API, use a parser library, or test your parser against those
        cases first.
      </P>

      <H3>Newline-delimited JSON</H3>
      <P>
        NDJSON sends one complete JSON value per line:
      </P>
      <Code code={ndjson} lang="text" label="Terminal" />
      <P>
        The body as a whole is not valid JSON, so <C>res.json()</C> fails on
        it. Split on newlines and parse each line. Check that every line
        parses, that the count matches what you asked for, and that the last
        line is complete. A stream cut off halfway usually ends with half a
        JSON object and no newline.
      </P>

      <H2 id="websockets">WebSockets</H2>
      <P>
        A WebSocket starts as an HTTP request and then switches to a
        two-way connection where either side can send messages at any time.
        A plain HTTP request to a WebSocket endpoint gets an error:
      </P>
      <Code code={wsPlain} lang="text" label="Terminal" />
      <P>
        Node 22 and later have a global <C>WebSocket</C>, the same API as in
        browsers. The echo endpoint sends a welcome message, echoes whatever
        you send, and is documented to close the connection with code 1000
        and the reason &quot;Bye!&quot; when you send the text{" "}
        <C>close</C>:
      </P>
      <Code code={wsScript} lang="javascript" />
      <Code code={wsOutput} lang="text" label="Output" />
      <P>
        The messages are right, but the close code isn&apos;t. 1006 means the
        connection ended without a proper closing handshake, and the reason
        is empty. The same happens at the end of <C>/ws/ticker</C>, which is
        documented to close with 1000 &quot;Ticker finished&quot;. It happened
        on every run I tried, through the public address. The likely cause is
        the proxy in front of the API, as with the dropped connections in the{" "}
        <A href="/learn/reliability">previous lesson</A>, but from the
        client&apos;s side the reason doesn&apos;t matter: a client that
        treats 1006 as an error and reconnects will reconnect after every
        normal goodbye.
      </P>
      <P>
        That is the general lesson for streams and sockets. How a connection
        ends is part of the contract, and it is the part most often left
        untested. Test the clean end, the server closing early, and the
        client disconnecting in the middle.
      </P>

      <Note title="Browsers and these endpoints">
        <P>
          The Send buttons in this tutorial read the whole response before
          showing it, so they are no use for streams. Use curl with{" "}
          <C>-N</C>, or the <C>EventSource</C> and <C>WebSocket</C> APIs in a
          browser console.
        </P>
      </Note>

      <Exercise>
        <P>
          Write a <C>node:test</C> test for cancelling a job. Start a report
          job with <C>durationSeconds: 10</C>, poll until its status is{" "}
          <C>running</C>, then send DELETE. Assert that the response says{" "}
          <C>cancelled</C>, that progress is below 100, that the result
          endpoint returns 409, and that a second DELETE also returns 409.
          Record every status you see while polling and assert that the
          sequence only ever moves forward.
        </P>
        <P>
          Then write a verifier for the Shopify sample from{" "}
          <C>/api/webhooks/samples/shopify</C> (base64 HMAC-SHA256 of the raw
          body in <C>X-Shopify-Hmac-Sha256</C>). Test it with the real sample,
          with one character of the body changed, and with the header
          missing.
        </P>
      </Exercise>
    </>
  );
}
