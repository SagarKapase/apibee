import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const createCurl = `curl -i -X POST https://api.testingapis.com/api/Books \\
  -H "Content-Type: application/json" \\
  -d '{"title":"The Pragmatic Programmer","author":"David Thomas",
       "isbn":"9780135957059","genre":"programming","publishedYear":2019,
       "pages":352,"language":"English","price":42.5,"rating":4.6,
       "available":true,"tags":["career"]}'`;

const createResponse = `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "message": "Book created successfully",
  "data": {
    "id": 29,
    "title": "The Pragmatic Programmer",
    "author": "David Thomas",
    "isbn": "9780135957059",
    "genre": "programming",
    "publishedYear": 2019,
    "pages": 352,
    "language": "English",
    "price": 42.5,
    "rating": 4.6,
    "available": true,
    "tags": ["career"]
  }
}`;

const patchCurl = `curl -X PATCH https://api.testingapis.com/api/Books/29 \\
  -H "Content-Type: application/json" \\
  -d '{"price":39.99}'`;

const patchResponse = `{
  "message": "Book patched successfully",
  "changed": ["price"],
  "ignored": [],
  "data": {
    "id": 29,
    "title": "The Pragmatic Programmer",
    "author": "David Thomas",
    "isbn": "9780135957059",
    "genre": "programming",
    "publishedYear": 2019,
    "pages": 352,
    "language": "English",
    "price": 39.99,
    "rating": 4.6,
    "available": true,
    "tags": ["career"]
  }
}`;

const putCurl = `curl -X PUT https://api.testingapis.com/api/Books/29 \\
  -H "Content-Type: application/json" \\
  -d '{"title":"The Pragmatic Programmer","author":"David Thomas","price":39.99}'`;

const putResponse = `{
  "message": "Book updated successfully",
  "data": {
    "id": 29,
    "title": "The Pragmatic Programmer",
    "author": "David Thomas",
    "isbn": "",
    "genre": "",
    "publishedYear": 0,
    "pages": 0,
    "language": "",
    "price": 39.99,
    "rating": 0,
    "available": false,
    "tags": []
  }
}`;

const deleteResponses = `$ curl -X DELETE https://api.testingapis.com/api/Books/29
{"message":"Book deleted successfully"}          (200 OK)

$ curl -X DELETE https://api.testingapis.com/api/Books/29
{"status":404,"error":"Not Found","message":"Book with ID 29 does not exist."}   (404 Not Found)`;

const methodNotAllowed = `HTTP/1.1 405 Method Not Allowed
Content-Length: 0
allow: GET`;

const booksNotAllowed = `HTTP/1.1 405 Method Not Allowed
Content-Length: 0
allow: DELETE, GET, HEAD, PATCH, PUT`;

const headResponse = `HTTP/1.1 200 OK
x-message: HEAD request received. Responses to HEAD carry headers only.
x-method: HEAD`;

const patchIgnored = `{
  "message": "Book patched successfully",
  "changed": [],
  "ignored": ["colour"],
  "data": { "id": 1, "title": "Clean Code", ... }
}`;

export default function HttpMethods() {
  return (
    <>
      <P>
        The method is the first word of every request. It tells the server
        what you want to do with the resource at the URL. The same URL,{" "}
        <C>/api/Books/1</C>, returns a book with GET, changes it with PUT or
        PATCH, and removes it with DELETE. Most APIs use five methods for
        almost everything, and a few more show up now and then.
      </P>
      <P>
        Methods are where the difference between a browser and a testing tool
        starts to matter. The address bar only sends GET. For the rest you
        need curl, Postman, or a Send button like the ones on this page. The
        examples that change shared data use curl, so the Send buttons on
        this page don&apos;t modify records other readers are looking at.
        Lesson 6, <A href="/learn/first-requests">Sending requests with curl
        and Postman</A>, sets up both tools properly. If you
        don&apos;t have curl yet, read the curl examples here and run them
        after that lesson.
      </P>

      <H2 id="the-five">The five everyday methods</H2>
      <Table
        head={["Method", "Does", "Typical success status"]}
        rows={[
          [<C key="g">GET</C>, "Read a resource or a list. Sends no body.", "200"],
          [<C key="p">POST</C>, "Create a new resource, or trigger an action.", "201, sometimes 200 or 202"],
          [<C key="u">PUT</C>, "Replace a resource with the body you send.", "200 or 204"],
          [<C key="a">PATCH</C>, "Change some fields of a resource.", "200 or 204"],
          [<C key="d">DELETE</C>, "Remove a resource.", "200 or 204"],
        ]}
      />
      <P>
        The <A href="/docs/methods">Methods</A> endpoints on this API each
        accept one verb and describe what they received. Send a GET:
      </P>
      <Run path="/api/methods/get?x=1" />
      <P>And a POST with a body:</P>
      <Run method="POST" path="/api/methods/post" body={`{"hello":"world"}`} />
      <P>
        These endpoints don&apos;t store anything. To see what methods do to
        real data, you need a resource, and the rest of this lesson uses{" "}
        <A href="/docs/books">Books</A>.
      </P>

      <H2 id="post">POST creates</H2>
      <P>Create a book:</P>
      <Code code={createCurl} lang="curl" />
      <Code code={createResponse} lang="text" label="Response" />
      <P>
        The server answered 201 Created, assigned the ID 29 and returned the
        new record. You will get a different ID, because other people create
        books too. That is the first thing to test about any POST: the server
        picks the ID, and your test must read it from the response rather than
        guess it.
      </P>
      <P>
        Many APIs also send a <C>Location</C> header on a 201 with the URL of
        the new resource, such as <C>Location: /api/Books/29</C>. This one
        doesn&apos;t. That isn&apos;t required by the standard, but if the
        docs promised it, it would be a bug.
      </P>
      <P>
        Now run the same POST a second time. You get a second book with a
        new ID, identical except for that number. POST is not safe to repeat:
        every call makes something new. Keep that in mind for the table
        further down.
      </P>

      <H2 id="put-vs-patch">PUT replaces, PATCH changes</H2>
      <P>
        Both methods update a record, and people mix them up constantly. The
        difference shows up in the fields you leave out.
      </P>
      <H3>PATCH</H3>
      <P>Change only the price of book 29:</P>
      <Code code={patchCurl} lang="curl" />
      <Code code={patchResponse} lang="json" label="Response" />
      <P>
        Only the price changed. Everything you didn&apos;t mention kept its
        value. This API also tells you which fields it changed, which is
        unusual and handy for testing.
      </P>
      <H3>PUT</H3>
      <P>Now send a PUT with only three fields:</P>
      <Code code={putCurl} lang="curl" />
      <Code code={putResponse} lang="json" label="Response" />
      <P>
        The ISBN, genre, year, page count, language, rating and tags are gone.
        PUT means &quot;here is the complete new version of this
        resource&quot;. Any field you didn&apos;t send was replaced with an
        empty or zero value. The API did exactly what PUT is defined to do,
        and it still wiped out most of a record because the client sent a
        partial body.
      </P>
      <P>
        This is one of the most common real bugs in apps. A developer uses
        PUT to update one field, sends only that field, and every other field
        on the record is quietly erased. When you test an update feature, send
        a partial body and then GET the record to see what survived.
      </P>
      <P>
        Some APIs handle this differently. They treat a PUT with missing
        fields like a PATCH, or reject it with a 400 because required fields
        are missing. The last option is arguably the safest. What you test
        for depends on the docs, but you always test it.
      </P>

      <H2 id="delete">DELETE removes</H2>
      <P>Delete book 29, then try to delete it again:</P>
      <Code code={deleteResponses} lang="text" label="Terminal" />
      <P>
        The first call returns 200 with a message. The second returns 404,
        because there is nothing left to delete. After a delete, also check
        that a GET for the same ID returns 404. Some systems only mark records
        as deleted and keep returning them, which is a bug if the docs say
        otherwise.
      </P>

      <H2 id="safe-and-idempotent">Safe and idempotent methods</H2>
      <P>Two properties from the HTTP standard decide how clients and tests are allowed to treat each method.</P>
      <P>
        A <em>safe</em> method doesn&apos;t change anything on the server. You
        can call it as often as you like. An <em>idempotent</em> method can
        change things, but calling it twice has the same effect on the server
        as calling it once.
      </P>
      <Table
        head={["Method", "Safe", "Idempotent"]}
        rows={[
          [<C key="g">GET</C>, "Yes", "Yes"],
          [<C key="h">HEAD</C>, "Yes", "Yes"],
          [<C key="o">OPTIONS</C>, "Yes", "Yes"],
          [<C key="u">PUT</C>, "No", "Yes"],
          [<C key="d">DELETE</C>, "No", "Yes"],
          [<C key="p">POST</C>, "No", "No"],
          [<C key="a">PATCH</C>, "No", "Not guaranteed"],
        ]}
      />
      <P>
        PUT is idempotent because sending the same full record twice leaves
        the same record. DELETE is idempotent even though the second call got
        a 404: the response was different, but the state of the server (book
        29 doesn&apos;t exist) is the same either way. Idempotency is about
        the effect, not the response. POST isn&apos;t idempotent, as you saw
        when the second POST created a second book. PATCH can go either way.
        Setting the price to 39.99 is idempotent; a patch that says
        &quot;add 1 to the stock count&quot; is not.
      </P>
      <P>
        This matters because networks fail. If a request times out, the
        client doesn&apos;t know whether the server received it. Retrying a
        GET or a PUT is harmless. Retrying a POST can charge a card twice.
        Browsers, proxies and HTTP libraries use these rules when they decide
        whether to retry on their own, and{" "}
        <A href="/learn/reliability">Timeouts, retries and rate limits</A>{" "}
        shows how APIs make POST safe to retry with idempotency keys.
      </P>
      <P>
        As a tester, the rules give you test cases for free. Call a GET and
        check that nothing changed. Call a PUT twice and check that the
        second call didn&apos;t create or duplicate anything. A GET that
        changes data (like <C>/api/deleteUser?id=5</C>, which does exist in
        some codebases) is a design bug, because crawlers, link previews and
        browser prefetching all send GET requests without asking.
      </P>

      <H2 id="head-options">HEAD and OPTIONS</H2>
      <P>
        HEAD is a GET without the body. The server sends the same status and
        headers it would for a GET and stops there. Clients use it to check
        whether something exists or how big a file is without downloading it.
      </P>
      <Code code={headResponse} lang="text" label="curl -I https://api.testingapis.com/api/methods/head" />
      <P>
        OPTIONS asks what is allowed at a URL. Browsers send it automatically
        before some cross-origin requests (a &quot;preflight&quot;), which is
        why it shows up in network logs even when no code calls it. You will
        rarely test it directly unless you work on CORS settings.
      </P>
      <Run method="OPTIONS" path="/api/methods/options" />

      <H2 id="wrong-method">Using the wrong method</H2>
      <P>
        <C>/api/methods/get</C> only accepts GET. Send it a POST with{" "}
        <C>curl -i -X POST https://api.testingapis.com/api/methods/get</C>:
      </P>
      <Code code={methodNotAllowed} lang="text" label="Response" />
      <P>
        405 Method Not Allowed means the URL exists but doesn&apos;t support
        that method. The <C>allow</C> header lists the ones it does. A POST to
        a single book, which makes no sense because you create books at{" "}
        <C>/api/Books</C>, gets the same treatment:
      </P>
      <Code code={booksNotAllowed} lang="text" label="curl -i -X POST https://api.testingapis.com/api/Books/1" />
      <P>
        Sending every method to every endpoint is a cheap test that finds real
        problems. You are looking for methods that should be rejected but
        aren&apos;t (a DELETE that works on an endpoint that was supposed to
        be read-only), and for 500s or 404s where a 405 belongs. Note that
        this API returns the 405 with an empty body, while its other errors
        are JSON. Clients that expect a JSON error body on every 4xx will
        stumble on it.
      </P>

      <Note title="Unknown fields in a PATCH">
        <P>
          Send <C>{`{"colour":"red"}`}</C> as a PATCH to <C>/api/Books/1</C>{" "}
          and nothing changes, because books have no <C>colour</C> field. This
          API tells you so:
        </P>
        <Code code={patchIgnored} lang="text" label="Trimmed response" />
        <P>
          Most APIs ignore unknown fields without saying anything, and a few
          reject them with a 400. Silent ignoring hides typos: a client that
          sends <C>prce</C> instead of <C>price</C> gets a success response
          and no change.
        </P>
      </Note>

      <Exercise>
        <P>Work through this with curl (or come back to it after the curl lesson).</P>
        <Ul>
          <li>Create a book with POST. Write down its ID.</li>
          <li>PATCH its title. GET it and confirm only the title changed.</li>
          <li>
            PUT it with a body that has every field except <C>tags</C>. What
            happened to the tags?
          </li>
          <li>
            Send the same PUT again. Did anything change the second time?
          </li>
          <li>
            DELETE it, GET it, and DELETE it again. Write down all three
            status codes.
          </li>
          <li>
            Send a DELETE to <C>/api/Books</C> (no ID). Before you run it,
            predict the status code. Then check the <C>allow</C> header.
          </li>
        </Ul>
      </Exercise>
    </>
  );
}
