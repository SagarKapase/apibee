import { A, C, Code, Exercise, H2, H3, Note, Ol, P, Run, Table, Ul } from "@/components/lesson";

const createRequest = `curl -i -X POST https://api.testingapis.com/api/Books \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Testing Web APIs",
    "author": "Mark Winteringham",
    "isbn": "9781617299537",
    "genre": "testing",
    "publishedYear": 2022,
    "pages": 264,
    "language": "English",
    "price": 49.99,
    "rating": 4.6,
    "available": true,
    "tags": ["api", "testing"]
  }'`;

const createResponse = `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "message": "Book created successfully",
  "data": {
    "id": 26,
    "title": "Testing Web APIs",
    "author": "Mark Winteringham",
    "isbn": "9781617299537",
    "genre": "testing",
    "publishedYear": 2022,
    "pages": 264,
    "language": "English",
    "price": 49.99,
    "rating": 4.6,
    "available": true,
    "tags": ["api", "testing"]
  }
}`;

const typoCreate = `curl -X POST https://api.testingapis.com/api/Books \\
  -H "Content-Type: application/json" \\
  -d '{"title": "The Test Book", "author": "Ada Tester", "year": 2026}'`;

const typoResponse = `{
  "message": "Book created successfully",
  "data": {
    "id": 26,
    "title": "The Test Book",
    "author": "Ada Tester",
    "isbn": "",
    "genre": "",
    "publishedYear": 0,
    "pages": 0,
    "language": "",
    "price": 0,
    "rating": 0,
    "available": false,
    "tags": []
  }
}`;

const putRequest = `curl -X PUT https://api.testingapis.com/api/Books/27 \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Lessons Learned in Software Testing", "author": "Cem Kaner", "price": 39.0}'`;

const putResponse = `{
  "message": "Book updated successfully",
  "data": {
    "id": 27,
    "title": "Lessons Learned in Software Testing",
    "author": "Cem Kaner",
    "isbn": "",
    "genre": "",
    "publishedYear": 0,
    "pages": 0,
    "language": "",
    "price": 39.0,
    "rating": 0,
    "available": false,
    "tags": []
  }
}`;

const patchRequest = `curl -X PATCH https://api.testingapis.com/api/Books/26 \\
  -H "Content-Type: application/merge-patch+json" \\
  -d '{"price": 35, "available": false, "colour": "blue", "id": 999}'`;

const patchResponse = `{
  "message": "Book patched successfully",
  "changed": ["price", "available"],
  "ignored": ["colour", "id"],
  "data": {
    "id": 26,
    "title": "Testing Web APIs",
    "author": "Mark Winteringham",
    "isbn": "9781617299537",
    "genre": "testing",
    "publishedYear": 2022,
    "pages": 264,
    "language": "English",
    "price": 35,
    "rating": 4.6,
    "available": false,
    "tags": ["api", "testing"]
  }
}`;

const deleteTwice = `$ curl -i -X DELETE https://api.testingapis.com/api/Books/26
HTTP/1.1 200 OK

{"message":"Book deleted successfully"}

$ curl -i https://api.testingapis.com/api/Books/26
HTTP/1.1 404 Not Found

{"status":404,"error":"Not Found","message":"Book with ID 26 does not exist."}

$ curl -i -X DELETE https://api.testingapis.com/api/Books/26
HTTP/1.1 404 Not Found

{"status":404,"error":"Not Found","message":"Book with ID 26 does not exist."}`;

const bulkCreate = `curl -X POST https://api.testingapis.com/api/Books/bulk \\
  -H "Content-Type: application/json" \\
  -d '[
    {"title": "Bulk A", "author": "Tester"},
    {"title": "Bulk B", "author": "Tester"},
    {"title": "", "author": "Tester"}
  ]'

{"status":400,"error":"Bad Request","message":"Item [2]: Missing required field: title"}`;

const bulkDelete = `curl -X DELETE "https://api.testingapis.com/api/Books/bulk?ids=27,28,5000"

{"message":"2 book record(s) deleted","deleted":[27,28],"notFound":[5000]}`;

export default function CrudTesting() {
  return (
    <>
      <P>
        Most APIs are built around resources: books, orders, users, invoices.
        For each resource there is usually a way to create one, read it,
        change it and delete it. Testers call this CRUD (create, read,
        update, delete), and a CRUD test follows one record through its whole
        life. It is the first thing you should test on any new resource,
        because almost every other feature depends on it working.
      </P>
      <P>
        This lesson uses <C>/api/Books</C>. It supports every operation, and
        its <A href="/docs/books">reference page</A> lists the fields. You
        already know the methods from <A href="/learn/http-methods">HTTP methods</A>.
        Here the question is different: how do you prove that each operation
        did what it claimed?
      </P>

      <H2 id="the-rule">A response is a claim, not proof</H2>
      <P>
        When a server answers a POST with 201 and a copy of the record, it is
        telling you what it thinks it stored. That copy is usually built from
        the same object that was about to be saved, so it can look perfect
        even when the save failed, or when a field was dropped on the way to
        the database. The only way to know what was stored is to ask for it
        again in a separate request.
      </P>
      <P>
        So a CRUD test alternates between doing something and checking it
        with a fresh read:
      </P>
      <Ol>
        <li>Create a record. Check the response.</li>
        <li>Read it back by ID. Compare every field with what you sent.</li>
        <li>Find it in the list endpoint.</li>
        <li>Replace it with PUT. Read it back.</li>
        <li>Change one field with PATCH. Read it back.</li>
        <li>Delete it. Read it back and expect a 404.</li>
        <li>Delete it again and see what happens.</li>
      </Ol>

      <H2 id="create">Create</H2>
      <Code code={createRequest} lang="curl" />
      <Code code={createResponse} lang="text" label="Response" />
      <P>Things to check on this response, in rough order of importance:</P>
      <Ul>
        <li>
          The status is 201, not 200. Both mean success, but 201 says a new
          resource exists, and clients sometimes branch on it.
        </li>
        <li>
          There is an <C>id</C>, and it is a number (or whatever type the
          docs promise). Save it. Every later step needs it.
        </li>
        <li>
          Every field you sent comes back with the same value. Compare
          them one by one, including the ones that seem boring. A price of{" "}
          <C>49.99</C> that comes back as <C>49.9899999</C> or <C>&quot;49.99&quot;</C>{" "}
          is a bug.
        </li>
        <li>
          Whether a <C>Location</C> header points to the new record. Many
          REST APIs send one with a 201. This API doesn&apos;t. That is a
          design choice rather than a defect, but you should know which way
          your API goes and write it into your tests.
        </li>
      </Ul>
      <P>
        Now look at what happens with a small mistake in the body. The field
        is called <C>publishedYear</C>, and here it is sent as <C>year</C>:
      </P>
      <Code code={typoCreate} lang="curl" />
      <Code code={typoResponse} lang="json" label="Response (201 Created)" />
      <P>
        The server accepted the request, ignored <C>year</C> without a word,
        and stored <C>0</C> as the year. Nothing in the status code tells you
        anything went wrong. You only catch this by comparing the stored
        record with what you meant to send. Silently ignored fields are one
        of the most common sources of &quot;the data is wrong but nobody
        knows why&quot; bugs. Some APIs reject unknown fields instead; the{" "}
        <A href="/learn/validation-errors">next lesson</A> covers that.
      </P>

      <H3>Fields the server fills in</H3>
      <P>
        Some fields don&apos;t come from you: the ID, and on many resources
        timestamps like <C>createdAt</C> or <C>updatedAt</C>. You can&apos;t
        compare them with a fixed value, because they change on every run.
        Test their properties instead:
      </P>
      <Ul>
        <li>The ID is present, has the right type, and differs from IDs you created earlier.</li>
        <li>
          A <C>createdAt</C> is a valid date in the documented format and
          falls within a few seconds of when you sent the request. Allow for
          clock differences between your machine and the server.
        </li>
        <li>
          An <C>updatedAt</C> changes after an update and <C>createdAt</C>{" "}
          does not.
        </li>
        <li>
          Sending your own <C>id</C> in the body doesn&apos;t let you choose
          it. The Books docs say an ID in the body is ignored. Try it with{" "}
          <C>&quot;id&quot;: 1</C> and check that book 1 is untouched
          afterwards.
        </li>
      </Ul>

      <H2 id="read">Read it back</H2>
      <P>
        Fetch the record by the ID you were given, and compare the full body
        with what you sent. Then check the list. On this API you can search
        by title:
      </P>
      <Run path="/api/Books?q=web%20apis" showHeaders={["X-Total-Count"]} />
      <P>
        If your book isn&apos;t in the results, the create response lied or
        the list reads from a different place than the single-record
        endpoint (a cache, a search index, a read replica). All of those
        happen in real systems. Checking the list also catches a quieter
        problem: the record is saved but filtered out of lists, for example
        because a default filter hides records with an empty field.
      </P>
      <Note>
        <P>
          <C>q</C> on this API searches text fields like the title, not
          every field. Searching for the author&apos;s name with <C>q</C>{" "}
          finds nothing, but <C>?author=mark%20winteringham</C> works as an
          exact filter. Knowing what a search actually searches is part of
          the job. The <A href="/learn/query-parameters">lesson on query
          parameters</A> goes further.
        </P>
      </Note>

      <H2 id="update">Update with PUT and PATCH</H2>
      <P>
        PUT replaces the whole record. Anything you leave out is reset,
        usually to an empty or default value. People forget this all the
        time, on both the client and the server side, so test it on purpose.
        Here a book is updated with only three fields:
      </P>
      <Code code={putRequest} lang="curl" />
      <Code code={putResponse} lang="json" label="Response (200 OK)" />
      <P>
        The ISBN, page count, year and tags are gone. That is correct PUT
        behaviour. If the server had kept the old values, it would be acting
        like PATCH, and a client relying on PUT to clear a field would never
        manage to. The same request also sent <C>&quot;id&quot;: 1</C> in
        the body; the record kept ID 27, and a separate GET confirmed that
        book 1 had not changed.
      </P>
      <P>
        A PUT that is missing a required field fails with a 400, as it
        should: <C>{`{"price": 35}`}</C> alone returns{" "}
        <C>Missing required field: title</C>.
      </P>
      <P>
        PATCH changes only the fields you send. This API uses JSON merge
        patch, and its response lists what it changed and what it ignored:
      </P>
      <Code code={patchRequest} lang="curl" />
      <Code code={patchResponse} lang="json" label="Response (200 OK)" />
      <P>
        Check that the two named fields changed, that every other field kept
        its old value, and that the ignored <C>id</C> really was ignored.
        Then do a fresh GET and check all of it again. A PATCH that updates
        the response but not the stored record is rare, but when it happens
        it is exactly the kind of bug that reaches production, because the
        client shows the new value until the page is reloaded.
      </P>

      <H2 id="delete">Delete, then delete again</H2>
      <Code code={deleteTwice} lang="text" label="Terminal" />
      <P>
        After a delete, a GET must return 404. Also check that the record is
        gone from the list, and that the count went down (
        <C>/api/Books/count</C> returns <C>{`{"count": 25}`}</C> on the
        seed data).
      </P>
      <P>
        The second DELETE is where APIs differ. This one returns 404. Others
        return 204 or 200 on every delete, on the grounds that the end state
        (no such record) is the same. Both are defensible. What you are
        looking for is a 500, or a 200 that claims it deleted something that
        wasn&apos;t there. Also send PUT and PATCH to the deleted ID. Here
        PATCH gets a 404, but a PUT with an incomplete body gets a 400 for
        the missing field before the server notices the record doesn&apos;t
        exist. Which error wins when two apply is worth a sentence in the
        docs, and often has none.
      </P>

      <H2 id="independence">Create your own data</H2>
      <P>
        It is tempting to test against record 1 because it is always there.
        Don&apos;t. Anyone can change or delete book 1 on a shared server,
        and a test that edits it breaks every other test that reads it.
        Each test should create the records it needs, work only with the IDs
        it was given, and delete them at the end.
      </P>
      <P>
        This API is a good place to see why. It keeps its data in memory and
        is shared by everyone who uses it. While this lesson was being
        written, another user created a book with ID 26 in the few seconds
        between one of our deletes and the next create. A test that assumed
        &quot;the next book will be 26&quot; would have failed for reasons
        that had nothing to do with the code under test.
      </P>
      <P>
        The same experiment showed something else. After book 26 was
        deleted, the next book created got ID 26 again. This server hands
        out the next free number, so IDs are reused. If another system
        stored &quot;book 26&quot; before the delete, it now points to a
        different book. Whether that is a bug depends on the product, but
        it is the kind of finding worth raising. Most databases never reuse
        IDs for this reason.
      </P>

      <H2 id="bulk">Bulk endpoints</H2>
      <P>
        Many APIs let you create or delete several records in one request.
        The interesting question is what happens when some items are bad.
      </P>
      <Code code={bulkCreate} lang="curl" />
      <P>
        The third item has an empty title, so the whole request fails and
        the error names the item by index. The Books docs say nothing is
        stored in that case, and you should verify that: check that
        &quot;Bulk A&quot; does not exist after the failed request. An API
        that saves the first two items and then fails leaves the client with
        no idea what to retry.
      </P>
      <P>Bulk delete reports which IDs it found and which it didn&apos;t:</P>
      <Code code={bulkDelete} lang="curl" />
      <Table
        head={["Bulk case", "What to check"]}
        rows={[
          ["All items valid", "Every item is stored, IDs are distinct, the count goes up by the number sent."],
          ["One invalid item", "Nothing is stored, or the response says exactly which items were stored."],
          ["Empty array", "A clear 400, not a 201 that created nothing."],
          ["More than the limit (100 here)", "A 400 that states the limit."],
          ["Duplicate IDs in a bulk delete", "Each record deleted once, no error from the second occurrence."],
        ]}
      />

      <Exercise>
        <P>
          Run the full lifecycle on <C>/api/Movies</C>, using its{" "}
          <A href="/docs/movies">reference page</A> for the fields. Create a
          movie with every field filled in, then:
        </P>
        <Ol>
          <li>Read it back and compare every field with what you sent.</li>
          <li>Find it with <C>?q=</C> and a word from its title.</li>
          <li>PUT it with only the required fields. Which fields were reset?</li>
          <li>PATCH one field and send one field name that doesn&apos;t exist. Read the <C>ignored</C> list.</li>
          <li>Delete it, then GET, PATCH and DELETE it again. Write down each status.</li>
        </Ol>
        <P>
          Finish by writing down one thing you would ask the developers about
          (an ignored field, a reused ID, an error that won over another).
          Deciding what to report is as much a part of the test as the
          requests.
        </P>
      </Exercise>
    </>
  );
}
