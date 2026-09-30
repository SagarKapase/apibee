import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const negotiateXml = `$ curl -i -H "Accept: application/xml" https://api.snap-test.in/api/formats/negotiate

HTTP/1.1 200 OK
Content-Type: application/xml; charset=utf-8
vary: Accept

<?xml version="1.0" encoding="UTF-8"?><user><id>1</id><name>Alice Johnson</name><email>alice@apibee.dev</email><active>true</active></user>`;

const negotiateJson = `{"id":1,"name":"Alice Johnson","email":"alice@apibee.dev","roles":["admin","editor"],"active":true,"score":98.5,"manager":null}`;

const notAcceptable = `$ curl -i -H "Accept: image/png" https://api.snap-test.in/api/formats/negotiate

HTTP/1.1 406 Not Acceptable
Content-Type: application/json; charset=utf-8
vary: Accept

{"status":406,"error":"Not Acceptable","message":"None of the requested media types are supported: 'image/png'.","supported":["application/json","application/xml","text/xml","text/html","text/plain","text/csv"]}`;

const vary = `$ curl -i -H "Accept-Language: de-DE,de;q=0.9,en;q=0.5" https://api.snap-test.in/api/cache/vary

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: public, max-age=60
content-language: de
vary: Accept-Language

{"language":"de","greeting":"Hallo, willkommen bei APIBee!","supported":["en","es","fr","de","hi"]}`;

const noStore = `$ curl -i https://api.snap-test.in/api/cache/no-store

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-store, no-cache, must-revalidate
expires: 0
pragma: no-cache

{"requestId":"efc17de6-279c-4b43-9bd6-cca7f7eee569","generatedAt":"2026-09-30T18:31:59.755Z","hint":"Never cached: every request returns a new requestId."}`;

const etagGet = `$ curl -X POST https://api.snap-test.in/api/cache/etag/reset
{"message":"Document reset to version 1"}

$ curl -i https://api.snap-test.in/api/cache/etag

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
etag: W/"doc-v1"

{"id":1,"version":1,"title":"APIBee cached document","content":"Send If-None-Match to get a 304, and If-Match on PUT to make a conditional update.","updatedAt":"2025-01-01T00:00:00Z","etag":"\\"doc-v1\\""}`;

const etag304 = `$ curl -i -H 'If-None-Match: "doc-v1"' https://api.snap-test.in/api/cache/etag

HTTP/1.1 304 Not Modified
Cache-Control: no-cache
etag: "doc-v1"`;

const ifMatch = `$ curl -i -X PUT https://api.snap-test.in/api/cache/etag \\
    -H "Content-Type: application/json" \\
    -d '{"title":"Edited","content":"Changed by a test"}'

HTTP/1.1 428 Precondition Required
{"status":428,"error":"Precondition Required","message":"If-Match header is required. GET /api/cache/etag and send its ETag (currently \\"doc-v1\\")."}

$ curl -i -X PUT https://api.snap-test.in/api/cache/etag \\
    -H 'If-Match: "doc-v1"' \\
    -H "Content-Type: application/json" \\
    -d '{"title":"Edited","content":"Changed by a test"}'

HTTP/1.1 200 OK
etag: W/"doc-v2"
{"message":"Document updated","data":{"id":1,"version":2,"title":"Edited","content":"Changed by a test","updatedAt":"2026-09-30T18:32:10Z","etag":"\\"doc-v2\\""}}

$ curl -i -X PUT https://api.snap-test.in/api/cache/etag \\
    -H 'If-Match: "doc-v1"' \\
    -H "Content-Type: application/json" \\
    -d '{"title":"Edited again","content":"x"}'

HTTP/1.1 412 Precondition Failed
{"status":412,"error":"Precondition Failed","message":"ETag mismatch: document has changed. Current ETag is \\"doc-v2\\"."}`;

const lastModified = `$ curl -i https://api.snap-test.in/api/cache/last-modified

HTTP/1.1 200 OK
Cache-Control: no-cache
last-modified: Wed, 01 Jan 2025 00:00:00 GMT

$ curl -o /dev/null -w "%{http_code}\\n" -H "If-Modified-Since: Wed, 01 Jan 2025 00:00:00 GMT" https://api.snap-test.in/api/cache/last-modified
304

$ curl -o /dev/null -w "%{http_code}\\n" -H "If-Modified-Since: Tue, 31 Dec 2024 00:00:00 GMT" https://api.snap-test.in/api/cache/last-modified
200

$ curl -o /dev/null -w "%{http_code}\\n" -H "If-Modified-Since: not a date" https://api.snap-test.in/api/cache/last-modified
200`;

const setCookie = `$ curl -i "https://api.snap-test.in/api/cookies/set/pref/compact?sameSite=strict&secure=true&httpOnly=true&maxAge=600"

HTTP/1.1 200 OK
Set-Cookie: pref=compact; max-age=600; path=/; secure; samesite=strict; httponly`;

const sameSiteNone = `$ curl -s "https://api.snap-test.in/api/cookies/set/pref/compact?sameSite=none&maxAge=600"

{"message":"Cookie 'pref' set", ... ,"setCookieHeader":"pref=compact; max-age=600; path=/; samesite=none","warning":"Browsers reject SameSite=None cookies without Secure."}`;

const login = `$ curl -i -c jar.txt -X POST https://api.snap-test.in/api/cookies/login \\
    -H "Content-Type: application/json" \\
    -d '{"username":"test","password":"test123"}'

HTTP/1.1 200 OK
Set-Cookie: apibee_session=283afe92b86a96f3f5648a62add23aa2; max-age=3600; path=/; samesite=lax; httponly

{"message":"Logged in. The session cookie is sent automatically on later requests.","username":"test","cookie":"apibee_session","expiresAt":"2026-09-30T19:32:41Z"}`;

const me = `$ curl -b jar.txt https://api.snap-test.in/api/cookies/me

{"user":{"id":1,"username":"test","name":"Test User","email":"test@apibee.dev","role":"user"},"session":{"expiresAt":"2026-09-30T19:32:41Z"}}`;

const logout = `$ curl -i -b jar.txt -c jar.txt -X POST https://api.snap-test.in/api/cookies/logout

HTTP/1.1 200 OK
Set-Cookie: apibee_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/

{"message":"Logged out"}`;

const reuse = `$ curl -i -b "apibee_session=5bc348fd740edcc67d70a851005e7547" https://api.snap-test.in/api/cookies/me

HTTP/1.1 401 Unauthorized
{"status":401,"error":"Unauthorized","message":"Not logged in. POST /api/cookies/login first to get the 'apibee_session' cookie."}`;

const preflight = `$ curl -i -X OPTIONS https://api.snap-test.in/api/cache/etag \\
    -H "Origin: https://example.com" \\
    -H "Access-Control-Request-Method: PUT" \\
    -H "Access-Control-Request-Headers: If-Match, Content-Type"

HTTP/1.1 204 No Content
access-control-allow-headers: If-Match,Content-Type
access-control-allow-methods: PUT
access-control-allow-origin: *`;

export default function HeadersCachingCookies() {
  return (
    <>
      <P>
        Earlier lessons treated headers as metadata you read off a response.
        This one is about headers that change what the server does: which
        format it sends, whether it sends a body at all, whether it accepts
        your update, and who it thinks you are. Bugs here are easy to miss
        because the body usually looks fine.
      </P>

      <H2 id="content-negotiation">Content negotiation</H2>
      <P>
        The <C>Accept</C> request header lists the formats the client can
        handle. Some APIs can answer in more than one, and pick based on this
        header. Try it:
      </P>
      <Run path="/api/formats/negotiate" headers={{ Accept: "application/xml" }} />
      <Code code={negotiateXml} lang="curl" />
      <P>Without an <C>Accept</C> header, the same endpoint returns JSON:</P>
      <Code code={negotiateJson} lang="json" />
      <P>
        Look at the two bodies side by side. The JSON has <C>roles</C>,{" "}
        <C>score</C> and <C>manager</C>. The XML doesn&apos;t. The same user,
        two representations, and one of them is missing three fields. The CSV
        version is missing them too. Nobody notices this kind of bug by
        testing one format. When an API supports several, compare them field
        by field.
      </P>
      <P>
        Also ask for something the server can&apos;t produce. The correct
        answer is <C>406 Not Acceptable</C>, and this API gets it right,
        including a list of what it does support:
      </P>
      <Code code={notAcceptable} lang="curl" />
      <P>
        Many APIs ignore <C>Accept</C> and return JSON regardless. That is
        allowed, and usually harmless, but if the documentation promises
        XML, it&apos;s a bug.
      </P>

      <H3>Accept-Language and Vary</H3>
      <P>
        <C>Accept-Language</C> works the same way for human languages. The
        header can list several, with weights:
      </P>
      <Code code={vary} lang="curl" />
      <P>
        The response says which language it chose in{" "}
        <C>Content-Language</C>. It also has <C>Vary: Accept-Language</C>,
        which tells caches that this URL has different versions depending on
        that header. Without <C>Vary</C>, a shared cache could store the German
        response and hand it to the next person, who asked for French. If a
        response changes based on a request header, check that the header is
        listed in <C>Vary</C>. Also test a language the server doesn&apos;t
        support: <C>Accept-Language: xx</C> here falls back to English with a
        200, which is the usual choice.
      </P>

      <H2 id="caching">Caching</H2>
      <P>
        HTTP caching lets a client, a CDN or a proxy reuse a response instead
        of asking again. The server controls it with the{" "}
        <C>Cache-Control</C> header. Two values cover most cases.{" "}
        <C>max-age=N</C> says the response can be reused for N seconds.{" "}
        <C>no-store</C> says it must never be stored.
      </P>
      <Run path="/api/cache/max-age/60" showHeaders={["cache-control", "expires"]} />
      <P>
        Press Send, note <C>generatedAt</C>, and press it again within a
        minute. Your browser should reuse the stored response, so the
        timestamp stays the same. With curl you would see a new timestamp on
        every request, because curl has no cache. That difference trips up
        people who test in one tool and debug in another.
      </P>
      <Code code={noStore} lang="curl" />
      <P>
        What to test depends on the data. Anything personal (a profile, an
        account balance, a list of orders) should have <C>no-store</C> or{" "}
        <C>private</C>, and never <C>public</C>. A <C>public, max-age=3600</C>{" "}
        on <C>/api/me</C> means a CDN may serve one user&apos;s profile to
        another user for an hour. That has happened in production at real
        companies. The opposite mistake is less dangerous but still costs
        money: static data like a country list with <C>no-store</C>, so every
        page load hits the server.
      </P>

      <H3>ETags and 304</H3>
      <P>
        An ETag is a version label for a response. The client stores it and
        sends it back later in <C>If-None-Match</C>. If the resource
        hasn&apos;t changed, the server answers <C>304 Not Modified</C> with
        no body, and the client uses its stored copy. This API has a document
        built for trying it. Reset it first, since other people use it too:
      </P>
      <Code code={etagGet} lang="curl" />
      <Code code={etag304} lang="curl" />
      <P>
        A 304 and no body. Send a different value, say{" "}
        <C>&quot;doc-v9&quot;</C>, and you get the full 200 response again.
        Those are the two tests: matching tag gives 304, anything else gives
        200 with the current tag.
      </P>
      <Note title="Weak and strong tags">
        <P>
          The header in the 200 above is <C>W/&quot;doc-v1&quot;</C>, while
          the 304 and the body&apos;s own <C>etag</C> field say{" "}
          <C>&quot;doc-v1&quot;</C>. The <C>W/</C> marks a weak tag. In our
          runs the prefix came and went depending on the{" "}
          <C>Accept-Encoding</C> curl sent, which suggests something between
          the server and the client rewrites it. Weak tags work for{" "}
          <C>If-None-Match</C>, but not for <C>If-Match</C> below: sending{" "}
          <C>W/&quot;doc-v1&quot;</C> there returns 412 even when the document
          hasn&apos;t changed.
        </P>
      </Note>
      <P>
        Browsers do the <C>If-None-Match</C> dance on their own and show your
        code a 200 even when the network response was a 304. Test
        conditional requests with curl or a test script, where you control the
        headers.
      </P>

      <H3>If-Match and lost updates</H3>
      <P>
        ETags also prevent lost updates. Two people load the same document.
        Both edit it. The second save silently overwrites the first. With{" "}
        <C>If-Match</C>, each save says &quot;only apply this if the document
        is still the version I loaded&quot;:
      </P>
      <Code code={ifMatch} lang="curl" />
      <P>
        Three different outcomes. No <C>If-Match</C> at all gives{" "}
        <C>428 Precondition Required</C>, because this endpoint insists on
        it. The current tag gives 200 and a new version. The old tag, sent a
        second time, gives <C>412 Precondition Failed</C>. That last one is
        the second person&apos;s save, correctly refused. Reset the document
        when you&apos;re done.
      </P>
      <P>
        If an API documents optimistic locking like this, test the stale
        write every time. It is the whole point of the feature, and it is
        rarely covered by the developer&apos;s own tests.
      </P>

      <H3>Last-Modified</H3>
      <P>
        <C>Last-Modified</C> and <C>If-Modified-Since</C> do the same job with
        a date instead of a tag:
      </P>
      <Code code={lastModified} lang="curl" />
      <P>
        The same date and any later date give 304. An earlier date gives 200.
        An invalid date is ignored and gives 200, which is what the HTTP spec
        requires. Dates have only one-second precision, so this scheme
        can&apos;t tell apart two changes in the same second. ETags can.
      </P>

      <H2 id="cookies">Cookies</H2>
      <P>
        A cookie is a value the server asks the client to store and send back.
        The server sets it with <C>Set-Cookie</C>, and the client returns it in
        a <C>Cookie</C> header on later requests to the same site. Cookies
        carry sessions, preferences and CSRF tokens.
      </P>
      <P>
        The attributes after the value decide how safe the cookie is. You
        can set each one on this endpoint:
      </P>
      <Code code={setCookie} lang="curl" />
      <Table
        head={["Attribute", "What it does", "What to check"]}
        rows={[
          [<C key="h">HttpOnly</C>, "JavaScript on the page can't read the cookie.", "Session cookies must have it, so an XSS bug can't steal the session."],
          [<C key="s">Secure</C>, "Only sent over HTTPS.", "Session cookies on an HTTPS site must have it."],
          [<C key="ss">SameSite</C>, "Controls whether the cookie is sent on requests from other sites. Strict, Lax or None.", "Lax or Strict for sessions. None requires Secure."],
          [<C key="m">Max-Age / Expires</C>, "When the cookie is deleted. Without either, it lasts until the browser closes.", "Session lifetime matches the requirements."],
          [<C key="p">Path / Domain</C>, "Which URLs receive the cookie.", "Not wider than needed, especially Domain."],
        ]}
      />
      <P>
        This API warns you when a combination won&apos;t work in browsers:
      </P>
      <Code code={sameSiteNone} lang="curl" />

      <H3>A login session</H3>
      <P>
        Cookie-based login is a sequence of requests, and curl can follow it
        with a cookie jar: <C>-c jar.txt</C> saves cookies from the response,{" "}
        <C>-b jar.txt</C> sends them. Log in:
      </P>
      <Code code={login} lang="curl" />
      <P>Then ask who you are, sending the jar:</P>
      <Code code={me} lang="curl" />
      <P>
        Look back at the <C>Set-Cookie</C> on the login response. It has{" "}
        <C>HttpOnly</C> and <C>SameSite=Lax</C>, but no <C>Secure</C>, and the
        request went over HTTPS. The <A href="/docs/cookies">reference</A>{" "}
        says the cookie is &quot;Secure only over HTTPS&quot;. The likely
        cause is that HTTPS ends at a proxy in front of the app, so the app
        thinks the request arrived over plain HTTP. It is a very common bug in
        real deployments and one you only find by reading the actual header,
        not the documentation.
      </P>
      <P>Now log out:</P>
      <Code code={logout} lang="curl" />
      <P>
        The server expires the cookie by setting a date in 1970. But deleting
        the cookie on the client isn&apos;t enough. The session also has to
        end on the server, or anyone who copied the cookie value can keep
        using it. Test that by sending the old value by hand after logout:
      </P>
      <Code code={reuse} lang="curl" />
      <P>
        401, so the session really ended. Keep this test in your checklist.
        It fails more often than you&apos;d expect.
      </P>

      <H2 id="cors">Why it works in curl and fails in the browser</H2>
      <P>
        Sooner or later you&apos;ll get a bug report that says the API is
        broken, and every request you send with curl works. Often the cause
        is CORS. Browsers stop a page on one site from reading responses from
        another site unless the server allows it with{" "}
        <C>Access-Control-Allow-*</C> headers. curl and Postman don&apos;t
        enforce CORS at all, so they can&apos;t reproduce the problem.
      </P>
      <P>
        For requests with custom headers or methods like PUT, the browser
        first sends an <C>OPTIONS</C> request, called a preflight, and only
        sends the real request if the answer allows it. You can send the
        preflight yourself:
      </P>
      <Code code={preflight} lang="curl" />
      <P>
        This API allows any origin, which is why the Send buttons on these
        pages work. When you test an API used by a web app, check the
        preflight for each method and custom header the app uses, and check
        which response headers are listed in{" "}
        <C>Access-Control-Expose-Headers</C>: a browser can&apos;t read a
        header like <C>X-Total-Count</C> unless it is listed there, even when
        the response contains it.
      </P>
      <Ul>
        <li>
          <C>Access-Control-Allow-Origin: *</C> is fine for public data. It
          can&apos;t be combined with cookies, and an API that echoes back
          any <C>Origin</C> together with{" "}
          <C>Access-Control-Allow-Credentials: true</C> lets any website make
          logged-in requests as your users.
        </li>
        <li>
          Browsers refuse to let scripts set some headers, including{" "}
          <C>Cookie</C> and <C>Host</C>. That&apos;s why the cookie examples
          in this lesson use curl.
        </li>
      </Ul>

      <Exercise>
        <P>Write expected results first, then check them with curl.</P>
        <Ul>
          <li>
            Request <C>/api/formats/negotiate</C> with{" "}
            <C>Accept: text/csv</C>, then with{" "}
            <C>Accept: text/csv;q=0.5, application/xml</C>. Which format should
            the second one return, and does it?
          </li>
          <li>
            Log in at <C>/api/cookies/login</C> as <C>admin</C> /{" "}
            <C>admin123</C> using a cookie jar. Call <C>/api/cookies/me</C>,
            then log out, then call <C>/api/cookies/me</C> again with the
            session value you saved before logging out.
          </li>
          <li>
            Reset the ETag document, then play both editors in a lost-update
            scenario: two GETs, two PUTs with the same <C>If-Match</C>. Write
            down the exact status and body of each request, and reset the
            document at the end.
          </li>
        </Ul>
      </Exercise>
    </>
  );
}
