import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const found404 = `HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{"status":404,"error":"Not Found","message":"Product with ID 9999 does not exist."}`;

const empty404 = `HTTP/1.1 404 Not Found
Content-Length: 0`;

const bugReport = `Title: GET /api/Products/{id} returns an empty 404 for non-numeric
       and out-of-range IDs, instead of the JSON error body

Environment: https://api.snap-test.in, 30 Sep 2026

Steps:
  curl -i https://api.snap-test.in/api/Products/9999
  curl -i https://api.snap-test.in/api/Products/abc
  curl -i https://api.snap-test.in/api/Products/2147483648

Expected:
  All three return 404 with Content-Type: application/json and a body
  like {"status":404,"error":"Not Found","message":"..."}, as documented
  under "Responses and errors" in the API reference.

Actual:
  9999        404, JSON body with a message
  abc         404, Content-Length: 0, no Content-Type, no body
  2147483648  404, empty body (one above the int32 maximum; 2147483647
              returns the JSON error)

Impact:
  Clients that parse every error body as JSON fail on the empty
  responses. The empty 404 also looks like "this URL does not exist"
  rather than "this product does not exist".

Notes:
  Probably the route only matches int32 values, so other input never
  reaches the controller. Could be intended; if so, the docs should say
  which errors have no body.`;

export default function TestCases() {
  return (
    <>
      <P>
        Up to now you have been sending requests and looking at what comes
        back. Testing starts when you decide, before sending, what should come
        back, and then compare. That decision written down is a test case.
        This lesson is about writing them, and about choosing which ones to
        write, because you can&apos;t send every possible request.
      </P>

      <H2 id="what-is-a-test-case">What a test case contains</H2>
      <P>
        Teams use different templates, but nearly all of them have the same
        parts:
      </P>
      <Table
        head={["Part", "What goes in it", "Example"]}
        rows={[
          ["ID", "A short reference so people can talk about it", "PROD-GET-03"],
          ["Title", "What is being checked, in one line", "Unknown product ID returns 404"],
          ["Preconditions", "What must be true before you start", "No product with ID 9999 exists"],
          ["Request", "Method, URL, headers and body", <C key="r">GET /api/Products/9999</C>],
          ["Expected result", "Status, important headers, body", "404, JSON body whose message names ID 9999"],
          ["Actual result", "Filled in when you run it", "As expected"],
        ]}
      />
      <P>
        The expected result is the part people write badly. &quot;Returns an
        error&quot; is not an expected result, because almost anything passes
        it. Be specific about the status code, the headers that matter
        (usually <C>Content-Type</C>, sometimes caching or location headers),
        and the body: which fields must be there, with which types and values.
        If you can&apos;t say what the right answer is, you have found a
        question for the developer or the product owner, and that is worth
        asking before you test anything.
      </P>
      <P>
        Where does the expected result come from? The documentation, the
        ticket that described the feature, the way similar endpoints in the
        same API behave, and sometimes plain common sense (a price shouldn&apos;t
        be negative). When these sources disagree, write down which one you
        followed.
      </P>

      <H2 id="positive-negative">Positive and negative tests</H2>
      <P>
        A positive test sends a valid request and checks that it works:
        product 1 exists, so <C>GET /api/Products/1</C> returns it. A negative
        test sends something the API should refuse and checks that it refuses
        properly: the right status, a useful message, and no side effects.
      </P>
      <P>
        Beginners write mostly positive tests, because they follow the
        feature description. Developers have usually tried the positive path
        themselves before handing the work over. The negative ones are where
        you find things. As a rough guide, expect to write more negative tests
        than positive ones for any endpoint that takes input.
      </P>

      <H2 id="partitioning">Equivalence classes</H2>
      <P>
        The list endpoint <C>GET /api/Products</C> accepts a <C>limit</C>{" "}
        parameter. The <A href="/docs">API reference</A> says it is the page
        size, from 1 to 100. There are infinitely many values you could send.
        Equivalence partitioning means grouping the inputs that the server
        should treat the same way, and testing one value from each group
        instead of all of them:
      </P>
      <Table
        head={["Class", "Example value", "Expected"]}
        rows={[
          ["Valid, in range", <C key="1">limit=10</C>, "Ten products"],
          ["Below range", <C key="2">limit=-5</C>, "Rejected, or clamped to the minimum"],
          ["Above range", <C key="3">limit=500</C>, "Rejected, or clamped to 100"],
          ["Not a number", <C key="4">limit=abc</C>, "Rejected with 400"],
          ["Not an integer", <C key="5">limit=2.5</C>, "Rejected with 400"],
          ["Empty", <C key="6">limit=</C>, "Treated as missing"],
          ["Missing", "no limit", "Every product, as documented"],
        ]}
      />
      <P>
        Notice the &quot;rejected, or clamped&quot; entries. The docs
        don&apos;t say what happens outside the range, so there are two
        reasonable behaviours. Either is defensible. What you are testing is
        that the API does one of them, consistently, and doesn&apos;t crash
        or return something nonsensical.
      </P>

      <H2 id="boundaries">Boundary values</H2>
      <P>
        Bugs cluster at the edges of ranges, because that is where developers
        write <C>&lt;</C> when they meant <C>&lt;=</C>. Boundary value analysis
        means testing the edge and one step either side of it. For a range of
        1 to 100 that gives 0, 1, 2, 99, 100 and 101. Here is what this API
        actually does with those and the other classes. The{" "}
        <C>X-Per-Page</C> header reports the page size the server used.
      </P>
      <Table
        head={["Request", "Status", "Items returned", "X-Per-Page"]}
        rows={[
          [<C key="a">?limit=0</C>, "200", "1", "1"],
          [<C key="b">?limit=1</C>, "200", "1", "1"],
          [<C key="c">?limit=-1</C>, "200", "1", "1"],
          [<C key="d">?limit=100</C>, "200", "20 (all of them)", "100"],
          [<C key="e">?limit=101</C>, "200", "20 (all of them)", "100"],
          [<C key="f">?limit=abc</C>, "200", "20", "20"],
          [<C key="g">?limit=2.5</C>, "200", "20", "20"],
          [<C key="h">?limit=</C>, "200", "20", "20"],
        ]}
      />
      <Run path="/api/Products?limit=0" showHeaders={["x-per-page", "x-total-count"]} />
      <P>
        Reading the results: values below 1 are clamped up to 1, values above
        100 are clamped down to 100, and anything that isn&apos;t an integer
        is ignored as if <C>limit</C> were missing. None of this is written
        down, but it is consistent, so it is probably deliberate. Two things
        still deserve a note in your test report. <C>limit=0</C> returning one
        item is surprising; a client that asks for zero items (to read the
        total count cheaply, say) gets a product it didn&apos;t want. And{" "}
        <C>limit=abc</C> being silently ignored means a typo in a client goes
        unnoticed, where a 400 would have caught it.
      </P>
      <P>
        There is also a lesson about test data here. The API has only 20
        products, so <C>limit=100</C> and <C>limit=101</C> return the same
        body. You couldn&apos;t tell from the body that 101 was clamped. The
        header showed it. When a boundary is bigger than your data, either
        find another signal like this one or create enough records to reach
        the boundary.
      </P>

      <H3>Boundaries hide in IDs too</H3>
      <P>
        The reference lists the <C>id</C> in <C>/api/Products/{"{id}"}</C> as
        an int32, a 32-bit integer whose largest value is 2,147,483,647. That
        is a boundary worth testing:
      </P>
      <Table
        head={["Request", "Status", "Body"]}
        rows={[
          [<C key="1">/api/Products/20</C>, "200", "Product 20, the last one"],
          [<C key="2">/api/Products/21</C>, "404", "JSON error message"],
          [<C key="3">/api/Products/0</C>, "404", "JSON error message"],
          [<C key="4">/api/Products/-1</C>, "404", "JSON error message"],
          [<C key="5">/api/Products/2147483647</C>, "404", "JSON error message"],
          [<C key="6">/api/Products/2147483648</C>, "404", "Empty"],
          [<C key="7">/api/Products/abc</C>, "404", "Empty"],
          [<C key="8">/api/Products/1.5</C>, "404", "Empty"],
          [<C key="9">/api/Products/01</C>, "200", "Product 1"],
        ]}
      />
      <P>
        Two things stand out. Everything that isn&apos;t a valid int32 gets a
        404 with no body at all, while valid-but-missing IDs get a JSON error.
        And <C>01</C> is accepted as 1. The second is harmless here, but on an
        API that caches responses by URL, <C>/1</C> and <C>/01</C> would be
        cached separately. Neither result is obviously wrong. Both are worth
        knowing about.
      </P>

      <H2 id="test-case-table">A set of test cases for one endpoint</H2>
      <P>
        Put together, a reasonable first set of test cases for{" "}
        <C>GET /api/Products/{"{id}"}</C> looks like this. It isn&apos;t
        everything you could test, but it covers each class once and each
        boundary.
      </P>
      <Table
        head={["ID", "Request", "Expected result"]}
        rows={[
          ["PROD-GET-01", <C key="1">GET /api/Products/1</C>, "200, JSON, id is 1, title is a non-empty string, price is a number above 0"],
          ["PROD-GET-02", <C key="2">GET /api/Products/20</C>, "200, the highest seeded ID"],
          ["PROD-GET-03", <C key="3">GET /api/Products/21</C>, "404, JSON error body naming ID 21"],
          ["PROD-GET-04", <C key="4">GET /api/Products/0</C>, "404, JSON error body"],
          ["PROD-GET-05", <C key="5">GET /api/Products/-1</C>, "404, JSON error body"],
          ["PROD-GET-06", <C key="6">GET /api/Products/abc</C>, "400 or 404, with a JSON error body"],
          ["PROD-GET-07", <C key="7">GET /api/Products/2147483648</C>, "400 or 404, with a JSON error body"],
          ["PROD-GET-08", <C key="8">HEAD /api/Products/1</C>, "Same status and headers as GET, no body"],
          ["PROD-GET-09", <C key="9">GET /api/Products/1 twice</C>, "Identical bodies both times"],
        ]}
      />
      <P>
        PROD-GET-06 and 07 fail against the current API, because the body is
        empty. PROD-GET-08 fails too: <C>HEAD /api/Products/1</C> returns 405
        Method Not Allowed, while the newer resources such as{" "}
        <C>/api/Books/{"{id}"}</C> support HEAD. Whether HEAD support is
        expected here is a question for whoever owns the API. That is fine.
        A test case records what should happen; a failing test case is how
        you find out it doesn&apos;t. PROD-GET-02 has
        a weakness: if someone deletes product 20 or adds product 21, it
        stops meaning what it says. The{" "}
        <A href="/learn/crud-testing">next lesson</A> shows how to create your
        own test data so tests don&apos;t depend on records someone else
        controls.
      </P>

      <H2 id="bug-reports">Writing a bug report</H2>
      <P>
        When a test case fails, you write it up. A good bug report lets a
        developer reproduce the problem in under a minute without asking you
        anything. Using the empty 404s from above as the example, compare the
        two responses first:
      </P>
      <Code code={found404} lang="text" label="GET /api/Products/9999" />
      <Code code={empty404} lang="text" label="GET /api/Products/abc" />
      <P>A report might read:</P>
      <Code code={bugReport} lang="text" label="Bug report" />
      <P>What makes this report useful:</P>
      <Ul>
        <li>
          The title says what is wrong and where, so it is clear in a list of
          fifty tickets.
        </li>
        <li>
          The steps are commands someone can paste. No &quot;call the product
          endpoint with a bad ID&quot;.
        </li>
        <li>
          Expected behaviour points at a source (the docs), so it isn&apos;t
          only your preference.
        </li>
        <li>
          It shows the pattern rather than a single example. Three requests with a
          working one for comparison say more than one failing request.
        </li>
        <li>
          It states the impact on a real client. Developers prioritise by
          impact, and &quot;inconsistent&quot; alone rarely gets fixed.
        </li>
        <li>
          It admits uncertainty. The behaviour may be intended, and the
          report says what would resolve it either way (fix the code, or fix
          the docs).
        </li>
      </Ul>
      <Note>
        <P>
          Be careful with the word &quot;bug&quot; when the spec is silent.
          Calling something a defect when it was a deliberate choice costs you
          credibility for the next report. &quot;Unexpected behaviour&quot; or
          &quot;question&quot; are fine labels, and many teams have a separate
          ticket type for them.
        </P>
      </Note>

      <Exercise>
        <P>
          Pick <C>GET /api/Books/{"{id}"}</C> or{" "}
          <C>GET /api/Countries/code/{"{code}"}</C>. Look up the endpoint in
          the <A href="/docs">API reference</A>, then:
        </P>
        <Ul>
          <li>List the equivalence classes for the path parameter.</li>
          <li>Pick the boundary values. For country codes, think about length and letter case.</li>
          <li>
            Write at least eight test cases in the table format above, with
            specific expected results.
          </li>
          <li>Run them with curl and fill in the actual results.</li>
        </Ul>
        <P>
          If anything behaves differently from what you expected, write a
          bug report for it using the structure above, including what you
          aren&apos;t sure about.
        </P>
      </Exercise>
    </>
  );
}
