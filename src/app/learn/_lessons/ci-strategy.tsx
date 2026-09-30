import { A, C, Code, Exercise, H2, H3, Note, P, Table, Ul } from "@/components/lesson";

const dataTest = `
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "https://api.snap-test.in";

test("a created book can be read back", async (t) => {
  const title = \`CI test book \${crypto.randomUUID()}\`;

  const created = await fetch(\`\${BASE_URL}/api/Books\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author: "Test Author", genre: "testing", pages: 100 }),
  });
  assert.equal(created.status, 201);
  const { data } = await created.json();

  // Runs after the test, whether it passed or failed.
  t.after(() => fetch(\`\${BASE_URL}/api/Books/\${data.id}\`, { method: "DELETE" }));

  const res = await fetch(\`\${BASE_URL}/api/Books/\${data.id}\`);
  assert.equal(res.status, 200);
  const book = await res.json();
  assert.equal(book.title, title);
});
`;

const tokenExample = `
// A request to your own API that needs a token.
const token = process.env.API_TOKEN;
if (!token) throw new Error("Set API_TOKEN before running the tests");

const res = await fetch(\`\${BASE_URL}/api/account\`, {
  headers: { Authorization: \`Bearer \${token}\` },
});
`;

const workflow = `
name: API tests

on:
  push:
  pull_request:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:

jobs:
  api-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Run API tests
        env:
          BASE_URL: https://api.snap-test.in
          API_TOKEN: \${{ secrets.API_TOKEN }}
        run: >
          node --test
          --test-reporter=spec --test-reporter-destination=stdout
          --test-reporter=junit --test-reporter-destination=report.xml
          "tests/**/*.test.mjs"

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: api-test-report
          path: report.xml
`;

const junitOutput = `
<?xml version="1.0" encoding="utf-8"?>
<testsuites>
	<testcase name="health check reports healthy" time="0.462305" classname="test" file="tests/smoke.test.mjs"/>
	<testcase name="product 1 responds within 2 seconds" time="0.296630" classname="test" file="tests/smoke.test.mjs"/>
	<!-- tests 2 -->
	<!-- suites 0 -->
	<!-- pass 2 -->
	<!-- fail 0 -->
	<!-- cancelled 0 -->
	<!-- skipped 0 -->
	<!-- todo 0 -->
	<!-- duration_ms 948.298 -->
</testsuites>
`;

const skipExample = `
test("job finishes within 10 seconds", { skip: "flaky, see QA-412" }, async () => {
  // ...
});
`;

const smokeTest = `
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "https://api.snap-test.in";

test("health check reports healthy", async () => {
  const res = await fetch(\`\${BASE_URL}/api/health\`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "healthy");
});

test("product 1 responds within 2 seconds", async () => {
  const start = performance.now();
  const res = await fetch(\`\${BASE_URL}/api/Products/1\`);
  await res.json();
  const ms = performance.now() - start;
  assert.equal(res.status, 200);
  assert.ok(ms < 2000, \`took \${Math.round(ms)} ms, budget is 2000 ms\`);
});
`;

const smokeOutput = `
$ node --test "tests/smoke.test.mjs"
✔ health check reports healthy (433.3956ms)
✔ product 1 responds within 2 seconds (283.3592ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 849.4649
`;

export default function CiStrategy() {
  return (
    <>
      <P>
        A test that only runs when someone remembers to run it will stop
        being run within a few weeks. Continuous integration (CI) fixes that
        by running the tests automatically on every change, on a machine
        nobody has to look after. This lesson covers putting the tests from
        earlier lessons into a pipeline, and the questions that come with it:
        which tests to write, where their data comes from, where secrets
        live, and what to do when a test fails for no reason.
      </P>

      <H2 id="pyramid">What to test at which level</H2>
      <P>
        The usual way to describe this is the test pyramid: many small, fast
        tests at the bottom and a few large, slow ones at the top. For an
        API, the layers look roughly like this.
      </P>
      <Table
        head={["Level", "What it checks", "Who usually writes it", "Speed"]}
        rows={[
          ["Unit", "One function or class, with no network or database", "Developers", "Milliseconds"],
          ["API", "One running service over HTTP, as in these lessons", "Testers and developers", "Tens to hundreds of ms per request"],
          ["Contract", "That a service still matches what its consumers expect", "Both sides of the contract", "Fast, no full environment needed"],
          ["End to end", "A real user flow through the UI and several services", "Testers", "Seconds to minutes per test"],
        ]}
      />
      <P>
        The shape is a guideline, not a rule. What it gets right is the cost.
        A rule such as &quot;price must be positive&quot; can be checked in a
        unit test in a millisecond, so there is no reason to check all its
        variations through the UI. API tests are good at the things unit
        tests can&apos;t see: routing, serialisation, authentication,
        database constraints, how services behave together. End-to-end tests
        are the only way to check the screens, but they are slow and fragile,
        so keep them to the handful of flows that would cost real money if
        they broke, such as signing up or paying.
      </P>
      <P>
        Contract testing was covered in{" "}
        <A href="/learn/schemas-contracts">Schemas and contract testing</A>.
        In a pipeline it usually runs next to the unit tests, because it
        doesn&apos;t need the whole system running.
      </P>

      <H2 id="what-to-automate">What to automate and what to leave manual</H2>
      <P>
        Automate checks you will want to repeat on every change: status
        codes, validation rules, who may do what, the shape of responses,
        bugs that were fixed once and must not come back. These are cheap to
        run a thousand times and boring to do by hand, which is exactly when
        people start skipping them.
      </P>
      <P>
        Leave new and unclear things to a person first. When a feature is new,
        nobody knows all the ways it can go wrong, and a script only checks
        what its author thought of. A tester poking at it by hand finds the
        questions: what happens if I send the same request twice, why does
        this error message mention a database table, why is this field a
        string here and a number there. Once the behaviour is understood and
        agreed, turn the useful parts into automated tests. Automating
        earlier than that mostly produces tests that encode whatever the
        code happened to do on the day.
      </P>

      <H3>Exploratory testing charters</H3>
      <P>
        Manual testing works better with a little structure. A charter is a
        one-line mission for a time-boxed session, often written in the form
        &quot;Explore <em>target</em> with <em>resources</em> to discover{" "}
        <em>information</em>&quot;. For example:
      </P>
      <Ul>
        <li>
          Explore <C>PATCH /api/Books/&#123;id&#125;</C> with partial,
          malformed and wrongly typed bodies to discover which fields are
          checked and which are silently accepted.
        </li>
        <li>
          Explore the pagination endpoints with data that changes between
          requests to discover whether items are skipped or repeated.
        </li>
      </Ul>
      <P>
        Give each session 60 to 90 minutes, take notes as you go, and write
        up what you tried and what you found. Bugs become bug reports.
        Behaviour worth protecting becomes an automated test. Questions go to
        whoever owns the API.
      </P>

      <H2 id="test-data">Test data</H2>
      <P>
        Most tests that pass on one laptop and fail in CI fail because of
        data. The test expected product 1 to cost 249.99 and someone changed
        it. Or two test runs created a user with the same email at the same
        time. Or a test deleted a record another test was using. There are a
        few common ways to avoid this, and most suites use more than one.
      </P>
      <P>
        The first is for each test to create what it needs and delete it
        afterwards. Give created records unique values, so two runs at the
        same time can&apos;t collide. In <C>node:test</C>, register the
        cleanup with <C>t.after()</C> so it runs even when an assertion
        fails:
      </P>
      <Code code={dataTest} lang="javascript" label="tests/books.test.mjs" />
      <P>
        The cleanup is registered after the create succeeds, so a failed
        create doesn&apos;t try to delete a record that doesn&apos;t exist.
        Running this against the API created a book, read it back, and
        deleted it: searching for <C>CI test book</C> afterwards returned an
        empty list.
      </P>
      <P>
        The second approach is to reset to known data before the suite runs.
        If you own the system, that might be a script that loads a database
        snapshot into a test environment. Some APIs offer a reset endpoint
        for this; this one has <C>POST /api/cache/etag/reset</C> for its ETag
        document and <C>POST /api/RateLimit/reset</C> for the rate limit
        window. Resetting is fast and gives every test the same starting
        point, but it only works when nothing else shares the environment.
      </P>
      <P>
        The third is to read reference data that doesn&apos;t change, such as
        the list of countries, and assert on it freely. Be honest about which
        data really never changes. On a shared API like this one, anyone can
        edit or delete product 1, so a test that asserts on its exact price is
        betting on other people.
      </P>

      <H2 id="config-and-secrets">Configuration and secrets</H2>
      <P>
        The same tests should run against your laptop, a staging server and
        production without editing the code. Read anything that differs
        between them from environment variables: the base URL, credentials,
        timeouts. The tests in this tutorial already do this with{" "}
        <C>process.env.BASE_URL</C>.
      </P>
      <P>
        Tokens and passwords get the same treatment, with one extra rule: they
        never go into the repository. Not in the test file, not in a config
        file, not in a commented-out line. Git keeps history, so a token
        committed and then deleted is still in the repository for anyone who
        looks. If you keep local values in a <C>.env</C> file, add it to{" "}
        <C>.gitignore</C> first. Fail loudly when a secret is missing, so a
        misconfigured pipeline stops with a clear message instead of
        producing a page of confusing 401s:
      </P>
      <Code code={tokenExample} lang="javascript" />
      <P>
        In CI, store secrets in the CI system&apos;s secret store. GitHub
        Actions calls them repository secrets, under Settings, then Secrets
        and variables, then Actions. The workflow reads them by name, and
        GitHub masks their values if they appear in the log. That masking is
        a safety net, not permission to print them.
      </P>

      <H2 id="github-actions">A pipeline with GitHub Actions</H2>
      <P>
        GitHub Actions runs workflows defined in YAML files under{" "}
        <C>.github/workflows/</C> in your repository. This one assumes your
        tests are <C>.test.mjs</C> files in a <C>tests</C> folder, written
        with <C>node:test</C> as in the{" "}
        <A href="/learn/automation">automation</A> lesson. They have no
        dependencies, so there is no install step. If yours use packages, add{" "}
        <C>run: npm ci</C> before the test step.
      </P>
      <Code code={workflow} lang="text" label=".github/workflows/api-tests.yml" />
      <P>
        The <C>on</C> section says when it runs: on every push and pull
        request, every day at 06:00 UTC, and whenever you start it by hand
        from the Actions tab. The scheduled run matters for API tests in
        particular. Your code might not change for a week, but the API you
        depend on can, and a daily run tells you on the day it happens.
      </P>
      <P>
        <C>timeout-minutes</C> stops a hung test from holding a runner for
        the default six hours. The test step passes a glob pattern to{" "}
        <C>node --test</C>. Quote it, so Node expands it rather than the
        shell. Passing a folder name such as <C>tests</C> on its own
        doesn&apos;t work; Node treats it as a file path. The{" "}
        <C>API_TOKEN</C> line shows how a secret gets into the tests. This
        practice API doesn&apos;t need one, so leave it out or point it at
        your own.
      </P>

      <H3>Reports</H3>
      <P>
        The two <C>--test-reporter</C> pairs send the usual readable output to
        the log and write a JUnit XML file at the same time. JUnit XML is an
        old format from the Java world that nearly every CI system can read.
        GitLab, Jenkins and Azure DevOps show it as a list of tests with
        failures highlighted. GitHub doesn&apos;t display it on its own; the
        workflow uploads it as an artifact you can download, and there are
        marketplace actions that turn it into a summary if you want one. For
        the smoke tests below, the file looks like this (file paths
        shortened):
      </P>
      <Code code={junitOutput} lang="xml" label="report.xml" />
      <P>
        <C>if: always()</C> on the upload step matters. Without it, the step
        is skipped when the tests fail, which is the one time you want the
        report.
      </P>

      <H2 id="smoke-tests">Smoke tests after a deploy</H2>
      <P>
        A smoke test is a very short suite that runs straight after a
        deployment, against the environment that was deployed to, to answer
        one question: is it up and answering at all. It should take seconds,
        not minutes. Check the health endpoint, one or two important reads,
        and maybe a login. Leave everything else to the main suite.
      </P>
      <Code code={smokeTest} lang="javascript" label="tests/smoke.test.mjs" />
      <Code code={smokeOutput} lang="text" label="Output" />
      <P>
        Run it as the last step of the deploy job, with <C>BASE_URL</C> set
        to the environment that was deployed. If it fails, roll back or
        alert someone, depending on how your team deploys. A health endpoint
        on its own proves less than it seems: many return 200 as long as the
        process is running, even when the database is down. That is why the
        example also fetches a real record.
      </P>

      <H2 id="flaky-tests">Flaky tests</H2>
      <P>
        A flaky test passes and fails on the same code. It is the most
        corrosive problem a test suite can have, because once people learn
        that red sometimes means nothing, they stop reading red. Then a real
        failure gets rerun until it goes green and shipped.
      </P>
      <P>
        In API suites, flakiness nearly always comes from one of a short list
        of causes: shared data that another test or person changed, tests
        that depend on running in a particular order, checking an async job
        once instead of polling until it finishes (see{" "}
        <A href="/learn/async-apis">Async jobs, webhooks and streams</A>),
        timing budgets that are too tight for a shared CI machine, rate
        limits hit by a parallel run, and real network errors.
      </P>
      <P>
        When a test flakes, don&apos;t leave it failing in the main suite and
        don&apos;t delete it. Quarantine it: skip it with a reason that points
        to a ticket, so it stays visible and someone owns it.
      </P>
      <Code code={skipExample} lang="javascript" />
      <P>
        Then find the cause. Run it in a loop, look at what differs between
        passing and failing runs, check which data it touches. Fix it, and
        take it out of quarantine.
      </P>
      <P>
        What not to do is wrap the test in automatic retries and move on.
        Retrying a whole test hides the failure without explaining it, and
        some intermittent failures are real bugs: a race condition that fails
        one request in twenty in your test also fails one request in twenty
        for users. Retrying a single request inside a test is a different
        matter. If the API is documented to return 503 under load and
        clients are expected to retry, your test client can do the same,
        with the backoff rules from{" "}
        <A href="/learn/reliability">Timeouts, retries and rate limits</A>.
        The difference is that you know why the retry is there.
      </P>

      <Note>
        <P>
          Tests that run against a shared or public API, like this one, will
          flake more than tests against your own environment. Someone else may
          be creating records, hitting the rate limit or restarting the
          server. That is realistic practice, but for a real project you want
          a test environment that only your pipeline uses.
        </P>
      </Note>

      <H2 id="next">Where to go next</H2>
      <P>
        This is the last lesson. The fastest way to get better from here is
        to test things that behave oddly. This API has a lot of them:{" "}
        <A href="/docs/edge-cases">edge cases</A> returns awkward JSON,{" "}
        <A href="/docs/chaos">chaos</A> fails on purpose, and{" "}
        <A href="/docs/formats">formats</A> has responses whose headers and
        bodies don&apos;t agree. Write tests for them and see which of your
        assumptions break. When you need to know exactly what HTTP says about
        a method, header or status code, the reference is{" "}
        <A href="https://www.rfc-editor.org/rfc/rfc9110">RFC 9110</A>. It is
        long, but the sections are self-contained. For security, read the{" "}
        <A href="https://owasp.org/API-Security/">OWASP API Security Top 10</A>{" "}
        alongside the <A href="/learn/security-testing">security lesson</A>.
        After that, take an API you use at work and write down what you would
        test first.
      </P>

      <Exercise>
        <P>
          Put the smoke tests and the books test from this lesson in a{" "}
          <C>tests</C> folder in a new GitHub repository, add the workflow
          file, and push. Check the run in the Actions tab and download the
          report.
        </P>
        <P>
          Then break it on purpose. Change the budget in the smoke test to 1
          ms and push again. Read the failure message in the log and in the
          JUnit file. Is it clear enough that someone who didn&apos;t write
          the test would know what went wrong? Finally, add{" "}
          <C>?error=503</C> to the health check URL, which makes this API
          return a simulated 503, and confirm the pipeline goes red for the
          right reason. Put both changes back when you are done.
        </P>
      </Exercise>
    </>
  );
}
