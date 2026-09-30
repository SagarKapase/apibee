import { A, C, Code, Exercise, H2, H3, Note, P, Table, Ul } from "@/components/lesson";

const curlI = `curl -i https://api.snap-test.in/api/health`;

const curlIOut = `HTTP/1.1 200 OK
Date: Wed, 30 Sep 2026 18:31:06 GMT
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive
Server: cloudflare
vary: Accept-Encoding
x-powered-by: APIBee
x-ratelimit-limit: 1000
x-ratelimit-remaining: 999
x-ratelimit-reset: 1721300000

{"status":"healthy","uptimeSeconds":3716,"timestamp":"2026-09-30T18:31:06Z"}`;

const curlV = `curl -v https://api.snap-test.in/api/health`;

const curlVOut = `* Host api.snap-test.in:443 was resolved.
* IPv4: 216.24.57.18, 216.24.57.16
* Established connection to api.snap-test.in (216.24.57.18 port 443)
* using HTTP/1.x
> GET /api/health HTTP/1.1
> Host: api.snap-test.in
> User-Agent: curl/8.18.0
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 200 OK
< Date: Wed, 30 Sep 2026 18:31:16 GMT
< Content-Type: application/json; charset=utf-8
< Transfer-Encoding: chunked
...`;

const curlPost = `curl -X POST https://api.snap-test.in/api/methods/post \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Asha","role":"tester"}'`;

const curlPostOut = `{"method":"POST","message":"POST request received","path":"/api/methods/post","query":{},"contentType":"application/json","bodyLength":31,"bodyTruncated":false,"body":"{\\"name\\":\\"Asha\\",\\"role\\":\\"tester\\"}","timestamp":"2026-09-30T18:31:16Z"}`;

const curlJson = `curl --json '{"title":"Learn curl","completed":false,"userId":1}' \\
  https://api.snap-test.in/api/Todos`;

const curlJsonOut = `{"message":"Todo created successfully","data":{"id":31,"userId":1,"title":"Learn curl","completed":false,"priority":"medium","dueDate":""}}`;

const curlTiming = `curl -s -o /dev/null \\
  -w "status %{http_code}  total %{time_total}s  size %{size_download} bytes\\n" \\
  https://api.snap-test.in/api/Products`;

const curlTimingOut = `status 200  total 0.382512s  size 5846 bytes`;

const psBroken = `PS> curl.exe -s -X POST https://api.snap-test.in/api/methods/post -H "Content-Type: application/json" -d '{"name":"Asha"}'
{"method":"POST", ... "bodyLength":11, ... "body":"{name:Asha}", ...}`;

const psFile = `# body.json contains {"name":"Asha","role":"tester"}
curl.exe -s --json "@body.json" https://api.snap-test.in/api/methods/post`;

const cmdQuoting = `curl -X POST https://api.snap-test.in/api/methods/post ^
  -H "Content-Type: application/json" ^
  -d "{\\"name\\":\\"Asha\\",\\"role\\":\\"tester\\"}"`;

const pmTest = `pm.test("status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("product 1 has a price", function () {
  const product = pm.response.json();
  pm.expect(product.id).to.eql(1);
  pm.expect(product.price).to.be.a("number");
});`;

export default function FirstRequests() {
  return (
    <>
      <P>
        So far you have sent requests from a browser and from the Send buttons
        on these pages. That works for simple GET requests and nothing else.
        To choose the method, set headers or send a body, you need a proper
        client. Almost every tester ends up using two: curl on the command
        line, and a graphical client such as Postman. This lesson covers
        enough of each to get through the rest of the tutorial.
      </P>

      <H2 id="curl">curl</H2>
      <P>
        curl is a command-line program that sends a request and prints the
        response. It is installed by default on macOS, on most Linux systems
        and on Windows 10 and 11. Check with <C>curl --version</C>. It is also
        the format developers use to share requests: API documentation,
        browser developer tools and Postman can all show or export a request
        as a curl command, so you will need to read them even if you prefer
        another tool.
      </P>
      <P>
        Without options, curl prints only the body. Add <C>-i</C> to include
        the status line and response headers, which you almost always want
        when testing:
      </P>
      <Code code={curlI} lang="curl" />
      <Code code={curlIOut} lang="text" label="Output" />
      <P>
        For more detail, <C>-v</C> (verbose) also prints the request curl
        sent, marked with <C>&gt;</C>, and the response headers marked with{" "}
        <C>&lt;</C>. Lines starting with <C>*</C> describe the connection. Use
        it when a request doesn&apos;t behave the way you expect and you want
        to see exactly what went over the wire.
      </P>
      <Code code={curlV} lang="curl" />
      <Code code={curlVOut} lang="text" label="Output (trimmed)" />
      <P>
        curl added three headers you didn&apos;t ask for: <C>Host</C>,{" "}
        <C>User-Agent</C> and <C>Accept</C>. Every client adds some defaults,
        and different clients add different ones. When the same request works
        in Postman and fails in curl, a default header is often the reason.
      </P>

      <H3>Method, headers and body</H3>
      <P>
        Three options cover most requests. <C>-X</C> sets the method.{" "}
        <C>-H</C> adds a header and can be repeated. <C>-d</C> sends a body.
        This sends a POST with a JSON body to an endpoint that echoes back what
        it received:
      </P>
      <Code code={curlPost} lang="curl" />
      <Code code={curlPostOut} lang="json" label="Output" />
      <P>
        The backslash at the end of each line lets the command continue on the
        next line in bash and zsh. The body is wrapped in single quotes so the
        shell leaves the double quotes inside it alone. If you forget the{" "}
        <C>Content-Type</C> header, curl sends{" "}
        <C>application/x-www-form-urlencoded</C>, because <C>-d</C> was
        designed for HTML forms, and many APIs will reject the body.
      </P>
      <P>
        curl 7.82 and later have a shortcut, <C>--json</C>, which sends the
        body, sets <C>Content-Type: application/json</C> and{" "}
        <C>Accept: application/json</C>, and switches the method to POST. This
        one creates a real todo:
      </P>
      <Code code={curlJson} lang="curl" />
      <Code code={curlJsonOut} lang="json" label="Output" />
      <P>
        The ID you get back will be different, because other people create
        todos too. For PUT or PATCH, add <C>-X PUT</C> or <C>-X PATCH</C>{" "}
        alongside <C>--json</C>.
      </P>

      <H3>Timing and scripting</H3>
      <P>
        <C>-w</C> prints values curl measured, after the response. Combined
        with <C>-s</C> (silent, no progress bar) and <C>-o /dev/null</C>{" "}
        (throw the body away), it gives you a one-line summary:
      </P>
      <Code code={curlTiming} lang="curl" />
      <Code code={curlTimingOut} lang="text" label="Output" />
      <P>
        On Windows, use <C>-o NUL</C> instead of <C>-o /dev/null</C>.{" "}
        <C>time_total</C> includes DNS lookup, connecting and TLS, so the
        first request is often slower than the ones after it. The{" "}
        <A href="/learn/performance">performance lesson</A> breaks this number
        down further.
      </P>

      <H2 id="windows">curl on Windows</H2>
      <P>
        Windows needs its own section, because the same command can behave
        three different ways depending on the shell.
      </P>
      <P>
        In Windows PowerShell 5.1 (the version that ships with Windows),{" "}
        <C>curl</C> is not curl. It is an alias for{" "}
        <C>Invoke-WebRequest</C>, a PowerShell command with different options,
        so <C>curl -i</C> fails with a confusing error. Type{" "}
        <C>curl.exe</C> to run the real program. PowerShell 7 removed the
        alias, but typing <C>curl.exe</C> works in both, so it&apos;s a good
        habit.
      </P>
      <P>
        Quoting is the second problem. Windows PowerShell 5.1 strips double
        quotes inside arguments when it passes them to programs like
        curl.exe. The command below looks right, and the server receives
        broken JSON:
      </P>
      <Code code={psBroken} lang="text" label="PowerShell 5.1" />
      <P>
        The body arrived as <C>{"{name:Asha}"}</C>, which is not JSON.
        PowerShell 7.3 and later pass the quotes through correctly. On older
        versions, the least painful fix is to put the body in a file and
        point curl at it with <C>@</C>. The quotes around{" "}
        <C>&quot;@body.json&quot;</C> stop PowerShell from treating the{" "}
        <C>@</C> as its own syntax.
      </P>
      <Code code={psFile} lang="curl" label="PowerShell" />
      <P>
        In the old Command Prompt (cmd.exe), single quotes mean nothing, so
        wrap the body in double quotes and escape the ones inside with a
        backslash. The line continuation character is <C>^</C> instead of a
        backslash:
      </P>
      <Code code={cmdQuoting} lang="curl" label="Command Prompt" />
      <Note>
        <P>
          If a request works for a colleague on a Mac and fails for you on
          Windows, look at the quoting first. Running the command with{" "}
          <C>-v</C> shows the body curl actually sent. Or use Git Bash, which
          comes with Git for Windows and handles quotes the same way as Linux.
        </P>
      </Note>

      <H2 id="postman">Postman and other GUI clients</H2>
      <P>
        A graphical client does the same job as curl with a form instead of a
        command: pick the method from a dropdown, type the URL, fill in
        headers and body in tabs, click Send. The response appears below,
        formatted, with the status, time and size. Postman is the most widely
        used. Insomnia and Bruno work the same way, and Bruno stores
        everything as plain files, which some teams prefer because the
        requests can live in the same Git repository as the code. The ideas
        below apply to all of them, with Postman names.
      </P>

      <H3>Collections</H3>
      <P>
        A collection is a saved group of requests, usually one per API, with
        folders inside it. It is what makes a GUI client worth using over
        curl for a project you work on for months. You build up the requests
        once and share the collection with the team.
      </P>
      <P>
        You don&apos;t have to build it by hand. This API publishes an OpenAPI
        document, a machine-readable description of every endpoint, at{" "}
        <C>https://api.snap-test.in/openapi/v1.json</C>. In Postman, choose
        Import, paste that URL, and it creates a collection with a request for
        each endpoint. Most APIs you test at work will have a similar file,
        and it is the fastest way to get started on an unfamiliar one.
      </P>

      <H3>Environments and variables</H3>
      <P>
        Real projects run the same API in several places: a developer&apos;s
        laptop, a test server, staging, production. The requests are the same
        apart from the base URL and the credentials. Postman handles this
        with environments. Create one called &quot;snap-test&quot; with a
        variable <C>baseUrl</C> set to <C>https://api.snap-test.in</C>, then
        write your request URLs as <C>{"{{baseUrl}}/api/Products/1"}</C>.
        Switching environment switches every request at once. Put tokens in
        variables too, so they aren&apos;t copied into dozens of requests.
      </P>

      <H3>Tests in Postman</H3>
      <P>
        Each request has a Tests tab (called Scripts, with a
        post-response section, in newer versions) where you can write
        JavaScript that runs after the response arrives. For{" "}
        <C>GET {"{{baseUrl}}"}/api/Products/1</C>:
      </P>
      <Code code={pmTest} lang="javascript" label="Postman test" />
      <P>
        The results appear in a Test Results tab next to the response. The
        Collection Runner can then run every request in a collection and
        report which checks failed. This is a gentle first step into
        automation. The <A href="/learn/automation">automation lesson</A>{" "}
        covers writing tests as ordinary code, which scales better once you
        have more than a few dozen.
      </P>

      <H2 id="which-tool">Which one to use</H2>
      <P>Both, for different jobs.</P>
      <Table
        head={["Situation", "Better choice"]}
        rows={[
          ["Checking one thing quickly, or reproducing a bug report", "curl"],
          ["Sharing an exact request in a ticket or chat", "curl (anyone can paste and run it)"],
          ["Exploring an API you don't know yet", "GUI client with the OpenAPI import"],
          ["Long JSON bodies you edit repeatedly", "GUI client"],
          ["Switching between test and staging servers", "GUI client environments"],
          ["Running inside a script or on a build server", "curl, or tests written in code"],
          ["Looking at raw headers and connection details", "curl -v"],
        ]}
      />
      <P>
        One more option for this API specifically: each endpoint page in the{" "}
        <A href="/docs">API reference</A> has a form for sending the request
        and shows a ready-made curl command you can copy. That is often the
        quickest way to try an endpoint before you save it anywhere.
      </P>
      <Ul>
        <li>
          When a bug report includes a request, attach it as a curl command.
          The developer can run it without importing anything, and there is
          no doubt about which headers were sent.
        </li>
        <li>
          Postman can convert in both directions. Paste a curl command into
          the Import dialog to get a request, or use the Code button on a
          request to get curl.
        </li>
      </Ul>

      <Exercise>
        <P>Do these with curl, then repeat them in a GUI client.</P>
        <Ul>
          <li>
            Send <C>GET /api/echo/headers</C> and compare the headers curl
            sends with the ones your GUI client sends. Which headers did each
            tool add on its own?
          </li>
          <li>
            Create a todo with <C>POST /api/Todos</C>, then fetch it with{" "}
            <C>GET /api/Todos/</C> followed by the ID from the response.
          </li>
          <li>
            Send the same POST without the <C>Content-Type</C> header. What
            status and body come back?
          </li>
          <li>
            Use <C>-w</C> to time <C>/api/Products</C> and{" "}
            <C>/api/Products?delay=2</C>. The <C>delay</C> parameter makes the
            server wait, so the second should take about two seconds longer.
          </li>
        </Ul>
        <P>
          In your GUI client, create an environment with a <C>baseUrl</C>{" "}
          variable and write one test that fails on purpose, so you know what
          a failure looks like before you rely on a pass.
        </P>
      </Exercise>
    </>
  );
}
