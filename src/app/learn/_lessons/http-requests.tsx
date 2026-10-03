import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const rawRequest = `GET /api/echo?color=red HTTP/1.1
Host: api.testingapis.com
User-Agent: curl/8.18.0
Accept: */*`;

const echoGet = `{
  "method": "GET",
  "url": "http://api.testingapis.com/api/echo?color=red&size=10",
  "path": "/api/echo",
  "queryString": "?color=red&size=10",
  "query": { "color": "red", "size": "10" },
  "headers": {
    "Accept": "*/*",
    "Host": "api.testingapis.com",
    "User-Agent": "curl/8.18.0",
    "Accept-Encoding": "gzip, br",
    "Cf-Ipcountry": "IN",
    "X-Forwarded-For": "203.0.113.7, 172.71.198.178, 10.30.107.46",
    "X-Forwarded-Proto": "https"
  },
  "contentType": null,
  "contentLength": 0,
  "body": null
}`;

const encoded = `{
  "queryString": "?q=red%20shoes&tag=a%26b",
  "query": { "q": "red shoes", "tag": "a&b" }
}`;

const notEncoded = `{
  "queryString": "?tag=a&b",
  "query": { "tag": "a", "b": "" }
}`;

const postCurl = `curl -X POST https://api.testingapis.com/api/echo \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Dune","year":1965}'`;

const postEcho = `{
  "method": "POST",
  "path": "/api/echo",
  "query": {},
  "contentType": "application/json",
  "contentLength": 28,
  "body": "{\\"title\\":\\"Dune\\",\\"year\\":1965}",
  "json": { "title": "Dune", "year": 1965 }
}`;

const formCurl = `curl -X POST https://api.testingapis.com/api/echo \\
  -d '{"title":"Dune"}'`;

const formEcho = `{
  "contentType": "application/x-www-form-urlencoded",
  "contentLength": 16,
  "body": "{\\"title\\":\\"Dune\\"}",
  "json": null,
  "form": { "{\\"title\\":\\"Dune\\"}": "" }
}`;

const badJson = `"json": null,
"jsonError": "The JSON object contains a trailing comma at the end which is not supported in this mode. Change the reader options. LineNumber: 0 | BytePositionInLine: 16."`;

export default function HttpRequests() {
  return (
    <>
      <P>
        In the <A href="/learn/what-is-an-api">previous lesson</A> you sent a
        request by typing a URL into a browser. The browser filled in
        everything else for you. This lesson takes a request apart so you know
        what each piece is, because every test you write will set some of
        these pieces on purpose and check how the server reacts.
      </P>
      <P>An HTTP request has four parts:</P>
      <Ul>
        <li>a method, which says what kind of action you want</li>
        <li>a URL, which says which thing on which server you want it done to</li>
        <li>headers, which carry extra information about the request</li>
        <li>an optional body, which carries data you are sending</li>
      </Ul>

      <H2 id="raw-request">What a request looks like on the wire</H2>
      <P>
        HTTP/1.1 is a text protocol. Before any encryption, a request is a few
        lines of plain text. This is the request curl sends for{" "}
        <C>https://api.testingapis.com/api/echo?color=red</C>. You can see it
        yourself by running curl with <C>-v</C> (verbose): the lines that
        start with <C>&gt;</C> are what went out.
      </P>
      <Code code={rawRequest} lang="text" label="Raw request" />
      <P>
        The first line is the request line: method, the path with its query
        string, and the protocol version. Each line after that is a header, a
        name and a value separated by a colon. An empty line ends the headers.
        If there were a body, it would come after that empty line. Newer
        versions of HTTP (HTTP/2 and HTTP/3) send the same information in a
        binary format, but the parts are identical, and every tool still
        shows them to you in this text form.
      </P>

      <H2 id="echo">Seeing what the server received</H2>
      <P>
        The easiest way to learn requests is to send one to a server that
        tells you what it got. <C>/api/echo</C> does exactly that. It accepts
        any method and replies with a description of your request. Send this
        one:
      </P>
      <Run path="/api/echo?color=red&size=10" />
      <P>
        Here is the reply from curl, trimmed to the interesting fields. If you
        send it from the page, the headers will be your browser&apos;s instead.
      </P>
      <Code code={echoGet} lang="json" />
      <P>
        Two things in there are worth a second look. The server saw the URL as{" "}
        <C>http://</C>, not <C>https://</C>. And it received headers you never
        sent, like <C>Cf-Ipcountry</C> and <C>X-Forwarded-For</C>. Your
        request went through a CDN and a load balancer before it reached the
        application, and each of them rewrote or added something. The first
        address in <C>X-Forwarded-For</C> is yours (the one above is a
        placeholder). That is
        normal in production systems, and it is the reason an echo endpoint is
        useful: it shows what arrived, not what you think you sent.
      </P>

      <H2 id="method">The method</H2>
      <P>
        The method is the verb. <C>GET</C> asks for data. <C>POST</C> sends
        data to create something. <C>PUT</C>, <C>PATCH</C> and <C>DELETE</C>{" "}
        change or remove things. A browser address bar can only send GET,
        which is why you need other tools for the rest. Methods get a whole
        lesson of their own, <A href="/learn/http-methods">HTTP methods</A>,
        so for now it is enough to know that the same URL can do different
        things depending on the method.
      </P>

      <H2 id="url">The URL</H2>
      <P>Break this URL into its parts:</P>
      <Code code="https://api.testingapis.com/api/Products?category=books&limit=5" lang="text" label="URL" />
      <Table
        head={["Part", "Value", "Meaning"]}
        rows={[
          ["Scheme", <C key="s">https</C>, "How to connect. https is HTTP inside an encrypted connection."],
          ["Host", <C key="h">api.testingapis.com</C>, "Which server. It is also sent as the Host header."],
          ["Path", <C key="p">/api/Products</C>, "Which resource on that server."],
          ["Query string", <C key="q">category=books&amp;limit=5</C>, "Extra parameters, after the ?, separated by &."],
        ]}
      />
      <P>
        URLs can also carry a port (<C>:8080</C> after the host) and a
        fragment (<C>#section</C> at the end). You will see ports a lot on
        test and local environments. Fragments never reach the server at all:
        the browser keeps them.
      </P>

      <H3>Path parameters and query parameters</H3>
      <P>
        Values can travel in the path or in the query string. In{" "}
        <C>/api/Products/1</C>, the <C>1</C> is a path parameter. It
        identifies one specific product, and the documentation writes the
        path as <C>/api/Products/{"{id}"}</C>. In{" "}
        <C>/api/Products?limit=5</C>, <C>limit</C> is a query parameter. Query
        parameters usually filter, sort or page through results, and they are
        usually optional. That split is a convention, not a rule, so check the
        docs for each API.
      </P>
      <P>
        Paths are often case-sensitive and query parameter names usually are
        too. That depends on the server framework, so it is worth a quick test
        on any new API: send <C>/api/products</C> instead of{" "}
        <C>/api/Products</C> and see what happens.
      </P>

      <H3>Percent-encoding</H3>
      <P>
        Some characters have a job inside a URL. <C>?</C> starts the query
        string, <C>&amp;</C> separates parameters, <C>#</C> starts the
        fragment, <C>/</C> separates path segments, and spaces aren&apos;t
        allowed at all. To send one of these as data, you replace it with{" "}
        <C>%</C> and its hexadecimal byte value. A space becomes <C>%20</C>{" "}
        and <C>&amp;</C> becomes <C>%26</C>. This is called
        percent-encoding, or URL encoding.
      </P>
      <P>
        Say you want to search for &quot;red shoes&quot; and filter by a tag
        whose value is the literal text <C>a&amp;b</C>. Encoded, it works:
      </P>
      <Run path="/api/echo?q=red%20shoes&tag=a%26b" />
      <Code code={encoded} lang="json" label="Trimmed response" />
      <P>Now send the tag without encoding the ampersand:</P>
      <Run path="/api/echo?tag=a&b" />
      <Code code={notEncoded} lang="json" label="Trimmed response" />
      <P>
        The server now sees two parameters: <C>tag</C> with the value{" "}
        <C>a</C>, and an empty parameter called <C>b</C>. No error, no
        warning. The request &quot;worked&quot; and the data is wrong. This
        is a real class of bug in clients that build URLs by gluing strings
        together, and it is why search fields are a good place to type
        ampersands, plus signs, slashes and non-English text during testing.
        The <A href="/tools/url-encoder">URL encoder</A> on this site does the
        conversion if you need it by hand.
      </P>

      <H2 id="headers">Headers</H2>
      <P>
        Headers are name and value pairs that describe the request. Names are
        case-insensitive, so <C>content-type</C> and <C>Content-Type</C> mean
        the same thing. Most clients add several headers automatically. The
        ones you will set or check most often are these:
      </P>
      <Table
        head={["Header", "What it says", "Example"]}
        rows={[
          [<C key="1">Content-Type</C>, "The format of the body you are sending.", <C key="e">application/json</C>],
          [<C key="2">Accept</C>, "The formats you are willing to receive.", <C key="e">application/json</C>],
          [<C key="3">User-Agent</C>, "Which client sent the request.", <C key="e">curl/8.18.0</C>],
          [<C key="4">Authorization</C>, "Credentials, such as a token.", <C key="e">Bearer abc123</C>],
          [<C key="5">Host</C>, "Which site on the server. Clients fill it in from the URL.", <C key="e">api.testingapis.com</C>],
        ]}
      />
      <P>
        <C>Accept</C> matters when an API can answer in more than one format.{" "}
        <C>/api/formats/negotiate</C> returns the same user as JSON by default
        and as XML if you ask for it:
      </P>
      <Run path="/api/formats/negotiate" headers={{ Accept: "application/xml" }} />
      <P>
        Compare the XML with the JSON you get without the header. The XML
        version has fewer fields: <C>roles</C>, <C>score</C> and{" "}
        <C>manager</C> are missing. Whether that is a bug depends on the
        documentation, but it is the kind of thing you only find if you test
        each format and don&apos;t assume they match.
      </P>
      <P>
        <C>Authorization</C> is covered properly in{" "}
        <A href="/learn/authentication">Authentication and authorization</A>.
        One thing to know already: never paste real tokens into screenshots,
        bug reports or shared collections. They are passwords.
      </P>

      <H2 id="body">The body</H2>
      <P>
        GET requests normally have no body. POST, PUT and PATCH usually do,
        because they send data to the server. The body can be any format, and
        the <C>Content-Type</C> header tells the server how to read it. For
        most APIs today the body is JSON. This sends a small JSON object to the
        echo endpoint with curl:
      </P>
      <Code code={postCurl} lang="curl" />
      <Code code={postEcho} lang="json" label="Trimmed response" />
      <P>
        The server read the header, saw <C>application/json</C>, and parsed
        the 28 bytes into an object. You can send the same request from here:
      </P>
      <Run method="POST" path="/api/echo" body={`{"title":"Dune","year":1965}`} />

      <H3>When Content-Type and the body disagree</H3>
      <P>
        Now send the same kind of body with curl but leave out the header:
      </P>
      <Code code={formCurl} lang="curl" />
      <Code code={formEcho} lang="json" label="Trimmed response" />
      <P>
        curl&apos;s <C>-d</C> option defaults to{" "}
        <C>application/x-www-form-urlencoded</C>, the format HTML forms use.
        The server believed the header, tried to read the body as a form, and
        ended up with one form field whose name is the entire JSON text. No
        error came back. Many real servers behave the same way, and others
        return <C>415 Unsupported Media Type</C>. A missing or wrong{" "}
        <C>Content-Type</C> is one of the most common reasons a request
        &quot;looks right&quot; and still fails, so it is the first thing to
        check when a server ignores your data.
      </P>
      <P>
        If the header is right but the JSON is broken, a good server says so.
        Here is part of the echo response for the body{" "}
        <C>{`{"title":"Dune",}`}</C>, which has a trailing comma:
      </P>
      <Code code={badJson} lang="json" label="Trimmed response" />

      <Note title="Other body formats">
        <P>
          JSON is the default for modern APIs, but you will meet others:
          form-encoded bodies from older services, <C>multipart/form-data</C>{" "}
          for file uploads, and XML for SOAP and many enterprise systems. The{" "}
          <A href="/docs/bodies">Bodies</A> endpoints accept each of them and
          report what they parsed.
        </P>
      </Note>

      <Exercise>
        <P>
          Use <C>/api/echo</C> to answer each question. Look at the response
          every time instead of guessing.
        </P>
        <Ul>
          <li>
            Send <C>/api/echo?name=Zoë&amp;city=São Paulo</C> from your browser
            address bar. What did the browser change in the URL before sending
            it, and what did the server decode it to?
          </li>
          <li>
            Send <C>/api/echo?id=1&amp;id=2</C>. How does the server represent
            a parameter that appears twice? Different frameworks disagree here,
            which makes it a good question for any API you test.
          </li>
          <li>
            Send a POST with a JSON body and <C>Content-Type: text/plain</C>.
            Did the server parse the JSON anyway?
          </li>
          <li>
            Try <C>/api/echo/user-agent</C> from a browser and from curl. Why
            would an API ever care which one you used?
          </li>
        </Ul>
      </Exercise>
    </>
  );
}
