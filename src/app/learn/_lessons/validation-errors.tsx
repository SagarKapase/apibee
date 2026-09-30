import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const validBody = `{
  "username": "ava_t",
  "email": "ava@example.com",
  "password": "Str0ng!Pass",
  "confirmPassword": "Str0ng!Pass",
  "age": 29,
  "country": "us",
  "phone": "+15550101",
  "acceptTerms": true
}`;

const validResponse = `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "message": "User registered successfully",
  "data": {
    "id": 1001,
    "username": "ava_t",
    "email": "ava@example.com",
    "age": 29,
    "country": "US",
    "createdAt": "2026-09-30T18:32:12Z"
  }
}`;

const badBody = `{
  "username": "ab",
  "email": "ava@example",
  "password": "password",
  "confirmPassword": "Password",
  "age": 17,
  "country": "XX",
  "acceptTerms": false
}`;

const badResponse = `HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json; charset=utf-8

{
  "type": "https://apibee.dev/problems/validation-error",
  "title": "One or more fields failed validation.",
  "status": 422,
  "detail": "7 field(s) failed validation.",
  "instance": "/api/validation/register",
  "errors": {
    "username": ["Username must be 3-20 characters long."],
    "email": ["Email must be a valid email address."],
    "password": [
      "Password must contain an uppercase letter.",
      "Password must contain a digit.",
      "Password must contain a special character."
    ],
    "confirmPassword": ["Passwords do not match."],
    "age": ["Age must be between 18 and 120."],
    "country": ["Country must be one of: US, GB, IN, DE, FR, JP, CA, AU, BR."],
    "acceptTerms": ["You must accept the terms and conditions."]
  }
}`;

const strictUnknown = `curl -X POST https://api.snap-test.in/api/validation/strict \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Widget", "email": "a@b.co", "quantity": 2, "discount": 50}'

HTTP/1.1 400 Bad Request
Content-Type: application/problem+json; charset=utf-8

{
  "type": "https://apibee.dev/problems/unknown-fields",
  "title": "Request body contains unknown fields.",
  "status": 400,
  "detail": "Allowed fields: name, email, quantity (names are case-sensitive).",
  "instance": "/api/validation/strict",
  "unknownFields": ["discount"]
}`;

const bodyProblems = `# No body at all
HTTP/1.1 400 Bad Request
{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"One or more validation errors occurred.","status":400,"errors":{"":["A non-empty request body is required."]},"traceId":"00-fc01be6d..."}

# {"username":"ava_t",}  (trailing comma)
HTTP/1.1 400 Bad Request
{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"One or more validation errors occurred.","status":400,"errors":{"$":["The JSON object contains a trailing comma at the end which is not supported in this mode. Change the reader options. Path: $ | LineNumber: 0 | BytePositionInLine: 20."]},"traceId":"00-e13ac011..."}

# [] instead of an object
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
{"status":400,"error":"Bad Request","message":"Request body must be a JSON object."}

# Valid JSON sent as Content-Type: text/plain
HTTP/1.1 415 Unsupported Media Type
{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.16","title":"Unsupported Media Type","status":415,"traceId":"00-4cadc1e1..."}`;

const leakyError = `curl -X POST https://api.snap-test.in/api/Books \\
  -H "Content-Type: application/json" \\
  -d '{"title": "x", "author": "y", "pages": "many"}'

HTTP/1.1 400 Bad Request

{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "item": ["The item field is required."],
    "$.pages": ["The JSON value could not be converted to System.Int32. Path: $.pages | LineNumber: 0 | BytePositionInLine: 40."]
  },
  "traceId": "00-d027cc55a2925746a1bf93cc96d2306d-02234fa55d940604-00"
}`;

export default function ValidationErrors() {
  return (
    <>
      <P>
        The previous lesson sent good data and checked that it was stored.
        This one sends bad data and checks that it is refused. In most
        projects this is where the bugs are. Developers write the happy path
        first, test it by hand while they build it, and then run out of time
        before they have thought about what a client could send instead.
      </P>
      <P>
        A validation test has two parts. The server must reject the request
        with the right status, and it must store nothing. After that, the
        quality of the error message matters, because another developer will
        read it at some point while trying to work out what they did wrong.
      </P>

      <H2 id="register">A form with rules</H2>
      <P>
        <C>POST /api/validation/register</C> is a sign-up endpoint with
        written rules. The <A href="/docs/validation">reference page</A>{" "}
        lists them: the username is 3 to 20 letters, digits or underscores,
        the age is an integer from 18 to 120, the country is one of nine
        codes, and so on. Nothing is stored, so you can send the same body
        as many times as you like. A valid request:
      </P>
      <Run method="POST" path="/api/validation/register" body={validBody} />
      <Code code={validResponse} lang="text" label="Response" />
      <P>
        Notice that <C>&quot;us&quot;</C> came back as <C>&quot;US&quot;</C>.
        The server normalised the value instead of rejecting it. That is
        fine, but it is a behaviour, and a test should pin it down so that
        nobody changes it by accident.
      </P>
      <P>Now break almost every rule at once:</P>
      <Run method="POST" path="/api/validation/register" body={badBody} />
      <Code code={badResponse} lang="text" label="Response" />
      <P>
        This is a good error response, and it is worth looking at why so you
        can recognise a bad one later.
      </P>
      <Ul>
        <li>
          It reports every problem in one go. A client fixing the form
          doesn&apos;t have to submit it seven times to find seven mistakes.
        </li>
        <li>
          Each error is keyed by the field name the client sent, so a UI can
          show it next to the right input.
        </li>
        <li>
          The messages state the rule (&quot;between 18 and 120&quot;)
          instead of saying the value is wrong and leaving the client to
          guess why.
        </li>
        <li>
          It follows RFC 7807 (updated as RFC 9457), a standard format for
          HTTP errors with the fields <C>type</C>, <C>title</C>,{" "}
          <C>status</C>, <C>detail</C> and <C>instance</C>, and the media type{" "}
          <C>application/problem+json</C>. You don&apos;t need to insist on
          this format, but if an API claims to use it, check that the fields
          are there and that <C>status</C> in the body matches the real
          status code.
        </li>
      </Ul>

      <H2 id="what-to-send">What to send</H2>
      <P>
        You won&apos;t try everything on every field. Go through each field
        and ask which of these could apply:
      </P>
      <Table
        head={["Kind of input", "Examples"]}
        rows={[
          ["Missing", "Leave the field out entirely. Send it as null. Send an empty string. These can behave differently."],
          ["Wrong type", <><C key="a">&quot;29&quot;</C> for a number, <C key="b">29</C> for a string, <C key="c">true</C> for a string, an object where a list is expected</>],
          ["Boundaries", "The exact minimum and maximum, one either side, zero, negative numbers, a decimal where an integer is expected"],
          ["Length", "Empty, one character, the maximum length, one over, and something very long (10,000 characters)"],
          ["Format", "Emails, dates, phone numbers, URLs and codes that are almost right"],
          ["Whitespace and case", <>Leading spaces, a title of only spaces, <C key="d">Admin</C> when <C key="e">admin</C> is taken</>],
          ["Unknown fields", "A misspelled field name, an extra field, a field the client shouldn't be able to set"],
          ["The body itself", "No body, malformed JSON, an array instead of an object, the wrong Content-Type"],
        ]}
      />

      <H3>Boundaries on the register endpoint</H3>
      <P>
        The age rule is 18 to 120, so the interesting values are 17, 18, 120
        and 121. On this API, 18 and 120 are accepted, and 17 and 121 get
        &quot;Age must be between 18 and 120.&quot; A value of <C>18.5</C>{" "}
        gets a different message, &quot;Age must be an integer.&quot;, and so
        does the string <C>&quot;29&quot;</C>. Some APIs quietly convert{" "}
        <C>&quot;29&quot;</C> to <C>29</C>. Neither behaviour is wrong in
        itself, but clients will come to depend on whichever one ships.
      </P>
      <P>
        The username is 3 to 20 characters: <C>abc</C> and a 20-letter name
        pass, a 21-letter name fails. A username with a space is rejected
        with a message about allowed characters. The taken name{" "}
        <C>admin</C> is refused, and so is <C>Admin</C>, which tells you the
        uniqueness check ignores case. If it didn&apos;t, two users could
        end up with names that look the same in most places.
      </P>
      <P>
        The email check is the usual mess. <C>ava@example</C>,{" "}
        <C>ava@@example.com</C> and <C>ava.example.com</C> are rejected, and
        so is <C>&quot; ava@example.com&quot;</C> with a leading space.{" "}
        <C>ava+qa@example.com</C> and <C>AVA@EXAMPLE.COM</C> are accepted,
        which is right. <C>a@b.c</C> is also accepted. Real email validation
        is a long argument that nobody wins, so the test is less about the
        perfect rule and more about the cases your product cares about: plus
        addressing, upper case, and whether surrounding spaces are trimmed
        or refused.
      </P>

      <H3>Empty is not the same as missing</H3>
      <P>
        Send <C>{"{}"}</C> and every required field is reported as
        &quot;is required&quot;. Send the same fields with <C>null</C> values
        and you get the same result. That is consistent, which is good. On{" "}
        <C>/api/Books</C>, a title of three spaces is also treated as
        missing. Many APIs check only that a string exists, so a title of
        spaces, or an empty string, sails through and later shows up as a
        blank row in someone&apos;s table.
      </P>
      <P>
        Length limits are often missing entirely. <C>/api/Books</C> accepted a
        5,000-character title with a 201. There is no documented limit, so
        that may be intended, but it is the sort of thing a database column
        or a UI layout will disagree with later. Ask what the limit should
        be, and test one character on each side of it.
      </P>

      <H2 id="unknown-fields">Unknown fields</H2>
      <P>
        When a client sends a field the server doesn&apos;t know, the server
        can ignore it or reject it. In the{" "}
        <A href="/learn/crud-testing">CRUD lesson</A>, <C>/api/Books</C>{" "}
        ignored a misspelled <C>year</C> field and stored a year of 0.{" "}
        <C>/api/validation/strict</C> rejects instead:
      </P>
      <Code code={strictUnknown} lang="curl" />
      <P>
        Field names here are case-sensitive, so <C>Name</C> instead of{" "}
        <C>name</C> is also an unknown field. Rejecting is safer, since
        typos surface immediately. Ignoring is friendlier when an API
        evolves and old clients send fields that were removed. Your job is
        to find out which approach the API uses and whether it is used
        consistently across endpoints.
      </P>
      <P>
        There is one kind of unknown field that is a security concern rather
        than a style choice: a field that exists on the record but that the
        client is not supposed to set, like <C>role</C>, <C>isAdmin</C>,{" "}
        <C>price</C> on an order, or <C>id</C>. If the server copies every
        incoming field onto the record, a user can promote themselves. The{" "}
        <A href="/learn/security-testing">security lesson</A> calls this mass
        assignment.
      </P>

      <H2 id="broken-bodies">Broken bodies</H2>
      <P>
        Next, test the request as a whole. These are real responses from
        the register endpoint:
      </P>
      <Code code={bodyProblems} lang="text" label="Responses" />
      <P>
        All four are handled, and 415 for the wrong Content-Type is exactly
        right. But look at the shapes. Three responses are problem+json with
        an <C>errors</C> map. The array case returns a different format
        altogether, <C>{`{status, error, message}`}</C> with a plain JSON
        content type. A client that parses errors one way will break on the
        other. This happens when some errors come from the framework and
        others from the application code, and it is one of the most common
        findings in API testing. Collect the error shapes you see across an
        API and put them side by side.
      </P>

      <H2 id="leaks">What an error should not contain</H2>
      <P>
        Here is <C>/api/Books</C> receiving a string where it expects a number:
      </P>
      <Code code={leakyError} lang="curl" />
      <P>
        The status is right. The content has two problems. The message
        mentions <C>System.Int32</C>, which tells an outsider that the
        server runs .NET and leaves the client with a type name instead of
        &quot;pages must be a whole number&quot;. And the extra error{" "}
        <C>&quot;The item field is required.&quot;</C> refers to an internal
        parameter name, not anything the client sent. Neither is dangerous
        here, but on a real product you would report both.
      </P>
      <P>
        The things that must never appear in an error are stack traces, SQL
        fragments, file paths, internal host names, and the values of
        secrets. A <C>traceId</C>, on the other hand, is useful: it lets
        support find the matching server log without exposing anything.
      </P>

      <H2 id="status-codes">Which status code</H2>
      <P>
        Teams argue about 400 versus 422. A common split is 400 for a body
        the server couldn&apos;t read (malformed JSON, wrong types) and 422
        for a readable body that breaks a rule (age 17).{" "}
        <C>/api/validation/register</C> returns 400 only when it can&apos;t
        parse the body at all, and 422 for everything else, including a
        string where the age should be. <C>/api/validation/annotations</C>{" "}
        uses 400 for all of it. Either approach is acceptable if it is
        consistent and documented, and two endpoints on the same API doing
        it differently is worth a question.
      </P>
      <Table
        head={["Status", "Meaning for bad input"]}
        rows={[
          ["400 Bad Request", "The request is malformed or invalid. The client must change it."],
          ["415 Unsupported Media Type", "The Content-Type isn't one the endpoint accepts."],
          ["422 Unprocessable Content", "The body parsed, but the values break a rule."],
          ["409 Conflict", "Valid on its own, but clashes with current state, such as a duplicate. (The register endpoint uses 422 for a taken username.)"],
          ["500 Internal Server Error", "Never correct for bad input. The server crashed on something it should have rejected."],
        ]}
      />
      <P>
        The last row is the one rule without exceptions. If any input you
        send produces a 500, you have found a bug, however strange the input
        was. The server was supposed to reject it and instead fell over.
        You can see what a well-formed 500 looks like at{" "}
        <C>/api/validation/problem/internal</C>, and the other sample problem
        documents are listed here:
      </P>
      <Run path="/api/validation/problem" />
      <Note>
        <P>
          Finally, after every rejected request, check that nothing changed.
          A request that returns 400 but still saved half of the record is
          worse than one that returns 201 with bad data, because nobody will
          look for it.
        </P>
      </Note>

      <Exercise>
        <P>
          Test <C>POST /api/validation/annotations</C>. Its valid example is
          on the <A href="/docs/validation">reference page</A>. It uses the
          framework&apos;s built-in validation instead of hand-written rules.
        </P>
        <Ul>
          <li>Find the boundaries for <C>username</C>, <C>age</C> and <C>tags</C>.</li>
          <li>Try three invalid and two valid phone numbers and websites.</li>
          <li>Send an invalid body to both <C>/annotations</C> and <C>/register</C> and compare the error responses. What status does each use? How are the field names in <C>errors</C> spelled compared with the field names you sent?</li>
          <li>Send a string where <C>age</C> expects a number. Does the message leak anything?</li>
        </Ul>
        <P>
          Write up any differences between the two endpoints as if you were
          filing them for a developer: what you sent, what came back, and
          what you expected.
        </P>
      </Exercise>
    </>
  );
}
