import { A, C, Code, Exercise, H2, H3, Note, Ol, P, Ul } from "@/components/lesson";

const productsTest = `// products.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "https://api.testingapis.com";

test("GET /api/Products/1 returns the product", async () => {
  const res = await fetch(\`\${BASE_URL}/api/Products/1\`);

  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /^application\\/json/);

  const product = await res.json();
  assert.equal(product.id, 1);
  assert.equal(typeof product.title, "string");
  assert.equal(typeof product.price, "number");
  assert.ok(product.price > 0, \`price should be positive, got \${product.price}\`);
});

test("GET /api/Products/9999 returns 404 with an error body", async () => {
  const res = await fetch(\`\${BASE_URL}/api/Products/9999\`);

  assert.equal(res.status, 404);

  const body = await res.json();
  assert.equal(body.status, 404);
  assert.match(body.message, /9999/);
});`;

const booksTest = `// books.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "https://api.testingapis.com";

const newBook = {
  title: "Automation test book",
  author: "QA Team",
  isbn: "9780000000001",
  genre: "testing",
  publishedYear: 2026,
  pages: 120,
  price: 9.99,
};

test("a created book can be read and then deleted", async (t) => {
  // Create
  const created = await fetch(\`\${BASE_URL}/api/Books\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newBook),
  });
  assert.equal(created.status, 201);
  const { data } = await created.json();
  const id = data.id;

  // Delete the book even if a later assertion fails.
  t.after(() => fetch(\`\${BASE_URL}/api/Books/\${id}\`, { method: "DELETE" }));

  // Read it back
  const read = await fetch(\`\${BASE_URL}/api/Books/\${id}\`);
  assert.equal(read.status, 200);
  const book = await read.json();
  assert.equal(book.title, newBook.title);
  assert.equal(book.author, newBook.author);
  assert.equal(book.price, newBook.price);

  // Delete it
  const deleted = await fetch(\`\${BASE_URL}/api/Books/\${id}\`, { method: "DELETE" });
  assert.equal(deleted.status, 200);

  // It is gone
  const gone = await fetch(\`\${BASE_URL}/api/Books/\${id}\`);
  assert.equal(gone.status, 404);
});`;

const runOutput = `$ node --test
✔ a created book can be read and then deleted (2241.8021ms)
✔ GET /api/Products/1 returns the product (446.0678ms)
✔ GET /api/Products/9999 returns 404 with an error body (320.9066ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2343.9797`;

const failOutput = `✖ failing tests:

test at fail.mjs:4:1
✖ GET /api/Products/1 returns the product (454.4497ms)
  AssertionError [ERR_ASSERTION]: price of product 1

  249.99 !== 249

      at TestContext.<anonymous> (file:///.../fail.mjs:8:10)
  ...`;

const expectStatus = `async function expectStatus(res, expected) {
  if (res.status !== expected) {
    const body = await res.text();
    assert.fail(\`\${res.url} returned \${res.status}, expected \${expected}. Body: \${body}\`);
  }
}

test("GET /api/Books/9999 returns the book", async () => {
  const res = await fetch("https://api.testingapis.com/api/Books/9999");
  await expectStatus(res, 200);
});`;

const expectStatusOutput = `✖ GET /api/Books/9999 returns the book (454.4073ms)
  AssertionError [ERR_ASSERTION]: https://api.testingapis.com/api/Books/9999 returned 404, expected 200. Body: {"status":404,"error":"Not Found","message":"Book with ID 9999 does not exist."}`;

const pythonTest = `# test_api.py
import os

import pytest
import requests

BASE_URL = os.environ.get("BASE_URL", "https://api.testingapis.com")


def test_get_product():
    res = requests.get(f"{BASE_URL}/api/Products/1", timeout=10)

    assert res.status_code == 200
    assert res.headers["Content-Type"].startswith("application/json")

    product = res.json()
    assert product["id"] == 1
    assert isinstance(product["title"], str)
    assert product["price"] > 0


def test_missing_product_returns_404():
    res = requests.get(f"{BASE_URL}/api/Products/9999", timeout=10)

    assert res.status_code == 404
    assert "9999" in res.json()["message"]


@pytest.fixture
def book():
    res = requests.post(
        f"{BASE_URL}/api/Books",
        json={"title": "Automation test book", "author": "QA Team", "price": 9.99},
        timeout=10,
    )
    assert res.status_code == 201
    created = res.json()["data"]
    yield created
    requests.delete(f"{BASE_URL}/api/Books/{created['id']}", timeout=10)


def test_created_book_can_be_read(book):
    res = requests.get(f"{BASE_URL}/api/Books/{book['id']}", timeout=10)

    assert res.status_code == 200
    assert res.json()["title"] == "Automation test book"


def test_deleted_book_is_gone(book):
    res = requests.delete(f"{BASE_URL}/api/Books/{book['id']}", timeout=10)
    assert res.status_code == 200

    res = requests.get(f"{BASE_URL}/api/Books/{book['id']}", timeout=10)
    assert res.status_code == 404`;

const pythonOutput = `$ pip install pytest requests
$ pytest -v test_api.py

test_api.py::test_get_product PASSED                                     [ 25%]
test_api.py::test_missing_product_returns_404 PASSED                     [ 50%]
test_api.py::test_created_book_can_be_read PASSED                        [ 75%]
test_api.py::test_deleted_book_is_gone PASSED                            [100%]`;

export default function Automation() {
  return (
    <>
      <P>
        By now you have sent a lot of requests by hand and checked the
        responses by eye. That works for exploring an API. It doesn&apos;t
        work for the tenth time you check the same thing after a release,
        because by then you are skimming, and skimming is how regressions get
        through. An automated test sends the same request and checks the same
        things every time, in a few hundred milliseconds, without getting
        bored.
      </P>
      <P>
        This lesson turns the manual checks from{" "}
        <A href="/learn/crud-testing">Testing a resource end to end</A> into
        code. The main example is JavaScript, using only what ships with
        Node.js 20 or later. There is a Python version after it. Pick whichever
        language your team uses. The ideas are the same.
      </P>

      <H2 id="what-a-test-is">What an automated API test is</H2>
      <P>
        Strip away the frameworks and an API test is three steps: send a
        request, read the response, and compare parts of it with what you
        expected. If every comparison holds, the test passes. If one fails,
        the test stops and reports which one.
      </P>
      <P>
        The comparisons are called assertions. You already know what to
        assert, because it&apos;s what you checked by hand: the status code,
        a few headers, and the fields in the body.
      </P>

      <H2 id="first-test">A first test file</H2>
      <P>
        Node.js has a test runner built in (<C>node:test</C>), an assertion
        module (<C>node:assert</C>) and <C>fetch</C>. So you need no packages
        at all. Make a folder, and save this as <C>products.test.mjs</C>:
      </P>
      <Code code={productsTest} lang="javascript" />
      <P>A few things about this file are deliberate.</P>
      <P>
        The base URL comes from an environment variable, with the public API
        as a default. The same tests can then run against your laptop, a
        staging server or production by changing one variable:{" "}
        <C>BASE_URL=https://staging.example.com node --test</C>. Hard-coding
        the host is the first thing people regret.
      </P>
      <P>
        The assertions go in the order status, headers, body. If the status
        is wrong, the body is probably an error message, and checking{" "}
        <C>product.title</C> on an error body gives a confusing failure about
        a missing title. Checking the status first gives you the real reason.
      </P>
      <P>
        The test checks types and ranges, not every value. It says the title
        is a string and the price is a positive number. It doesn&apos;t say
        the title is &quot;Wireless Noise-Cancelling Headphones&quot;, because
        product data changes, and a test that fails whenever someone edits a
        product description will be ignored within a month. Assert exact
        values only where the value is the point of the test: the{" "}
        <C>id</C> you asked for, the status code, an error message that must
        mention the missing ID.
      </P>

      <H2 id="running">Running it</H2>
      <P>
        Add the create-read-delete test from the next section as{" "}
        <C>books.test.mjs</C> in the same folder, then run{" "}
        <C>node --test</C>. Without arguments it finds files ending in{" "}
        <C>.test.mjs</C> (and a few other patterns) and runs them:
      </P>
      <Code code={runOutput} lang="text" label="Output" />
      <P>
        To see what a failure looks like, change the price check to{" "}
        <C>assert.equal(product.price, 249.0, &quot;price of product 1&quot;)</C>{" "}
        and run it again:
      </P>
      <Code code={failOutput} lang="text" label="Output" />
      <P>
        The message you passed as the third argument appears first, then the
        actual and expected values. Without that message you&apos;d get only{" "}
        <C>249.99 !== 249</C>, which in a suite of 200 tests tells you very
        little.
      </P>

      <H2 id="create-read-delete">A create, read, delete flow</H2>
      <P>
        Tests that change data need more care. Here is the book lifecycle as
        one test:
      </P>
      <Code code={booksTest} lang="javascript" />
      <P>
        The ID is taken from the create response, never hard-coded. The API
        assigns IDs, and the next ID depends on what everyone else has created
        since the server restarted. A test that expects the new book to be
        number 27 passes once.
      </P>
      <P>
        The <C>t.after</C> line registers the cleanup straight after the
        create. If the read assertion fails, the test stops there, but the
        cleanup still runs, so a failing test doesn&apos;t leave junk behind.
        When the test passes, the book is already deleted by the time the
        cleanup runs, so that second DELETE returns 404, which is harmless.
      </P>
      <Note title="Shared test servers">
        <P>
          This API is shared with everyone reading this tutorial, and on a
          real project the staging server is shared with your colleagues. Give
          test data a recognisable name like &quot;Automation test book&quot;
          so a stray record is easy to find, and never run destructive tests
          against data you didn&apos;t create.
        </P>
      </Note>

      <H3>One test or four</H3>
      <P>
        The flow above is one test with four stages. The alternative is four
        tests: create, read, update, delete, each depending on the one
        before. Don&apos;t do that. Test runners may run tests in any order
        or in parallel, and when the create test fails, the other three fail
        too with messages that point you at the wrong place.
      </P>
      <P>
        Each test should set up what it needs and pass or fail on its own.
        When the setup is shared, like &quot;there must be a book to
        read&quot;, put it in a helper or a fixture that every test calls,
        rather than in another test. The Python version below shows that
        pattern.
      </P>

      <H2 id="failure-messages">Failure messages you can act on</H2>
      <P>
        A failed test is read by someone in a hurry, often in a CI log, often
        not the person who wrote it. The most useful thing you can add is the
        response body when a status check fails. A small helper does it:
      </P>
      <Code code={expectStatus} lang="javascript" />
      <Code code={expectStatusOutput} lang="text" label="Output" />
      <P>
        Compare that with <C>404 !== 200</C>. The URL and the server&apos;s
        own message tell you it&apos;s a data problem, not a routing problem,
        before you open any file.
      </P>

      <H2 id="python">The same tests in Python</H2>
      <P>
        In Python, the usual pair is pytest for running tests and requests
        for HTTP. Install both with pip. This file covers the same cases,
        with the book setup moved into a fixture:
      </P>
      <Code code={pythonTest} lang="python" />
      <Code code={pythonOutput} lang="text" label="Output" />
      <P>
        The fixture creates a book, hands it to the test with{" "}
        <C>yield</C>, and deletes it afterwards, whether the test passed or
        not. Each test that takes <C>book</C> as an argument gets its own
        fresh one. That is the independence rule from earlier, handled by the
        framework. Also note <C>timeout=10</C> on every call: requests waits
        forever by default, and a test suite that hangs is worse than one that
        fails.
      </P>

      <H2 id="rules">Rules that keep a suite useful</H2>
      <P>
        Suites rarely die because the tests were wrong on day one. They die
        because they get slow and flaky and people stop trusting them. Most
        of that is avoidable.
      </P>
      <Ol>
        <li>
          Each test runs on its own, in any order. No test relies on data
          another test created.
        </li>
        <li>
          Check status, then headers, then body. A failure should point at the
          first thing that went wrong.
        </li>
        <li>
          One behaviour per test. &quot;Missing product returns 404&quot; and
          &quot;product has a positive price&quot; are two tests. When one
          fails, the name alone tells you what broke.
        </li>
        <li>
          Don&apos;t assert on values that change between runs: generated
          IDs, timestamps, random data, the total count of a shared list.
          Assert on their type or format instead, or compare them with
          something from the same run.
        </li>
        <li>
          Clean up what you create, and name it so leftovers are easy to
          spot.
        </li>
        <li>
          Configuration (base URL, credentials) comes from environment
          variables. Credentials never go in the test file or the repository.
        </li>
        <li>
          Set timeouts. A hung request should fail the test, not the whole
          pipeline.
        </li>
      </Ol>

      <H2 id="other-tools">Other tools</H2>
      <P>
        You don&apos;t have to write tests in a general-purpose language. Some
        teams prefer other tools, and you&apos;ll meet these on real projects:
      </P>
      <Ul>
        <li>
          Postman collections with test scripts, run from the command line
          with Newman. Popular where testers already use Postman by hand.
        </li>
        <li>REST Assured, a Java library with a fluent given/when/then style. Common in Java shops.</li>
        <li>
          Playwright&apos;s <C>request</C> API, useful when a team already
          uses Playwright for browser tests and wants API tests in the same
          suite.
        </li>
        <li>Karate, which writes API tests in a Gherkin-like text format with built-in JSON matching.</li>
      </Ul>
      <P>
        They all do the three steps from the start of this lesson. Choose the
        one that fits the language and tools your team already has, so that
        developers can read and fix the tests too. A suite only the tester
        can run tends to be abandoned when that tester moves on.{" "}
        <A href="/learn/ci-strategy">Running tests in CI</A> covers running a
        suite like this on every change.
      </P>

      <Exercise>
        <P>
          Extend the JavaScript suite (or the Python one) with these tests.
          Each should pass or fail on its own.
        </P>
        <Ul>
          <li>
            <C>GET /api/Products?limit=5</C> returns an array of exactly five
            items and an <C>X-Total-Count</C> header that is a number greater
            than or equal to five.
          </li>
          <li>
            <C>GET /api/Countries/code/IN</C> returns a country whose{" "}
            <C>code</C> is <C>IN</C> and whose <C>population</C> is a
            positive integer.
          </li>
          <li>
            Creating a movie with <C>POST /api/Movies</C>, updating its title
            with <C>PATCH /api/Movies/&#123;id&#125;</C>, and reading it back
            shows the new title. If the create fails, the error body says
            what is missing. Clean up afterwards.
          </li>
        </Ul>
        <P>
          Then run the suite with <C>BASE_URL</C> set to a wrong host and read
          the failure output. Would a colleague understand from that output
          alone what went wrong? If not, improve the messages.
        </P>
      </Exercise>
    </>
  );
}
