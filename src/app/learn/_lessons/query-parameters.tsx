import { A, C, Code, Exercise, H2, H3, Note, Ol, P, Run, Table, Ul } from "@/components/lesson";

const pageHeaders = `$ curl -i "https://api.testingapis.com/api/Products?limit=3&page=7"
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
x-page: 7
x-per-page: 3
x-total-count: 20
x-total-pages: 7

[{"id":19,"title":"Non-Slip Yoga Mat",...},{"id":20,"title":"Resistance Bands Set",...}]`;

const clamping = `?limit=3&page=8    200, x-page: 8, body []
?limit=3&page=0    200, x-page: 1, same as page 1
?limit=0           200, x-per-page: 1
?limit=-1          200, x-per-page: 1
?limit=101         200, x-per-page: 100
?limit=abc         200, x-per-page: 20 (limit ignored, all 20 returned)`;

const sortTies = `?sort=category
10:books 11:books 12:books 13:books 6:clothing 7:clothing 8:clothing 9:clothing
1:electronics 2:electronics 3:electronics 4:electronics 5:electronics 14:home ...

?sort=category&order=desc
18:sports 19:sports 20:sports 14:home 15:home 16:home 17:home 1:electronics ...`;

const silentIgnores = `?sort=colour&limit=5            200, ids 1,2,3,4,5 (unsorted)
?sort=price&order=sideways      200, sorted ascending
?categry=books                  200, all 20 products
?rating.rate=4.3                200, all 20 products`;

const searchCases = `?q=YOGA              19
?q=yoga+mat          19
?q=yoga%20mat        19
?q=100%25            6   (description contains "100% organic cotton")
?q=%27               11,13   (titles and descriptions with an apostrophe)
?q=                  all 20
?q=a&q=b             []
?category=books&category=home    []`;

const cursorPage = `{
  "object": "list",
  "url": "/api/pagination/cursor",
  "data": [
    { "id": 1, "name": "Smart Headset", "category": "electronics", "price": 42.01, "createdAt": "2026-01-01T21:00:00Z" },
    { "id": 2, "name": "Compact Speaker", "category": "outdoors", "price": 79.02, "createdAt": "2026-01-02T10:00:00Z" },
    { "id": 3, "name": "Deluxe Blender", "category": "office", "price": 116.03, "createdAt": "2026-01-02T23:00:00Z" }
  ],
  "has_more": true,
  "next_cursor": "eyJsYXN0SWQiOjN9"
}`;

const linkHeader = `$ curl -i "https://api.testingapis.com/api/pagination/link?page=2&per_page=3"
HTTP/1.1 200 OK
link: <http://api.testingapis.com/api/pagination/link?page=3&per_page=3>; rel="next",
      <http://api.testingapis.com/api/pagination/link?page=34&per_page=3>; rel="last",
      <http://api.testingapis.com/api/pagination/link?page=1&per_page=3>; rel="first",
      <http://api.testingapis.com/api/pagination/link?page=1&per_page=3>; rel="prev"
x-total-count: 100`;

const keysetPage = `{
  "data": [
    { "id": 11, "name": "Smart Lamp", "category": "electronics", "price": 12.11, "createdAt": "2026-01-07T07:00:00Z" },
    { "id": 12, "name": "Compact Headset", "category": "outdoors", "price": 49.12, "createdAt": "2026-01-07T20:00:00Z" },
    { "id": 13, "name": "Deluxe Speaker", "category": "office", "price": 86.13, "createdAt": "2026-01-08T09:00:00Z" }
  ],
  "has_more": true,
  "next_after_id": 13
}`;

const walkPages = `async function allPages(path, limit) {
  const seen = [];
  for (let page = 1; ; page++) {
    const res = await fetch(\`https://api.testingapis.com\${path}?limit=\${limit}&page=\${page}\`);
    const items = await res.json();
    if (items.length === 0) break;
    seen.push(...items.map((item) => item.id));
  }
  return seen;
}

const ids = await allPages("/api/Products", 3);
const total = 20; // from X-Total-Count
console.log(ids.length === total, new Set(ids).size === ids.length);`;

export default function QueryParameters() {
  return (
    <>
      <P>
        A list endpoint looks simple: ask for products, get products. Then
        the list grows past what fits in one response, users want it sorted
        by price, filtered by category and searched by name, and every one
        of those features is a small piece of code with its own edge cases.
        List bugs are sneaky because the response always looks plausible.
        A page with the wrong ten products is still a page with ten
        products.
      </P>
      <P>
        This lesson uses <C>/api/Products</C>, which has 20 products in its
        seed data, and the demo endpoints under{" "}
        <A href="/docs/pagination">/api/pagination</A>. The same parameters
        work on every list in this API, and the{" "}
        <A href="/docs">API reference</A> describes them.
      </P>
      <Table
        head={["Parameter", "What it does here"]}
        rows={[
          [<C key="l">limit</C>, "Page size, 1 to 100. Without it, you get everything."],
          [<C key="p">page</C>, "1-based page number, used with limit."],
          [<C key="o">offset</C>, "Skip this many records, as an alternative to page."],
          [<C key="s">sort, order</C>, "Sort by any field, asc (the default) or desc."],
          [<C key="q">q</C>, "Case-insensitive search in text fields such as title and description."],
          [<C key="f">any field name</C>, "Exact, case-insensitive filter, like ?category=books."],
        ]}
      />

      <H2 id="pagination">Pagination</H2>
      <P>
        Ask for three products per page and look at the headers as well as
        the body:
      </P>
      <Run path="/api/Products?limit=3&page=1" showHeaders={["X-Total-Count", "X-Page", "X-Per-Page", "X-Total-Pages"]} />
      <P>
        Twenty products in pages of three is seven pages, the last one
        holding two. The last page is the first place to look for bugs,
        because it is the one case where the page isn&apos;t full:
      </P>
      <Code code={pageHeaders} lang="text" label="Terminal" />
      <P>
        Correct: seven pages, and the last one has products 19 and 20. A
        classic bug here is computing the page count with integer division
        (20 / 3 = 6), which hides the last two products from anyone clicking
        through the pages.
      </P>

      <H3>Values outside the range</H3>
      <P>
        Next, send values the docs say are invalid, or don&apos;t mention
        at all. This is what the API does with them:
      </P>
      <Code code={clamping} lang="text" label="Results" />
      <P>
        The server never refuses. It clamps a bad value to the nearest valid
        one, or ignores it. That is a legitimate design, and it is friendly
        to clients, but a test should record it, because the alternative
        (a 400 that explains the valid range) is equally common. The
        dangerous cases are the ones where clamping hides a client bug. A
        client that sends <C>limit=abc</C> because of a template mistake
        gets all 20 records here. On a table with two million rows, the
        same behaviour means the server tries to return all of them.
      </P>
      <P>
        A page past the end returns an empty list with a 200. That is what
        most APIs do, and it is what clients expect when they loop until
        they get nothing back. A 404 for an empty page would also be
        defensible. A 500 would not.
      </P>

      <H3>No gaps, no duplicates</H3>
      <P>
        The most important pagination test is also the simplest to
        describe: walk every page, collect the IDs, and check that you got
        each record exactly once. Compare the number you collected with{" "}
        <C>X-Total-Count</C>.
      </P>
      <Code code={walkPages} lang="javascript" />
      <P>
        Run it with several page sizes: 1, 3, 7, and one larger than the
        whole list. Off-by-one errors in offset calculations tend to show up
        only for particular sizes. If the API supports both <C>page</C> and{" "}
        <C>offset</C>, check that <C>limit=5&amp;page=3</C> and{" "}
        <C>limit=5&amp;offset=10</C> return the same records.
      </P>
      <P>
        This test only passes reliably if nobody changes the data while it
        runs. On a shared server like this one, somebody might. That leads
        to the main weakness of page numbers, covered below.
      </P>

      <H2 id="sorting">Sorting</H2>
      <P>
        Sort by price, descending, and check the order of the whole result
        rather than the first item:
      </P>
      <Run path="/api/Products?sort=price&order=desc&limit=5" />
      <P>
        The first five come back as 249.99, 199.99, 89.99, 89.99, 59.99.
        Products 3 and 8 cost the same. Ties matter for pagination: if the
        server doesn&apos;t break ties in a fixed way, the same product can
        appear at the bottom of page 1 and the top of page 2, or on neither.
        Most databases make no promise about the order of equal rows unless
        the query adds a second sort key, usually the ID.
      </P>
      <P>
        Sorting by category shows how this API handles it. Within each
        category, products stay in ID order, both ascending and descending:
      </P>
      <Code code={sortTies} lang="text" label="Results (id:category)" />
      <P>
        That is stable, which is what you want. To test for it, sort by a
        field with lots of duplicates, fetch the list twice (and page
        through it with a small limit), and check that the order never
        changes.
      </P>
      <P>More sorting cases to try on any API:</P>
      <Ul>
        <li>Strings with mixed case. Does &quot;apple&quot; sort before or after &quot;Banana&quot;?</li>
        <li>Numbers stored as strings, where &quot;10&quot; sorts before &quot;9&quot;.</li>
        <li>Records where the sort field is null or missing. Do they go first, last, or disappear?</li>
        <li>Dates in different time zones.</li>
      </Ul>

      <H2 id="ignored-parameters">Parameters that are ignored</H2>
      <P>
        What happens when you get a parameter wrong is a bigger source of
        trouble than any of the features themselves:
      </P>
      <Code code={silentIgnores} lang="text" label="Results" />
      <P>
        Every one of these returns 200 and a list that looks reasonable. A
        sort on a field that doesn&apos;t exist is dropped. An order of{" "}
        <C>sideways</C> becomes ascending. A misspelled filter,{" "}
        <C>categry</C>, is ignored, so the client asked for books and got
        all 20 products. Filtering on a nested field with dot notation
        isn&apos;t supported, and that is ignored too.
      </P>
      <P>
        The misspelled filter is the worst of these in practice. Take a
        screen that shows &quot;orders for customer 42&quot;, built on a
        filter parameter that somebody renamed. After the rename, every
        customer sees every order, and the API returns 200 the whole time.
        When you test filters, always include a case where the filter
        should remove most records, and check that it did. A test that only
        checks &quot;every returned product is in the books category&quot;
        passes on an empty list as well, so check the count too.
      </P>

      <H2 id="filters-and-search">Filters and search</H2>
      <P>
        Filters on this API are exact and case-insensitive:{" "}
        <C>?category=Electronics</C> returns the five electronics products,
        and <C>?category=electron</C> returns an empty list. Boolean fields
        work the same way:
      </P>
      <Run path="/api/Products?inStock=false" />
      <P>
        Search with <C>q</C> is a substring match. This is where encoding
        starts to matter, because search terms contain spaces, ampersands,
        percent signs and quotes, and all of those have special meaning in
        a URL:
      </P>
      <Code code={searchCases} lang="text" label="Results (ids)" />
      <P>
        Spaces work written either as <C>+</C> or <C>%20</C>. A literal{" "}
        <C>%</C> has to be sent as <C>%25</C>, and it correctly finds the
        T-shirt made of &quot;100% organic cotton&quot;. A search for an
        apostrophe works and returns two books, which is a small sign that
        the search isn&apos;t building SQL by gluing strings together (the{" "}
        <A href="/learn/security-testing">security lesson</A> covers why that
        matters). If you send a space without encoding it, curl refuses to
        send the request at all.
      </P>
      <P>
        The last two rows are worth a note. Repeating a parameter is legal in
        a URL, and APIs treat it in different ways: first value wins, last
        value wins, both values are combined with OR, or they are joined into
        one string. Here, repeating <C>q</C> or <C>category</C> returns an
        empty list, which suggests the values were joined into something
        like <C>books,home</C> that matches nothing. If your product&apos;s
        UI ever lets people pick two categories, this is a bug waiting to be
        found.
      </P>

      <H3>Combining everything</H3>
      <P>
        Filter, sort and paginate in one request, and check that they apply
        in the right order: filter first, then sort, then take the page.
      </P>
      <Run path="/api/Products?category=electronics&sort=price&order=desc&limit=2&page=2" showHeaders={["X-Total-Count"]} />
      <P>
        Page 2 holds products 3 and 4 (89.99 and 59.99), and{" "}
        <C>X-Total-Count</C> is 5, the number of electronics products, not
        20. If the total ignored the filter, a client would show
        &quot;page 1 of 10&quot; for a list with three pages. That mistake
        is common, because totals are often counted by a separate query that
        someone forgot to update.
      </P>

      <H2 id="offset-vs-cursor">Why page numbers break</H2>
      <P>
        Page numbers and offsets describe a position in the list: &quot;skip
        20, give me 10&quot;. That is fine for data that doesn&apos;t change.
        When it does change, positions move:
      </P>
      <Ol>
        <li>You fetch page 1 (items 1 to 10) of a list sorted by newest first.</li>
        <li>Someone creates a new item. It goes to the top, and everything shifts down by one.</li>
        <li>You fetch page 2 (positions 11 to 20). Position 11 is now the item that was 10, so you see it twice.</li>
      </Ol>
      <P>
        Deleting an item does the opposite: everything shifts up and one
        item is never shown. For a news feed that is a small annoyance. For a
        job that exports all invoices by walking pages, it means an invoice
        is missing from the export and nobody notices.
      </P>
      <P>
        Cursor pagination avoids this by describing where you stopped instead
        of how far you are. Each response hands you a token for the next
        request:
      </P>
      <Run path="/api/pagination/cursor?limit=3" />
      <Code code={cursorPage} lang="json" label="Response" />
      <P>
        You pass <C>next_cursor</C> back as <C>?cursor=</C> and keep going
        until <C>has_more</C> is false. An invalid cursor gets a clear 400:{" "}
        &quot;Invalid cursor. Pass the &apos;next_cursor&apos; value from a
        previous response unchanged.&quot;
      </P>
      <Note>
        <P>
          Cursors are called opaque, meaning clients shouldn&apos;t look
          inside them. Testers should. This one is Base64 for{" "}
          <C>{`{"lastId":3}`}</C>. A hand-made cursor for{" "}
          <C>{`{"lastId":1000}`}</C> is accepted and returns an empty page.
          That is harmless here. On a real API, check whether an edited
          cursor can reach records the user shouldn&apos;t see, or change a
          filter that was fixed when the cursor was issued.
        </P>
      </Note>
      <P>
        Keyset pagination is the same idea without the wrapping. The client
        sends the last ID it saw, and the server returns records after it:
      </P>
      <Run path="/api/pagination/keyset?after_id=10&limit=3" />
      <Code code={keysetPage} lang="json" label="Response" />
      <P>
        The third style puts the page links in a <C>Link</C> header, the way
        GitHub&apos;s API does. The body stays a plain array:
      </P>
      <Code code={linkHeader} lang="text" label="Terminal" />
      <P>
        The page count is right (100 items in pages of 3 is 34 pages). But
        look at the URLs. The request went to <C>https</C>, and every link
        points to <C>http</C>. This is a real bug, and a common one: the
        application runs behind a proxy that handles HTTPS, sees plain HTTP
        itself, and builds links from what it sees. A client that follows
        these links either gets redirected or, on a stricter setup, sends
        its next request unencrypted. Checking the scheme and host of every
        URL an API generates is a cheap test that catches this.
      </P>
      <P>
        For each pagination style, the core tests are the same: walk to the
        end, collect IDs, check for gaps and duplicates, and check what
        happens on the last page. For cursors and keysets, add a record while
        you are walking and confirm you still see every original record
        exactly once.
      </P>

      <Exercise>
        <P>Pick <C>/api/Books</C> and write down the results of each step.</P>
        <Ol>
          <li>Find out how many books there are from <C>X-Total-Count</C>, then walk the list with <C>limit=4</C>. Did you get every ID once?</li>
          <li>Sort by <C>genre</C>. Fetch it twice and with <C>limit=3</C> across pages. Is the order within each genre stable?</li>
          <li>Filter by a genre, sort by <C>price</C> descending and ask for page 2. Is <C>X-Total-Count</C> the filtered count?</li>
          <li>Misspell the filter name. What comes back?</li>
          <li>Walk <C>/api/pagination/offset</C> and <C>/api/pagination/link</C> to the end. Where do they signal the last page, and do the two agree on the total?</li>
        </Ol>
        <P>
          For each surprise, decide whether it is a bug, a documentation gap,
          or a design choice you would still question.
        </P>
      </Exercise>
    </>
  );
}
