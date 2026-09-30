import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const rawResponse = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
x-powered-by: APIBee

{"status":"healthy","uptimeSeconds":3542,"timestamp":"2026-09-30T18:28:12Z"}`;

const status503 = `HTTP/1.1 503 Service Unavailable
Content-Type: application/json; charset=utf-8
retry-after: 5

{
  "status": 503,
  "statusText": "Service Unavailable",
  "category": "server-error",
  "message": "This is a 503 response. Use /api/status/{code} to request any status."
}`;

const status302 = `HTTP/1.1 302 Found
Content-Type: application/json; charset=utf-8
location: /api/echo`;

const listHeaders = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
x-page: 3
x-per-page: 2
x-total-count: 20
x-total-pages: 10
x-ratelimit-limit: 1000
x-ratelimit-remaining: 999
x-ratelimit-reset: 1721300000`;

const noContent = `HTTP/1.1 204 No Content
x-powered-by: APIBee`;

const wrongType = `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

{"id":1,"name":"Alice Johnson","email":"alice@apibee.dev","roles":["admin","editor"],"active":true,"score":98.5,"manager":null}`;

const simulated = `HTTP/1.1 503 Service Unavailable
Content-Type: application/json; charset=utf-8
x-simulated: true

{
  "status": 503,
  "error": "Service Unavailable",
  "message": "Simulated error. Use ?error={code} to test different status codes.",
  "simulated": true
}`;

export default function HttpResponses() {
  return (
    <>
      <P>
        Every request gets exactly one response (unless the connection breaks,
        which is its own kind of answer and comes up in{" "}
        <A href="/learn/reliability">a later lesson</A>). A response has three
        parts: a status line, headers and a body. New testers tend to look
        only at the body, because that is where the data is. Most of the bugs
        that slip past them are in the other two parts.
      </P>

      <H2 id="raw-response">What a response looks like</H2>
      <P>
        Like the request, an HTTP/1.1 response is plain text. This is the
        response to <C>GET /api/health</C>, as curl shows it with the{" "}
        <C>-i</C> option (which prints the headers along with the body). A few
        infrastructure headers are removed.
      </P>
      <Code code={rawResponse} lang="text" label="Raw response" />
      <P>
        The first line is the status line: protocol version, a three-digit
        status code and a short reason phrase. Then come headers, one per
        line, then an empty line, then the body. The reason phrase is only for
        humans. Clients and tests should look at the number. HTTP/2 drops the
        reason phrase entirely, so a test that checks for the text{" "}
        <C>&quot;OK&quot;</C> can break when the server upgrades.
      </P>

      <H2 id="status-codes">Status code classes</H2>
      <P>
        The first digit of the status code tells you the class of the
        response. You can often judge a result from that digit alone.
      </P>
      <Table
        head={["Class", "Meaning", "Who is at fault"]}
        rows={[
          ["1xx", "Informational. The request is still in progress.", "Nobody. You rarely see these directly."],
          ["2xx", "Success. The server did what you asked.", "Nobody."],
          ["3xx", "Redirection. Look somewhere else.", "Nobody. The client has to follow up."],
          ["4xx", "Client error. The request was wrong.", "The client: bad input, no permission, wrong URL."],
          ["5xx", "Server error. The request may have been fine.", "The server or something behind it."],
        ]}
      />
      <P>
        That last column is the reason status codes matter so much in
        testing. A 4xx says &quot;fix your request&quot;. A 5xx says
        &quot;something broke on our side&quot;. If you send garbage and get a
        500, that is a bug even though the request was bad, because the
        server crashed where it should have rejected the input politely with
        a 400. Finding those 500s is one of the most productive things a new
        tester can do.
      </P>

      <H3>The codes you will see most</H3>
      <Table
        head={["Code", "Name", "Typical use"]}
        rows={[
          ["200", "OK", "The request worked and the body has the result."],
          ["201", "Created", "A POST created a new record."],
          ["204", "No Content", "It worked and there is deliberately no body. Common after DELETE."],
          ["301 / 302", "Moved Permanently / Found", "The resource is at the URL in the Location header."],
          ["304", "Not Modified", "Your cached copy is still current. Covered with caching."],
          ["400", "Bad Request", "The request is malformed or a value is invalid."],
          ["401", "Unauthorized", "No credentials, or wrong ones. Despite the name, it means unauthenticated."],
          ["403", "Forbidden", "Credentials are fine, but this user may not do this."],
          ["404", "Not Found", "Nothing at this URL, or no record with this ID."],
          ["405", "Method Not Allowed", "The URL exists but not with this method."],
          ["409", "Conflict", "The request clashes with the current state, such as a duplicate email."],
          ["422", "Unprocessable Content", "The syntax is fine but the data breaks a rule."],
          ["429", "Too Many Requests", "You hit a rate limit. Slow down."],
          ["500", "Internal Server Error", "An unhandled error on the server."],
          ["502", "Bad Gateway", "A proxy got a bad answer from the server behind it."],
          ["503", "Service Unavailable", "The server is overloaded or down for maintenance."],
        ]}
      />
      <P>
        APIs disagree about some of these. One team returns 400 for every
        validation error and another uses 422. Some return 200 for a delete
        with a message in the body, others 204 with nothing. Neither is wrong.
        What you check is that the API matches its own documentation and is
        consistent from one endpoint to the next.
      </P>

      <H3>Trying status codes</H3>
      <P>
        <C>/api/status/{"{code}"}</C> answers with whatever code you put in
        the path. It is useful for seeing how a tool or a client library
        behaves when it gets a particular status. Try a few:
      </P>
      <Run path="/api/status/201" />
      <Run path="/api/status/503" showHeaders={["Retry-After"]} />
      <P>From curl, the 503 looks like this:</P>
      <Code code={status503} lang="text" label="Response" />
      <P>
        Notice the <C>retry-after: 5</C> header. A 503 or 429 often tells the
        client how many seconds to wait before trying again, and a well
        behaved client respects it. You check that the header is there, not
        only the status.
      </P>
      <P>
        Codes outside the valid range are rejected. <C>/api/status/999</C>{" "}
        comes back as a 400 with the message{" "}
        <C>Status code must be between 200 and 599 (1xx cannot be sent as a final response).</C>{" "}
        And <C>/api/status/abc</C> returns a 404 with an empty body, because{" "}
        <C>abc</C> doesn&apos;t match the route at all. Two bad inputs, two
        different kinds of failure. You will see this pattern often: a value
        of the wrong type tends to fail in the routing layer, before the
        application code ever runs.
      </P>

      <H3>Redirects</H3>
      <P>
        A 3xx response usually has no useful body. The important part is the{" "}
        <C>Location</C> header, which says where to go next:
      </P>
      <Code code={status302} lang="text" label="Response to GET /api/status/302" />
      <P>
        Browsers and most HTTP libraries follow redirects automatically and
        show you only the final response. That is convenient until you need
        to test the redirect itself. curl doesn&apos;t follow them unless you
        add <C>-L</C>, which makes it the better tool for this.
      </P>

      <H2 id="headers">Response headers</H2>
      <P>
        Response headers describe the body and give the client instructions.
        Ask for page 3 of the product list, two products per page:
      </P>
      <Run
        path="/api/Products?limit=2&page=3"
        showHeaders={["X-Total-Count", "X-Page", "X-Per-Page", "X-Total-Pages"]}
      />
      <Code code={listHeaders} lang="text" label="Response headers" />
      <P>
        <C>Content-Type</C> says the body is JSON in UTF-8. The four{" "}
        <C>x-page</C> and <C>x-total</C> headers carry the pagination details:
        there are 20 products, 10 pages, and this is page 3. The body is only
        an array of two products, so a client that ignores these headers has
        no way of knowing there is more. Headers that start with <C>X-</C>{" "}
        are custom ones the API invented. They are documented by the API, not
        by the HTTP standard.
      </P>
      <P>
        Look at <C>x-ratelimit-reset: 1721300000</C>. That is a Unix
        timestamp, and it converts to July 2024. A reset time in the past
        makes no sense for a rate limit. The API documentation explains that
        these rate limit headers are informational on most endpoints, but if
        you found this on a real product, it would be worth asking about.
        You only catch it by reading headers instead of skipping them.
        (The <A href="/tools/timestamp">timestamp converter</A> does the
        conversion.)
      </P>
      <P>
        You may expect a <C>Content-Length</C> header. This API mostly sends{" "}
        <C>Transfer-Encoding: chunked</C> instead, which means the body is
        sent in pieces and the total size isn&apos;t announced up front. Both
        are valid. A response has one or the other, not both.
      </P>

      <H2 id="body">The body</H2>
      <P>
        The body is the data: a product, a list, an error message, an image.{" "}
        <C>Content-Type</C> says how to read it. Most of your checks will be
        on the body, and <A href="/learn/json">Reading JSON</A> covers that in
        detail. Two special cases come first.
      </P>
      <H3>No body at all</H3>
      <P>
        A 204 means success with no body, on purpose. The response has no{" "}
        <C>Content-Type</C> either, because there is nothing to describe:
      </P>
      <Run path="/api/formats/no-content" />
      <Code code={noContent} lang="text" label="Response" />
      <P>
        Client code that always calls <C>response.json()</C> will crash on
        this, because an empty string isn&apos;t valid JSON. If you write test
        helpers that parse every response, they need to handle an empty body.
      </P>

      <H3>When the headers lie</H3>
      <P>
        Status, headers and body are produced by different parts of the
        server, and nothing forces them to agree. Here is a response that
        claims to be HTML:
      </P>
      <Run path="/api/formats/wrong-content-type" />
      <Code code={wrongType} lang="text" label="Response" />
      <P>
        The body is perfectly good JSON. A person reading it would never
        notice a problem. A browser would try to render it as a web page, and
        some HTTP libraries will refuse to parse it as JSON or return it as a
        string. This endpoint is broken on purpose. In real systems the same
        bug usually comes from an error page generated by a proxy or a
        framework default. Your test should check the <C>Content-Type</C>{" "}
        explicitly.
      </P>
      <P>
        The mirror image happens too: a 200 status with a body that says{" "}
        <C>{`{"success": false}`}</C>. Some APIs report every error that way.
        Monitoring tools that count 5xx responses never see those failures,
        and neither does a test that checks only the status code. If an API
        does this, your tests have to read the body on every response.
      </P>

      <Note title="Simulated errors on any endpoint">
        <P>
          On this API, adding <C>?error=</C> with a status code to any URL
          returns a fake error instead of the real response, marked with an{" "}
          <C>x-simulated: true</C> header. It is handy for checking how a
          client handles failure without breaking anything.
        </P>
        <Code code={simulated} lang="text" label="GET /api/Products?error=503" />
      </Note>

      <H2 id="what-to-check">What to check on every response</H2>
      <P>
        Before you look at a single field of data, confirm the basics. It
        takes a few seconds and catches a surprising number of bugs.
      </P>
      <Ul>
        <li>The status code is the one the docs promise for this situation.</li>
        <li>
          <C>Content-Type</C> matches the body you actually got.
        </li>
        <li>
          Headers the docs mention (pagination, <C>Location</C>,{" "}
          <C>Retry-After</C>) are present and make sense.
        </li>
        <li>The body parses, and has the shape you expect.</li>
        <li>Error responses follow the same format as other errors from this API.</li>
      </Ul>

      <Exercise>
        <P>For each request, write down the status code, the Content-Type and one sentence about the body.</P>
        <Ul>
          <li>
            <C>/api/status/418</C>. Look up why this code exists.
          </li>
          <li>
            <C>/api/formats/empty</C>. How does it differ from{" "}
            <C>/api/formats/no-content</C>? One returns 200 and one returns
            204. Which do you think a client handles better?
          </li>
          <li>
            <C>/api/Products?limit=2&amp;page=99</C>. There is no page 99.
            What status and body did you get, and what do the pagination
            headers say? Would you have designed it the same way?
          </li>
          <li>
            <C>/api/status/list</C>. Find a code in the list marked{" "}
            <C>&quot;supported&quot;: false</C> and try requesting it.
          </li>
        </Ul>
      </Exercise>
    </>
  );
}
