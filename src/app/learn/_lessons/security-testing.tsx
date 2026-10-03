import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const forbidden = `HTTP/1.1 403 Forbidden

{
  "status": 403,
  "error": "Forbidden",
  "message": "This endpoint requires the 'admin' role.",
  "roles": ["user"],
  "scopes": ["read", "write"]
}`;

const noToken = `$ curl -i https://api.testingapis.com/api/auth/jwt/me
HTTP/1.1 401 Unauthorized
www-authenticate: Bearer

$ curl -i https://api.testingapis.com/api/auth/jwt/me -H "Authorization: Bearer abc.def.ghi"
HTTP/1.1 401 Unauthorized
www-authenticate: Bearer error="invalid_token"`;

const massAssignment = `curl -X POST https://api.testingapis.com/api/Employees \\
  -H "Content-Type: application/json" \\
  -d '{"id": 1, "firstName": "Test", "lastName": "Mass",
       "email": "mass@example.com", "department": "Engineering",
       "salary": 50000, "role": "admin"}'`;

const massAssignmentResponse = `{
  "message": "Employee created successfully",
  "data": {
    "id": 27,
    "firstName": "Test",
    "lastName": "Mass",
    "email": "mass@example.com",
    "department": "Engineering",
    "salary": 50000,
    "active": false,
    ...
  }
}`;

const strict = `{
  "type": "https://apibee.dev/problems/unknown-fields",
  "title": "Request body contains unknown fields.",
  "status": 400,
  "detail": "Allowed fields: name, email, quantity (names are case-sensitive).",
  "instance": "/api/validation/strict",
  "unknownFields": ["role"]
}`;

const leak = `{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "newProduct": ["The newProduct field is required."],
    "$.price": ["The JSON value could not be converted to System.Decimal. Path: $.price | LineNumber: 0 | BytePositionInLine: 26."]
  },
  "traceId": "00-ffeb0f935ad44537bcfedcc1860e81b5-cb257520b1d5e8bc-00"
}`;

export default function SecurityTesting() {
  return (
    <>
      <Note title="Only test what you have permission to test">
        <P>
          Everything in this lesson is aimed at this practice API, or at
          systems your team owns. Sending these requests to someone
          else&apos;s API without written permission can break its terms of
          service and, in many countries, the law. At work, get the scope in
          writing before you start, even for your own company&apos;s staging
          environment.
        </P>
      </Note>

      <P>
        Security testing at the API level is mostly about checking that the
        API enforces its own rules. A user can see their own orders and not
        yours. A normal account can&apos;t call admin endpoints. A client
        can&apos;t set fields that only the server should set. None of this
        needs special hacking skill. It needs the same habits as the earlier
        lessons, applied to the question &quot;what should this caller not be
        allowed to do?&quot;
      </P>
      <P>
        The <A href="https://owasp.org/API-Security/editions/2023/en/0x11-t10/">OWASP API Security Top 10</A>{" "}
        (2023 edition) is the list most teams use as a checklist. You
        don&apos;t need to memorise it. Most of the items in it that a tester
        can check with ordinary requests are covered below.
      </P>

      <H2 id="function-level">Who can call which endpoint</H2>
      <P>
        Start with the easiest check: an endpoint meant for admins should
        refuse everyone else. This API has test tokens with different roles.{" "}
        <C>user-token</C> has the role <C>user</C>, and <C>admin-token</C> has{" "}
        <C>admin</C> and <C>user</C>. Send the user token to the admin
        endpoint:
      </P>
      <Run path="/api/auth/roles/admin" headers={{ Authorization: "Bearer user-token" }} />
      <Code code={forbidden} lang="text" label="Response" />
      <P>
        A 403 is correct here. The token is valid, so this isn&apos;t a 401.
        It&apos;s a valid token without enough permission. With{" "}
        <C>admin-token</C> the same request returns 200. The same pattern
        applies to scopes: <C>DELETE /api/auth/roles/resource</C> needs the{" "}
        <C>delete</C> scope, and the user token gets a 403 that says so.
      </P>
      <P>
        One request per role isn&apos;t enough in a real system. Write the
        rules down as a matrix, with every role across the top and every
        sensitive endpoint down the side, and fill in the status you expect.
        Then run all of it. The gaps usually show up in the corners: the
        export endpoint nobody remembered, the <C>PUT</C> that checks
        permissions while the <C>PATCH</C> on the same path doesn&apos;t, or
        the old <C>/v1</C> route that still accepts a role the new one
        rejects.
      </P>
      <Table
        head={["Endpoint", "No token", "user-token", "admin-token"]}
        rows={[
          [<C key="a">GET /api/auth/roles/user</C>, "401", "200", "200"],
          [<C key="b">GET /api/auth/roles/admin</C>, "401", "403", "200"],
          [<C key="c">DELETE /api/auth/roles/resource</C>, "401", "403", "200"],
        ]}
      />
      <P>
        That table is what the <A href="/docs/auth-schemes">auth docs</A>{" "}
        say should happen. Checking it is the exercise at the end of this
        lesson.
      </P>

      <H2 id="object-level">Whose record is it</H2>
      <P>
        The most common serious API bug has an awkward name: broken object
        level authorization, first on the OWASP list. It means the API checks
        that you are logged in but not that the record you asked for belongs
        to you.
      </P>
      <P>
        Picture a shop API. You log in as Asha and fetch your order with{" "}
        <C>GET /orders/1042</C>. The response contains your address and the
        last four digits of your card. Now change the URL to{" "}
        <C>/orders/1041</C>. If you get someone else&apos;s order back, that
        is the bug. The server authenticated you correctly and then trusted
        the ID in the URL.
      </P>
      <P>The method for testing it is always the same:</P>
      <Ul>
        <li>Create two test users, A and B, each with some records of their own.</li>
        <li>Log in as A and note the IDs of A&apos;s records.</li>
        <li>
          Log in as B and request each of A&apos;s records by ID, with every
          method the endpoint supports. Reading is bad. Updating or deleting
          is worse.
        </li>
        <li>
          Expect a 404 or a 403. Many teams prefer 404, because a 403
          confirms the record exists.
        </li>
      </Ul>
      <P>
        Look beyond the URL path. IDs also travel in query strings, in
        request bodies (<C>{`"accountId": 7`}</C> inside a transfer
        request) and in nested routes like <C>/users/7/invoices</C>. Every
        one of them is a place where the server has to check ownership
        again.
      </P>
      <P>
        This practice API doesn&apos;t have per-user records on its resource
        endpoints. Anyone can read any product or employee, on purpose. So
        you can&apos;t find this bug here. You will find it in real systems
        more often than you&apos;d expect, and the only way to catch it is to
        test with two accounts.
      </P>

      <H2 id="authentication">Missing and broken credentials</H2>
      <P>
        The <A href="/learn/authentication">authentication lesson</A>{" "}
        covered the negative tests: no token, a wrong token, an expired one,
        and a JWT whose payload was edited without re-signing. For a security
        review, run all of them against every protected endpoint, not a
        sample. An endpoint added last month may have been registered without
        the auth check. Here is what a correct rejection looks like on this
        API:
      </P>
      <Code code={noToken} lang="curl" />
      <P>
        Both are 401, and the <C>WWW-Authenticate</C> header tells the client
        which scheme to use. The second one also says why the token was
        refused. What you don&apos;t want to see is a 500, which means the
        server crashed while reading the token, or a 200 with an empty body,
        which means the check didn&apos;t run at all.
      </P>

      <H2 id="mass-assignment">Fields the client shouldn&apos;t set</H2>
      <P>
        Many APIs take the JSON body of a request and copy it onto a database
        record. If the copy isn&apos;t filtered, a client can set fields the
        form never showed: <C>role</C>, <C>isAdmin</C>, <C>price</C>,{" "}
        <C>ownerId</C>, <C>balance</C>. This is called mass assignment. The
        test is to send those fields and then check whether they were stored.
      </P>
      <P>
        Try it on the employees resource. The body below sets an <C>id</C>{" "}
        (which the server should assign) and a <C>role</C> field that
        employees don&apos;t have:
      </P>
      <Code code={massAssignment} lang="curl" />
      <Code code={massAssignmentResponse} lang="json" label="Response (trimmed)" />
      <P>
        The server ignored the <C>id</C> of 1 and assigned 27, and it dropped{" "}
        <C>role</C>. That is safe. Silently ignoring unknown fields is one
        acceptable design. Rejecting them is another, and{" "}
        <C>/api/validation/strict</C> shows it:
      </P>
      <Code code={strict} lang="json" label="POST /api/validation/strict with a role field" />
      <P>
        Either is fine. The bug is the third option, where the field is
        stored. Don&apos;t trust the create response alone. Fetch the record
        again with a <C>GET</C>, because some APIs echo back what you sent
        while saving something different. Then try the same fields on{" "}
        <C>PUT</C> and <C>PATCH</C>, which are often written by a different
        developer on a different day. (Delete what you created afterwards.)
      </P>

      <H2 id="resource-consumption">Limits on size and volume</H2>
      <P>
        An API that returns as much as it&apos;s asked for can be knocked over
        by one request. OWASP calls this unrestricted resource consumption.
        The tests are about whether limits exist and whether they hold.
      </P>
      <P>
        On this API, list endpoints cap the page size. Ask for 1000 products
        and the response headers say <C>x-per-page: 100</C>. That is the cap
        working. Request bodies have limits too: the docs for{" "}
        <C>/api/bodies/large</C> put the upload limit at 10 MB, and larger
        uploads get a 413. JSON nested deeper than the parser allows is
        rejected with a 400.
      </P>
      <P>For your own APIs, check at least these:</P>
      <Ul>
        <li>A page size far above the documented maximum</li>
        <li>A request body a few times larger than any real client would send</li>
        <li>
          Arrays with thousands of items where the UI allows ten, for example
          bulk endpoints
        </li>
        <li>Search terms that match everything, combined with the largest page size</li>
        <li>
          Anything that sends email or SMS, or costs money per call. These
          need a rate limit even when the rest of the API doesn&apos;t
        </li>
      </Ul>
      <P>
        Do these one request at a time. The point is to find out whether a
        limit exists, not to see how much load the server takes. That belongs
        in the <A href="/learn/performance">performance lesson</A>, on your own
        environment.
      </P>

      <H2 id="input">Input that looks like code</H2>
      <P>
        Testers send strings like <C>{`' OR 1=1 --`}</C> or{" "}
        <C>{`<script>alert(1)</script>`}</C> to check that the server treats
        input as data and never as part of a database query or a page. The
        correct result is boring: a search for that text finds nothing, and
        a name field containing it is stored and returned exactly as sent.
        What you&apos;re looking for is anything else. A database error in
        the response, a result count that changes, or a slow response to a
        string containing a sleep command are all worth reporting.
      </P>
      <P>
        Try the SQL-looking search on this API with curl:
      </P>
      <Code
        code={`curl -i -G https://api.testingapis.com/api/Products --data-urlencode "q=' OR 1=1 --"`}
        lang="curl"
      />
      <P>
        You get a <C>403 Forbidden</C> with <C>Content-Type: text/html</C>.
        That page doesn&apos;t come from the API, which only ever returns
        JSON. It comes from the firewall in front of it, which blocks
        requests that look like attacks. The API never saw the request.
      </P>
      <P>
        This matters when you read test results. A firewall is a useful
        layer, but it isn&apos;t a fix, and it doesn&apos;t tell you whether
        the API itself handles the input safely. When a response doesn&apos;t
        match the format the API normally uses, work out which layer
        answered before you record a result. For injection testing, ask your
        team for an environment without the firewall, or with your test
        machine allowed through it. The <A href="/docs/edge-cases">edge cases</A>{" "}
        endpoint <C>/api/edge-cases/strings</C> returns a set of awkward
        strings (Unicode, right-to-left text, zero-width characters,
        injection-looking text) that are good test input for your own APIs.
      </P>

      <H2 id="error-messages">What error messages give away</H2>
      <P>
        Send a product with a string where a number belongs:
      </P>
      <Code
        code={`curl -X POST https://api.testingapis.com/api/Products -H "Content-Type: application/json" -d '{"title":"x","price":"abc"}'`}
        lang="curl"
      />
      <Code code={leak} lang="json" label="Response" />
      <P>
        The status is right, and the message is useful to a developer. It
        also reveals that the server is .NET (<C>System.Decimal</C>) and the
        name of a parameter in the code (<C>newProduct</C>). On a practice
        API that doesn&apos;t matter. On a production API it&apos;s a small
        finding, worth a low-priority ticket. The findings that matter more
        are stack traces, SQL statements, file paths, internal hostnames and
        library versions in error bodies. Trigger as many different errors as
        you can (wrong types, huge numbers, missing bodies, invalid IDs) and
        read every body.
      </P>

      <H2 id="headers">Response headers</H2>
      <P>
        A few response headers are worth checking on any API. This one gets
        some right and skips others, which is a reasonable choice for a
        public practice API, so read the right column as a description, not a
        verdict.
      </P>
      <Table
        head={["What to check", "Why", "This API"]}
        rows={[
          ["Plain HTTP redirects or is refused", "Credentials must never travel unencrypted", <span key="a">301 to https</span>],
          [<C key="b">Strict-Transport-Security</C>, "Tells browsers to use HTTPS only", "Not sent"],
          [<C key="c">Cache-Control: no-store</C>, "Keeps personal data out of shared caches", "Not sent on most responses"],
          [<C key="d">X-Content-Type-Options: nosniff</C>, "Stops browsers guessing a content type", "Not sent"],
          [<C key="e">Access-Control-Allow-Origin</C>, "Which websites may read responses", <span key="e2"><C>*</C>, without credentials</span>],
          ["Headers naming the software", "Saves an attacker a step", <span key="f"><C>x-powered-by</C> and <C>x-render-origin-server: Kestrel</C></span>],
        ]}
      />
      <P>
        For CORS, the combination to report is an API that reflects any{" "}
        <C>Origin</C> back and also sends{" "}
        <C>Access-Control-Allow-Credentials: true</C>. That lets any website
        make logged-in requests on behalf of a visitor. A wildcard without
        credentials, as here, is fine for public data.
      </P>

      <H2 id="csrf">Cookies and CSRF</H2>
      <P>
        If an API uses cookies for login, a browser attaches them to every
        request to that site, including requests started by another site.
        Cross-site request forgery (CSRF) uses that. The usual defences are{" "}
        <C>SameSite</C> cookie attributes (covered in the{" "}
        <A href="/learn/headers-caching-cookies">cookies lesson</A>) and a
        token that the client has to send back in a header. This API has a
        double-submit example: <C>GET /api/auth/csrf/token</C> sets the token
        as a cookie, and <C>POST /api/auth/csrf/submit</C> only succeeds when
        the <C>X-CSRF-Token</C> header matches it. The tests are to submit
        without the header, with a different value, and with the header but
        no cookie. All three should fail. APIs that use bearer tokens in the{" "}
        <C>Authorization</C> header aren&apos;t exposed to CSRF in the same
        way, because browsers don&apos;t add that header on their own.
      </P>

      <H2 id="tools">Tools</H2>
      <P>
        Everything above works with curl and a test runner, and writing the
        checks as automated tests means they run on every build. For
        exploratory security work, most people use an intercepting proxy.{" "}
        <A href="https://www.zaproxy.org/">OWASP ZAP</A> is free and open
        source, and <A href="https://portswigger.net/burp">Burp Suite</A> has
        a free community edition. Both sit between your client and the API,
        so you can pause a request, change it and send it again. Both also
        have automated scanners. Run those only against environments you own,
        and read their findings critically: they report many possibilities,
        and some are false positives.
      </P>

      <H3>What to write down</H3>
      <P>
        Security findings need the same bug report as any other (request,
        expected, actual), plus two extra lines: what an attacker could do
        with it, and who could do it (anyone, any logged-in user, only an
        admin). That second line is usually what decides the priority.
        Report security bugs through whatever private channel your team
        uses, not a public issue tracker.
      </P>

      <Exercise>
        <P>
          Check the role matrix from the start of this lesson. Send each of
          the three requests with no token, with <C>user-token</C>, with{" "}
          <C>admin-token</C>, and then with <C>readonly-token</C>, which the
          table doesn&apos;t cover. Before each request, write down the status
          you expect.
        </P>
        <P>
          Then pick one write endpoint, such as <C>POST /api/Books</C>, and
          test it for mass assignment: send an <C>id</C>, a{" "}
          <C>createdAt</C> and a field that doesn&apos;t exist, fetch the
          record again, and note what was stored. Delete the record when
          you&apos;re done.
        </P>
      </Exercise>
    </>
  );
}
