import { A, C, Code, Exercise, H2, H3, Note, P, Table, Ul } from "@/components/lesson";

const latencyScript = `
const URL = "https://api.testingapis.com/api/chaos/random-latency";
const N = 30;

const timings = [];
for (let i = 0; i < N; i++) {
  const start = performance.now();
  const res = await fetch(URL);
  await res.text();
  timings.push(performance.now() - start);
}

timings.sort((a, b) => a - b);
const pct = (p) => timings[Math.ceil((p / 100) * timings.length) - 1];
const mean = timings.reduce((s, t) => s + t, 0) / timings.length;

console.log(\`requests: \${timings.length}\`);
console.log(\`mean: \${mean.toFixed(0)} ms\`);
console.log(\`p50:  \${pct(50).toFixed(0)} ms\`);
console.log(\`p95:  \${pct(95).toFixed(0)} ms\`);
console.log(\`p99:  \${pct(99).toFixed(0)} ms\`);
console.log(\`max:  \${timings.at(-1).toFixed(0)} ms\`);
`;

const latencyOutput = `
$ node latency.mjs
requests: 30
mean: 328 ms
p50:  320 ms
p95:  409 ms
p99:  536 ms
max:  536 ms
`;

const curlTiming = `
curl -s -o /dev/null -w "dns:     %{time_namelookup}\\nconnect: %{time_connect}\\ntls:     %{time_appconnect}\\nttfb:    %{time_starttransfer}\\ntotal:   %{time_total}\\n" https://api.testingapis.com/api/health
`;

const curlTimingOutput = `
dns:     0.074056
connect: 0.102971
tls:     0.178730
ttfb:    0.501674
total:   0.501782
`;

const curlReuse = `
dns:     0.006454
connect: 0.054908
tls:     0.130421
ttfb:    0.404310
total:   0.404372
dns:     0.000000
connect: 0.000000
tls:     0.000000
ttfb:    0.264396
total:   0.264467
`;

const k6Script = `
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 3,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("https://api.testingapis.com/api/Products?limit=10");
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
`;

const budgetTest = `
test("product 1 responds within 2 seconds", async () => {
  const start = performance.now();
  const res = await fetch(\`\${BASE_URL}/api/Products/1\`);
  await res.json();
  const ms = performance.now() - start;
  assert.equal(res.status, 200);
  assert.ok(ms < 2000, \`took \${Math.round(ms)} ms, budget is 2000 ms\`);
});
`;

export default function Performance() {
  return (
    <>
      <P>
        Functional tests ask whether the API gives the right answer.
        Performance tests ask how long the answer takes, and what happens to
        that time when many clients ask at once. An endpoint that returns the
        correct product in 9 seconds is broken for anyone waiting on a phone.
      </P>
      <P>
        This lesson covers measuring a single endpoint properly, reading the
        numbers, and running a small load test. The API in these lessons is
        shared by everyone who uses the tutorial, so the load examples here
        are deliberately tiny.
      </P>

      <H2 id="latency-and-throughput">Latency and throughput</H2>
      <P>
        Latency is how long one request takes, from the moment the client
        sends it to the moment the response has arrived. Throughput is how
        many requests the system handles per second. They are different
        numbers and they fail differently.
      </P>
      <P>
        With a few clients, latency is usually flat. As you add clients, the
        server spends more time waiting for CPU, database connections or
        threads, and requests start to queue. Throughput keeps rising for a
        while, then levels off at whatever the system can manage. Past that
        point, extra clients don&apos;t get more work done. They only make
        every request slower, and eventually some time out. Finding where
        that point is, and whether it is comfortably above your real traffic,
        is most of what load testing is for.
      </P>

      <H2 id="averages">Why averages lie</H2>
      <P>
        The endpoint <C>/api/chaos/random-latency</C> is built to behave like
        a real service with a slow tail. According to its{" "}
        <A href="/docs/chaos">documentation</A>, about 90% of calls take 10 to
        100 ms on the server, 9% take 500 to 1500 ms, and 1% take 3 to 5
        seconds. That shape is common in practice: most requests hit a cache
        or a fast query, and a few hit a cold path, a lock or a garbage
        collection pause.
      </P>
      <P>
        This script sends 30 requests one after another, records how long
        each took from the client&apos;s side, and prints the mean and some
        percentiles. It needs Node 18 or later for the built-in{" "}
        <C>fetch</C>. Save it as <C>latency.mjs</C>.
      </P>
      <Code code={latencyScript} lang="javascript" label="latency.mjs" />
      <P>One run from a laptop on a home connection:</P>
      <Code code={latencyOutput} lang="text" label="Output" />
      <P>
        A percentile answers the question &quot;how slow were the slowest
        N% of requests&quot;. The p50, also called the median, is the value
        half the requests beat. The p95 means 95% of requests were at least
        that fast and 5% were slower. The p99 describes the worst 1%.
      </P>
      <P>
        In this run the mean and the median are close, and nothing was slow.
        That happens: with a 10% chance of a slow call on each request, 30
        requests will sometimes dodge all of them. An earlier run of the same
        script on the same day got a mean of 624 ms, a median of 353 ms, a
        p95 of 1800 ms and a p99 of 5153 ms. The median barely moved. The
        mean nearly doubled, because a couple of multi-second requests were
        enough to drag it up. If you only report the mean, you can&apos;t
        tell the difference between &quot;everything got a bit slower&quot;
        and &quot;most requests are fine but one user in a hundred waits five
        seconds&quot;. Those need different fixes.
      </P>
      <P>
        Two more things to notice. First, with 30 samples, the p99 is the
        single slowest request, because 99% of 30 rounds up to all 30. You
        need a few hundred samples before a p99 means much, and thousands
        before it is stable. Second, the server says most calls take under
        100 ms, but the median here was 320 ms. The difference is the
        network: distance to the server, the TLS handshake, and the time for
        the bytes to travel back. Where you measure from changes the numbers,
        so always write down where that was.
      </P>
      <Note>
        <P>
          Teams usually set targets on p95 or p99, not on the mean. &quot;p95
          under 300 ms&quot; is a statement about what almost every user
          sees. &quot;Average under 300 ms&quot; can be true while a
          noticeable share of users have a bad time.
        </P>
      </Note>

      <H2 id="curl-timing">Where the time goes</H2>
      <P>
        A single number for the whole request hides which part was slow.
        curl can break it down with <C>-w</C>, which prints variables after
        the transfer finishes. On Windows, run this in Git Bash or WSL, or
        replace <C>/dev/null</C> with <C>NUL</C> and use <C>curl.exe</C> in
        PowerShell.
      </P>
      <Code code={curlTiming} lang="curl" />
      <Code code={curlTimingOutput} lang="text" label="Output" />
      <P>
        The values are in seconds and each one counts from the start of the
        request, so you subtract to get the length of each step:
      </P>
      <Table
        head={["Step", "Calculation", "Time"]}
        rows={[
          ["DNS lookup", <C key="a">time_namelookup</C>, "74 ms"],
          ["TCP connect", <C key="b">time_connect - time_namelookup</C>, "29 ms"],
          ["TLS handshake", <C key="c">time_appconnect - time_connect</C>, "76 ms"],
          ["Waiting for the first byte", <C key="d">time_starttransfer - time_appconnect</C>, "323 ms"],
          ["Downloading the body", <C key="e">time_total - time_starttransfer</C>, "under 1 ms"],
        ]}
      />
      <P>
        The waiting step includes the server&apos;s processing time plus one
        trip across the network and back. If that step grows while the
        others stay the same, the server got slower. If DNS or connect time
        jumps, the problem is between you and the server, and no amount of
        backend tuning will fix it.
      </P>

      <H3>Cold and warm requests</H3>
      <P>
        You can pass curl several URLs in one command, and it reuses the
        connection for the later ones. Here are two requests to{" "}
        <C>/api/health</C> in one command, using the same <C>-w</C> format for
        each:
      </P>
      <Code code={curlReuse} lang="text" label="Output" />
      <P>
        The second request shows zero for DNS, connect and TLS, because none
        of them happened. It went over the connection the first request had
        already opened, and finished in 264 ms instead of 404 ms. Browsers,
        mobile apps and most HTTP libraries reuse connections the same way.
      </P>
      <P>
        This is the simplest form of a cold versus warm difference, and there
        are others. A server that started a few seconds ago may have empty caches and
        code that hasn&apos;t been optimised by the runtime yet. Some hosting
        platforms stop idle servers and start them again on the next request,
        which can add several seconds to that one call. When you measure, run
        a few warm-up requests first and leave them out of the numbers, or
        report cold and warm timings separately. Mixing them makes both
        meaningless.
      </P>

      <H2 id="load-test-types">Kinds of load test</H2>
      <P>
        Everything so far used one client sending one request at a time. A
        load test runs many clients at once. People use the following names,
        though teams are not always consistent about them.
      </P>
      <Ul>
        <li>
          A load test runs the traffic you expect on a normal busy day, for
          long enough to see whether latency and error rates stay within your
          targets.
        </li>
        <li>
          A stress test keeps increasing the load past that level until
          something breaks. The point is to learn what breaks first and
          whether the system recovers when the load drops.
        </li>
        <li>
          A spike test jumps from low to very high load in seconds, the way
          traffic does when a push notification goes out or a sale starts.
        </li>
        <li>
          A soak test runs normal load for hours. It finds problems that
          build up slowly: memory leaks, connection pools that never give
          connections back, log files filling a disk.
        </li>
      </Ul>
      <P>
        Load testing has a precondition that is easy to forget: you need
        permission, and you need an environment you are allowed to hurt.
        Run it against your own staging environment, sized like production if
        possible. Never point a load test at someone else&apos;s server. That
        includes this one. The API in these lessons is shared, so if you try
        the script below, keep it to a few virtual users for 30 seconds, as
        written.
      </P>

      <H2 id="k6">A small load test with k6</H2>
      <P>
        k6 is a free, open-source load testing tool. You write the test in
        JavaScript and run it from the command line. Other tools such as
        JMeter, Gatling and Locust do the same job; k6 is used here because
        the scripts are short. Install it from the k6 website, save this as{" "}
        <C>load.js</C>, and run <C>k6 run load.js</C>.
      </P>
      <Code code={k6Script} lang="javascript" label="load.js" />
      <P>
        The <C>options</C> block starts 3 virtual users. Each one runs the
        default function in a loop for 30 seconds: send a request, check the
        status, wait one second. Because of the <C>sleep(1)</C>, that works
        out to roughly 3 requests per second, around 90 in total. Without a
        sleep, each virtual user sends its next request the moment the last
        one finishes, which is far more load than the number 3 suggests.
      </P>
      <P>
        The <C>thresholds</C> are the assertions. This script fails if the
        p95 of request duration goes over 800 ms, or if more than 1% of
        requests fail. The 800 ms figure is an example. Pick yours from what
        your users need, and from what a measurement like the one above says
        is realistic from where the test runs.
      </P>
      <P>
        When the run ends, k6 prints a summary. The line to read first is{" "}
        <C>http_req_duration</C>, which shows the average, minimum, median,
        maximum, p90 and p95 of request times. <C>http_req_failed</C> is the
        share of requests that failed, and <C>http_reqs</C> is the total
        count with the rate per second, which is your throughput. The{" "}
        <C>checks</C> line shows how many of your <C>check()</C> calls passed.
        Each threshold is marked as passed or failed, and if any threshold
        fails, k6 exits with a non-zero exit code. That last part is what
        lets a CI pipeline treat a slow build like a failing one.
      </P>
      <P>
        A failed check does not fail the run by itself. Checks are counted
        and reported, and only thresholds decide the result. If a check
        matters, add a threshold on it, for example{" "}
        <C>checks: [&quot;rate&gt;0.99&quot;]</C>.
      </P>

      <H2 id="budgets">Performance budgets</H2>
      <P>
        A performance budget is a limit written down in advance, such as
        &quot;p95 under 500 ms for the product list at 50 requests per
        second&quot;. Without one, a load test produces numbers that everybody
        looks at and nobody acts on. With one, it produces a pass or a fail,
        the same as any other test.
      </P>
      <P>
        You can also put a loose time limit in ordinary functional tests. This
        is a test in the style of the <A href="/learn/automation">automation</A>{" "}
        lesson:
      </P>
      <Code code={budgetTest} lang="javascript" />
      <P>
        Keep a budget like this generous. A single request in a functional
        test is one sample, taken on a shared CI machine over a network you
        don&apos;t control, and it will occasionally be slow for reasons that
        have nothing to do with your code. A limit of 2 seconds catches an
        endpoint that has gone from 200 ms to 8 seconds, which is the kind of
        regression you want to hear about. Tight limits belong in load tests,
        where you have hundreds of samples and percentiles to judge them by.
        If a single-request budget fails now and then for no reason, that is
        a flaky test, and the <A href="/learn/ci-strategy">next lesson</A>{" "}
        covers what to do about those.
      </P>
      <P>
        Record results over time, too. A p95 that creeps from 180 ms to 260
        ms over ten releases never fails a 500 ms budget, but it tells you
        something is getting worse, and it is much cheaper to find the cause
        after one release than after ten.
      </P>

      <Exercise>
        <P>
          Run <C>latency.mjs</C> three times and write down the mean, p50 and
          p95 of each run. How much does each number move between runs? Which
          one would you trust to compare two versions of an API?
        </P>
        <P>
          Then change the URL to{" "}
          <C>https://api.testingapis.com/api/Products/1?delay=1</C>, which makes
          the server wait one second before answering, and lower <C>N</C> to
          10. Before you run it, predict the p50. Afterwards, use the curl
          timing command on the same URL and find which step the extra second
          shows up in.
        </P>
      </Exercise>
    </>
  );
}
