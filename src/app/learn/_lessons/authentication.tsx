import { A, C, Code, Exercise, H2, H3, Note, Ol, P, Run, Table, Ul } from "@/components/lesson";

const basicMissing = `$ curl -i https://api.snap-test.in/api/auth/basic

HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
www-authenticate: Basic realm="apibee", charset="UTF-8"

{"status":401,"error":"Unauthorized","message":"Missing or malformed Basic Authorization header."}`;

const basicOk = `$ curl -v -u apibee:password123 https://api.snap-test.in/api/auth/basic

> GET /api/auth/basic HTTP/1.1
> Host: api.snap-test.in
> Authorization: Basic YXBpYmVlOnBhc3N3b3JkMTIz
...
{"authenticated":true,"scheme":"basic","user":"apibee"}`;

const base64Decode = `$ echo YXBpYmVlOnBhc3N3b3JkMTIz | base64 -d
apibee:password123`;

const apiKeys = `$ curl -H "X-API-Key: apibee-key-123" https://api.snap-test.in/api/auth/api-key/header
{"authenticated":true,"scheme":"api-key","location":"X-API-Key header"}

$ curl "https://api.snap-test.in/api/auth/api-key/query?api_key=apibee-key-123"
{"authenticated":true,"scheme":"api-key","location":"api_key query parameter"}

$ curl -b api_key=apibee-key-123 https://api.snap-test.in/api/auth/api-key/cookie
{"authenticated":true,"scheme":"api-key","location":"api_key cookie"}`;

const wrongKey = `$ curl -i -H "X-API-Key: wrong" https://api.snap-test.in/api/auth/api-key/header

HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"status":403,"error":"Forbidden","message":"Invalid API key."}`;

const rolesForbidden = `{
  "status": 403,
  "error": "Forbidden",
  "message": "This endpoint requires the 'admin' role.",
  "roles": ["user"],
  "scopes": ["read", "write"]
}`;

const jwtLogin = `$ curl -X POST https://api.snap-test.in/api/auth/jwt/login \\
    -H "Content-Type: application/json" \\
    -d '{"username":"user","password":"user123"}'

{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2Fw...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "refreshToken": "jrt_c9239f1c1befa5d736fd92a5d34b2df094b7015e",
  "user": { "username": "user", "role": "user", "name": "Uma User" }
}`;

const jwtPayload = `{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "user",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "user",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "user@apibee.dev",
  "jti": "270552c5-946e-405b-88fb-63bcabebdcfd",
  "nbf": 1790793092,
  "exp": 1790793992,
  "iss": "http://localhost:5251",
  "aud": "http://localhost:5251"
}`;

const jwtMe = `$ curl -H "Authorization: Bearer $TOKEN" https://api.snap-test.in/api/auth/jwt/me

{"username":"user","role":"user","name":"Uma User","email":"user@apibee.dev","claims":[...]}

$ curl -i -H "Authorization: Bearer $TOKEN" https://api.snap-test.in/api/auth/jwt/admin

HTTP/1.1 403 Forbidden
Content-Length: 0`;

const expired = `$ curl -i -H "Authorization: Bearer $EXPIRED" https://api.snap-test.in/api/auth/jwt/me

HTTP/1.1 401 Unauthorized
Content-Length: 0
www-authenticate: Bearer error="invalid_token", error_description="The token expired at '09/30/2026 17:31:34'"`;

const tamper = `// tamper.mjs: change the role claim without re-signing the token
const [header, payload, signature] = process.argv[2].split(".");
const claims = JSON.parse(Buffer.from(payload, "base64url"));
claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] = "admin";
const forged = Buffer.from(JSON.stringify(claims)).toString("base64url");
console.log([header, forged, signature].join("."));`;

const tamperResult = `$ FORGED=$(node tamper.mjs "$TOKEN")
$ curl -i -H "Authorization: Bearer $FORGED" https://api.snap-test.in/api/auth/jwt/admin

HTTP/1.1 401 Unauthorized
Content-Length: 0
www-authenticate: Bearer error="invalid_token", error_description="The signature key was not found"`;

const refresh = `$ curl -X POST https://api.snap-test.in/api/auth/jwt/refresh \\
    -H "Content-Type: application/json" \\
    -d '{"refreshToken":"jrt_c9239f1c1befa5d736fd92a5d34b2df094b7015e"}'

{"accessToken":"eyJhbGciOi...","tokenType":"Bearer","expiresIn":900,"refreshToken":"jrt_80fe85394e53de2230543855284f9664ede00450",...}

$ curl -X POST https://api.snap-test.in/api/auth/jwt/refresh \\
    -H "Content-Type: application/json" \\
    -d '{"refreshToken":"jrt_c9239f1c1befa5d736fd92a5d34b2df094b7015e"}'

{"status":401,"error":"Unauthorized","message":"Refresh token is invalid, expired or already used."}`;

export default function Authentication() {
  return (
    <>
      <P>
        Most real APIs don&apos;t answer everyone. Before the server does
        anything useful, it wants to know who is asking, and then whether that
        person is allowed to do what they asked. Those are two separate
        questions, and a lot of security bugs come from an API that answers
        the first one and forgets the second.
      </P>
      <P>
        Authentication is the first question: who are you. The client proves
        its identity with a password, a key or a token. Authorization is the
        second: now that I know who you are, may you do this. A logged-in
        customer is authenticated. That doesn&apos;t mean they may delete
        another customer&apos;s order.
      </P>

      <H2 id="401-vs-403">401 and 403</H2>
      <P>
        HTTP has a status code for each question, and the names are
        misleading. <C>401 Unauthorized</C> actually means unauthenticated: the
        server doesn&apos;t know who you are, because you sent no credentials
        or the ones you sent are wrong. <C>403 Forbidden</C> means the server
        knows exactly who you are and the answer is still no.
      </P>
      <P>
        A 401 should come with a <C>WWW-Authenticate</C> header that tells the
        client how to authenticate. Send a request without credentials to the
        Basic auth endpoint:
      </P>
      <Code code={basicMissing} lang="curl" />
      <P>
        The header says: use Basic authentication, for the protection space
        called <C>apibee</C>. Browsers read this header and show their
        built-in login box. API clients mostly ignore it, but it is part of
        the spec, and its absence on a 401 is a small bug worth reporting.
      </P>
      <P>
        When you test an endpoint, the distinction matters because the two
        codes lead to different client behaviour. On a 401 a client should
        ask the user to log in again or refresh its token. On a 403 logging in
        again won&apos;t help, so the client should show a &quot;you
        don&apos;t have access&quot; message. An API that returns 401 for a
        permissions problem sends users into a login loop.
      </P>

      <H2 id="basic-auth">Basic auth</H2>
      <P>
        Basic auth is the oldest scheme and the simplest. The client joins the
        username and password with a colon, encodes the result as Base64 and
        sends it in the <C>Authorization</C> header. With curl, the{" "}
        <C>-u</C> option does this for you, and <C>-v</C> shows the header it
        built:
      </P>
      <Code code={basicOk} lang="curl" />
      <P>
        Base64 is an encoding, not encryption. Anyone who sees the header can
        turn it back into the password in one command:
      </P>
      <Code code={base64Decode} lang="curl" />
      <P>
        So Basic auth is only acceptable over HTTPS, and even then the
        password travels with every single request. When you test an API that
        uses it, check that plain HTTP is refused or redirected, and check
        that the credentials never show up in logs or error messages. You can
        try the encoding yourself with the <A href="/tools/base64">Base64 tool</A>.
      </P>
      <P>
        Wrong credentials also give a 401, with a different message:{" "}
        <C>Invalid username or password.</C> That message is fine. A message
        that said &quot;unknown user&quot; for one case and &quot;wrong
        password&quot; for the other would tell an attacker which usernames
        exist.
      </P>

      <H2 id="api-keys">API keys</H2>
      <P>
        An API key is a long random string that identifies a client
        application rather than a person. Payment providers, map services and
        weather APIs usually work this way. The key can travel in a header, a
        query parameter or a cookie, and this API accepts all three on
        separate endpoints:
      </P>
      <Code code={apiKeys} lang="curl" />
      <P>
        The header is the right place. A key in the query string ends up in
        places nobody thinks of as secret: web server access logs, proxy logs,
        browser history, analytics tools and the <C>Referer</C> header sent to
        other sites. If you find an API that takes keys in the URL, it is
        worth a note in your report even if nothing is broken yet.
      </P>
      <P>Here is what happens with a wrong key:</P>
      <Code code={wrongKey} lang="curl" />
      <P>
        A 403, where the Basic auth endpoint returned 401 for a wrong
        password. You could argue either way. An invalid key means the server
        doesn&apos;t know who you are, which by the definitions above is a
        401. Some well-known APIs return 403 here anyway. What you should
        check is that the API is consistent with itself and with its
        documentation, because client code is written against one or the
        other. Inconsistencies like this are some of the most common findings
        in auth testing.
      </P>

      <H2 id="bearer-tokens">Bearer tokens and roles</H2>
      <P>
        A bearer token is sent as <C>Authorization: Bearer &lt;token&gt;</C>.
        The name means that whoever bears the token gets access, with no
        further proof. Losing a bearer token is like losing a house key.
      </P>
      <P>
        This API has a few fixed tokens with different roles, which makes it
        easy to see authorization separately from authentication. The admin
        endpoint with a user&apos;s token:
      </P>
      <Run path="/api/auth/roles/admin" headers={{ Authorization: "Bearer user-token" }} />
      <P>The server knows who you are and refuses anyway:</P>
      <Code code={rolesForbidden} lang="json" />
      <P>Now the same endpoint with the admin token:</P>
      <Run path="/api/auth/roles/admin" headers={{ Authorization: "Bearer admin-token" }} />
      <P>
        Roles and scopes are where most authorization bugs live. A role is
        what the user is (admin, user). A scope is what a token may do (read,
        write, delete). For every protected endpoint you want at least one
        test per role that should be allowed and one per role that should
        not. A small table helps. This is what the three role endpoints on
        this API return:
      </P>
      <Table
        head={["Token", "GET /roles/user", "GET /roles/admin", "DELETE /roles/resource"]}
        rows={[
          [<C key="a">admin-token</C>, "200", "200", "200"],
          [<C key="u">user-token</C>, "200", "403", "403"],
          [<C key="r">readonly-token</C>, "403", "403", "403"],
          ["none", "401", "401", "401"],
        ]}
      />
      <P>
        Fill in the expected values from the requirements first, then run the
        requests and compare. Filling in the table from the actual responses
        and calling that the expected result is a very common mistake. It
        turns the test into a record of whatever the API does today.
      </P>

      <H2 id="jwt">JWTs</H2>
      <P>
        A JSON Web Token is a bearer token with data inside it. You usually
        get one by logging in:
      </P>
      <Code code={jwtLogin} lang="curl" />
      <P>
        The access token is trimmed above. In full it is three Base64URL
        strings joined by dots: a header, a payload and a signature. The
        payload is readable by anyone. Decode the middle part of the token
        above and you get:
      </P>
      <Code code={jwtPayload} lang="json" />
      <P>
        The long claim names are the ones ASP.NET uses. Other frameworks use
        short names like <C>sub</C> and <C>role</C>. The standard ones to know
        are <C>exp</C> (expiry, in Unix seconds), <C>nbf</C> (not valid
        before), <C>iss</C> (who issued it) and <C>aud</C> (who it is for).
        Here <C>exp</C> minus <C>nbf</C> is 900 seconds, which matches the{" "}
        <C>expiresIn</C> of 15 minutes in the login response. That is a quick
        check worth doing on any login endpoint. You can paste a token into
        the <A href="/tools/jwt-decoder">JWT decoder</A> to read it.
      </P>
      <Note title="Never paste real tokens into online tools">
        <P>
          The tokens in this lesson are for a public test API. A token from
          your company&apos;s staging or production system is a live
          credential. Decode it locally (the decoder on this site runs in your
          browser, but many others send what you paste to a server).
        </P>
      </Note>
      <P>
        Because the payload is only encoded, a JWT must never hold secrets.
        Test for that too: log in, decode the token and check for passwords,
        internal IDs or personal data that the client has no need for.
      </P>
      <P>
        Send the token to <C>/api/auth/jwt/me</C> to see the claims the server
        accepted, and to <C>/api/auth/jwt/admin</C> to see the role check:
      </P>
      <Code code={jwtMe} lang="curl" />
      <P>
        Notice the empty body on the 403. The other auth endpoints on this API
        return a JSON error, but the JWT ones return nothing. That is another
        consistency finding, and on a real project a client developer would
        thank you for it.
      </P>

      <H3>Expired tokens</H3>
      <P>
        Tokens are short-lived on purpose. <C>GET /api/auth/jwt/expired</C>{" "}
        returns a token that was correctly signed but expired an hour ago, so
        you don&apos;t have to wait fifteen minutes to test expiry:
      </P>
      <Code code={expired} lang="curl" />
      <P>
        A 401 with <C>error=&quot;invalid_token&quot;</C> in{" "}
        <C>WWW-Authenticate</C>. The client can use that to decide to refresh
        rather than log the user out. Also check a token that expired one
        second ago, if you can produce one: servers often allow a few minutes
        of clock skew, and whether that tolerance is 30 seconds or a whole day
        matters.
      </P>

      <H3>Refresh tokens</H3>
      <P>
        When the access token expires, the client exchanges the refresh token
        from the login response for a new pair. A good server rotates refresh
        tokens: each one works exactly once. This one does. The second
        request with the same refresh token fails:
      </P>
      <Code code={refresh} lang="curl" />
      <P>
        If a used refresh token still works, anyone who stole one old token
        can keep minting new access tokens indefinitely. Always test the
        second use.
      </P>

      <H2 id="tampered-token">Tampering with a token</H2>
      <P>
        The signature is what stops a user from editing their own token. The
        payload says <C>role: user</C>. What if you change it to{" "}
        <C>admin</C> and keep the old signature? This script does exactly
        that:
      </P>
      <Code code={tamper} lang="javascript" />
      <Code code={tamperResult} lang="curl" />
      <P>
        Rejected, as it should be. The server recalculated the signature over
        the edited payload, and it didn&apos;t match. The error description
        (&quot;signature key was not found&quot;) is an odd way of saying so,
        but the status is right. Real APIs have shipped with this check
        missing, usually because a library was configured to decode tokens
        without verifying them, or because it accepted the{" "}
        <C>none</C> algorithm. It takes two minutes to test, so test it on
        every API that uses JWTs.
      </P>

      <H2 id="checklist">A negative test checklist</H2>
      <P>
        For each protected endpoint, these are the requests to send. The happy
        path is one test. The rest are the ones that find bugs.
      </P>
      <Ol>
        <li>No credentials at all. Expect 401 with <C>WWW-Authenticate</C>.</li>
        <li>Wrong credentials: a wrong password, an unknown key, a random token. Expect 401.</li>
        <li>
          A malformed header: <C>Authorization: apibee-token-123</C> without
          the word Bearer, <C>Bearer</C> with nothing after it, Basic with a
          value that isn&apos;t Base64. Expect 401, never 500.
        </li>
        <li>An expired token. Expect 401.</li>
        <li>A valid token with too few permissions. Expect 403.</li>
        <li>A token with an edited payload and the original signature. Expect 401.</li>
        <li>A refresh token used twice. The second use should fail.</li>
        <li>After logout or revocation, the old token. It should stop working.</li>
      </Ol>
      <P>
        Also look at what the error responses leak. Error messages should
        not include stack traces, the expected token, or whether a username
        exists. And watch the timing: if a wrong password for a real user
        takes 300 ms and a nonexistent user takes 5 ms, the difference tells
        an attacker which accounts exist, even with identical messages.
      </P>
      <P>
        One API can use several of these schemes at once. The{" "}
        <A href="/docs/auth-schemes">auth schemes reference</A> lists every
        one this API supports, including Digest, HMAC signatures and CSRF
        tokens, which follow the same pattern: a valid request, then each way
        it can be wrong.{" "}
        <A href="/learn/security-testing">Security testing basics</A> goes
        further into authorization bugs between users.
      </P>

      <Exercise>
        <P>
          Run the checklist above against{" "}
          <C>GET /api/auth/api-key/header</C> (the valid key is{" "}
          <C>apibee-key-123</C>). Write down the status you expect for each
          item before you send it, then note every response that differs.
          Some items won&apos;t apply to API keys; say which and why.
        </P>
        <Ul>
          <li>
            Then log in at <C>POST /api/auth/jwt/login</C> as{" "}
            <C>admin</C> / <C>admin123</C>, decode the token and find the role
            claim. Call <C>/api/auth/jwt/admin</C> with it, and check that{" "}
            <C>exp</C> minus <C>nbf</C> matches <C>expiresIn</C>.
          </li>
          <li>
            Send <C>Authorization: Bearer</C> with a trailing space and no
            token to <C>/api/auth/bearer</C>, <C>/api/auth/jwt/me</C> and{" "}
            <C>/api/auth/roles/user</C>. Compare the three responses. Which one
            would you rather code a client against, and why?
          </li>
        </Ul>
      </Exercise>
    </>
  );
}
