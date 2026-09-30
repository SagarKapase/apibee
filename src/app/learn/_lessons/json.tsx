import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const types = `{
  "string": "hello",
  "emptyString": "",
  "integer": 42,
  "negativeInteger": -7,
  "float": 3.14159,
  "exponent": 6.022e23,
  "booleanTrue": true,
  "booleanFalse": false,
  "nullValue": null,
  "array": [1, 2, 3],
  "emptyArray": [],
  "object": { "key": "value" },
  "emptyObject": {},
  "arrayOfObjects": [ { "id": 1, "name": "Alice" }, { "id": 2, "name": "Bob" } ],
  "nestedArrays": [[1, 2], [3, [4, [5]]]],
  "stringThatLooksLikeNumber": "123",
  "stringThatLooksLikeBoolean": "true",
  "stringThatLooksLikeNull": "null"
}`;

const product = `{
  "id": 1,
  "title": "Wireless Noise-Cancelling Headphones",
  "price": 249.99,
  "category": "electronics",
  "rating": { "rate": 4.3, "count": 127 },
  "inStock": true,
  "createdAt": "2025-06-12T10:30:00Z"
}`;

const nulls = `{
  "nullValue": null,
  "nestedNull": { "a": null, "b": { "c": null } },
  "arrayOfNulls": [null, null, null],
  "arrayWithNull": [1, null, 3],
  "nullAsString": "null",
  "undefinedAsString": "undefined",
  "noneAsString": "None",
  "emptyString": "",
  "emptyArray": [],
  "emptyObject": {},
  "zero": 0,
  "false": false
}`;

const numbers = `{
  "int64Max": 9223372036854775807,
  "int64MaxAsString": "9223372036854775807",
  "maxSafeInteger": 9007199254740991,
  "beyondSafeInteger": 9007199254740993,
  "beyondSafeIntegerAsString": "9007199254740993",
  "pointOnePlusPointTwo": 0.30000000000000004,
  "money": 19.99,
  "moneyAsString": "19.99",
  "trailingZeros": 1.50,
  "negativeZero": -0,
  "numberAsString": "42",
  "nanAsString": "NaN"
}`;

const jsParse = `JSON.parse(body).beyondSafeInteger   // 9007199254740992
JSON.parse(body).int64Max            // 9223372036854776000`;

const pyParse = `json.loads(body)["beyondSafeInteger"]   # 9007199254740993
json.loads(body)["int64Max"]            # 9223372036854775807`;

const dates = `{
  "iso8601Utc": "2025-07-15T09:30:00Z",
  "iso8601PositiveOffset": "2025-07-15T15:00:00+05:30",
  "iso8601NoZone": "2025-07-15T09:30:00",
  "dateOnly": "2025-07-15",
  "unixSeconds": 1752571800,
  "unixMilliseconds": 1752571800000,
  "usFormat": "07/15/2025",
  "euFormat": "15/07/2025",
  "invalidLeapDay": "2025-02-29T00:00:00Z",
  "nullDate": null,
  "emptyDate": ""
}`;

const duplicates = `{
  "id": 1,
  "name": "first value",
  "name": "second value",
  "nested": { "flag": true, "flag": false },
  "id": 2
}`;

const malformed = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id": 1, "name": "Alice", "tags": ["a", "b",], "active": tru`;

export default function Json() {
  return (
    <>
      <P>
        Most APIs you will test send and receive JSON. It is a text format for
        structured data, and it is small enough to learn in an afternoon. The
        syntax is rarely the problem. The problem is that JSON leaves a few
        things undefined, and different programs fill those gaps differently.
        Those gaps are where a lot of bugs live, so this lesson spends more
        time on them than on the syntax.
      </P>

      <H2 id="six-types">Six kinds of value</H2>
      <P>A JSON value is always one of these:</P>
      <Table
        head={["Type", "Example", "Notes"]}
        rows={[
          ["Object", <C key="o">{'{ "key": "value" }'}</C>, "Named fields in curly braces. Keys are always strings in double quotes."],
          ["Array", <C key="a">[1, 2, 3]</C>, "An ordered list in square brackets. Items can be of any type, mixed."],
          ["String", <C key="s">&quot;hello&quot;</C>, "Text in double quotes. Single quotes are not allowed."],
          ["Number", <C key="n">42, -7, 3.14159, 6.022e23</C>, "One type for integers and decimals. No leading zeros, no NaN, no Infinity."],
          ["Boolean", <C key="b">true, false</C>, "Lowercase, no quotes."],
          ["Null", <C key="u">null</C>, "Lowercase, no quotes. Means “no value”."],
        ]}
      />
      <P>
        That is the whole type system. There is no date type, no integer type
        separate from decimals, and no way to add comments. This API has an
        endpoint that returns one of everything:
      </P>
      <Run path="/api/edge-cases/types" />
      <Code code={types} lang="json" />
      <P>
        Look at the last three fields. <C>&quot;123&quot;</C>,{" "}
        <C>&quot;true&quot;</C> and <C>&quot;null&quot;</C> are all strings,
        because they are in quotes. A person reading the response sees a
        number, a boolean and a null. A program sees three strings. When you
        check a response, check the type as well as the value. An API that
        returns <C>&quot;price&quot;: &quot;249.99&quot;</C> one day and{" "}
        <C>&quot;price&quot;: 249.99</C> the next has changed its contract,
        even though the number looks the same.
      </P>

      <H2 id="pointing-at-values">Pointing at a value</H2>
      <P>
        When you write a test or a bug report, you need a way to say which
        value you mean. Here is part of the product from{" "}
        <A href="/learn/what-is-an-api">the first lesson</A>:
      </P>
      <Code code={product} lang="json" />
      <P>
        The usual informal notation uses a dot to go into an object and square
        brackets with a number to pick an item from an array. Counting starts
        at zero.
      </P>
      <Table
        head={["Path", "Value"]}
        rows={[
          [<C key="1">title</C>, <C key="1v">&quot;Wireless Noise-Cancelling Headphones&quot;</C>],
          [<C key="2">rating.rate</C>, <C key="2v">4.3</C>],
          [<C key="3">rating.count</C>, <C key="3v">127</C>],
        ]}
      />
      <P>
        When the whole response is an array, as it is for{" "}
        <C>/api/Products?limit=2</C>, the first product&apos;s ID is{" "}
        <C>[0].id</C> and the second product&apos;s rating is{" "}
        <C>[1].rating.rate</C>. Tools write this slightly differently. JSONPath,
        which you will see in Postman, REST Assured and many test libraries,
        starts with a dollar sign for the root: <C>$.rating.rate</C>,{" "}
        <C>$[0].id</C>. It also has wildcards, so <C>$[*].price</C> means
        &quot;the price of every item&quot;. JMESPath, used by the AWS command
        line tools, writes the same thing as <C>[*].price</C>. You don&apos;t
        need to learn either in depth yet. Knowing that <C>$[0].id</C> means
        &quot;the id of the first item&quot; is enough to read most test code.
      </P>

      <H2 id="null-missing-empty">Null, missing and empty</H2>
      <P>
        These look similar and mean different things. Suppose a user has no
        middle name. An API could say so in at least five ways:
      </P>
      <Ul>
        <li>
          <C>&quot;middleName&quot;: null</C>, the field exists and has no value
        </li>
        <li>no <C>middleName</C> key at all</li>
        <li>
          <C>&quot;middleName&quot;: &quot;&quot;</C>, an empty string
        </li>
        <li>
          <C>&quot;middleName&quot;: &quot;null&quot;</C>, the four-letter word
          null, usually a bug where something called toString on a null
        </li>
        <li>
          <C>&quot;middleName&quot;: &quot;None&quot;</C> or{" "}
          <C>&quot;undefined&quot;</C>, the same bug from Python or JavaScript
        </li>
      </Ul>
      <P>This endpoint returns all of them next to each other:</P>
      <Run path="/api/edge-cases/nulls" />
      <Code code={nulls} lang="json" />
      <P>
        Which of these is right depends on the API&apos;s documentation, and
        the documentation often doesn&apos;t say. What you can test is
        consistency. If one product has <C>&quot;discount&quot;: null</C> and
        another has no <C>discount</C> key, a client that reads{" "}
        <C>product.discount.amount</C> will crash on one of them and not the
        other. Also watch for <C>0</C> and <C>false</C> being used to mean
        &quot;unknown&quot;. A stock count of 0 and a stock count nobody knows
        are different facts.
      </P>

      <H2 id="numbers">Numbers</H2>
      <P>
        JSON puts no limit on the size or precision of a number. The programs
        that read JSON do. JavaScript stores every number as a 64-bit float,
        which can hold integers exactly only up to 9,007,199,254,740,991.
        Above that, it rounds silently.
      </P>
      <Run path="/api/edge-cases/numbers" />
      <Code code={numbers} lang="json" label="JSON (trimmed)" />
      <P>Parse that response in JavaScript and in Python and compare:</P>
      <Code code={jsParse} lang="javascript" />
      <Code code={pyParse} lang="python" />
      <P>
        JavaScript turned <C>9007199254740993</C> into{" "}
        <C>9007199254740992</C> without any error. Python kept it exact. If an
        API uses 64-bit integer IDs (Twitter&apos;s did, and so do many
        databases), a JavaScript client can end up asking for the wrong record.
        That is why careful APIs send large IDs as strings, like{" "}
        <C>int64MaxAsString</C> above. When you test an API with big numeric
        IDs, check what a browser client actually receives.
      </P>
      <P>
        Decimals have a related problem. <C>0.1 + 0.2</C> is{" "}
        <C>0.30000000000000004</C> in almost every language, because binary
        floats can&apos;t represent 0.1 exactly. For money this matters. Some
        APIs send prices as numbers (<C>19.99</C>), some as strings (
        <C>&quot;19.99&quot;</C>), and some as integer cents (<C>1999</C>).
        Any of them can work. A test should check that totals add up to the
        cent, not that they are &quot;close enough&quot;.
      </P>
      <P>
        Two smaller things from the same response. <C>1.50</C> and{" "}
        <C>1.5</C> are the same number once parsed, so a test that compares
        raw text will fail where a test that compares values passes. And{" "}
        <C>-0</C> is legal JSON, but JavaScript&apos;s{" "}
        <C>JSON.stringify(-0)</C> writes <C>0</C>, so it won&apos;t survive a
        round trip.
      </P>

      <H2 id="dates">Dates are strings</H2>
      <P>
        JSON has no date type, so dates travel as strings or numbers, and every
        API picks its own format. Here is one moment in time written several
        ways:
      </P>
      <Run path="/api/edge-cases/dates" />
      <Code code={dates} lang="json" label="JSON (trimmed)" />
      <P>
        The format you will see most is ISO 8601 with a zone, like{" "}
        <C>2025-07-15T09:30:00Z</C>. The <C>Z</C> means UTC. Things to check
        when an API returns dates:
      </P>
      <Ul>
        <li>
          The zone is present. <C>2025-07-15T09:30:00</C> without one means
          9:30 somewhere, and every client will guess a different somewhere.
        </li>
        <li>
          Unix timestamps say whether they are seconds or milliseconds.{" "}
          <C>1752571800</C> and <C>1752571800000</C> are the same instant, and
          mixing them up puts you in 1970 or the year 57500.
        </li>
        <li>
          <C>07/15/2025</C> and <C>15/07/2025</C> are unambiguous only because
          15 can&apos;t be a month. <C>03/04/2025</C> is March or April
          depending on who reads it.
        </li>
        <li>
          Impossible dates like <C>2025-02-29</C> are accepted by some parsers
          and rejected by others. Try sending them to an API that takes dates
          as input.
        </li>
      </Ul>

      <H2 id="key-order">Key order and duplicate keys</H2>
      <P>
        The keys of an object have no order. <C>{'{"a": 1, "b": 2}'}</C> and{" "}
        <C>{'{"b": 2, "a": 1}'}</C> are the same object. Most servers happen
        to send keys in the same order every time, so it&apos;s tempting to
        compare the whole response as a string. That test breaks the day a
        library upgrade reorders the keys, and nothing is actually wrong.
        Compare parsed values instead. Array order, on the other hand, does
        matter: <C>[1, 2]</C> and <C>[2, 1]</C> are different arrays.
      </P>
      <P>
        Duplicate keys are a stranger case. The JSON standard says keys
        &quot;should&quot; be unique, not that they must, so this is
        technically allowed:
      </P>
      <Run path="/api/edge-cases/duplicate-keys" />
      <Code code={duplicates} lang="json" />
      <P>
        JavaScript&apos;s <C>JSON.parse</C> and Python&apos;s{" "}
        <C>json.loads</C> both keep the last value, giving{" "}
        <C>{'{"id": 2, "name": "second value", "nested": {"flag": false}}'}</C>.
        Other parsers keep the first value or reject the document. If a
        gateway checks the first <C>role</C> key and the backend reads the
        second, that difference becomes a security hole. You won&apos;t meet
        duplicate keys often in responses, but they are worth sending in
        requests when you test input handling.
      </P>

      <H2 id="invalid-json">When the JSON is broken</H2>
      <P>
        Sometimes a server sends something that isn&apos;t valid JSON at all:
        a truncated body, an HTML error page, a stack trace. Here is a response
        that says it is JSON and isn&apos;t:
      </P>
      <Code code={malformed} lang="text" label="Response" />
      <P>
        There is a trailing comma after <C>&quot;b&quot;</C>, and the body
        stops in the middle of <C>true</C>. The status is 200 and the{" "}
        <C>Content-Type</C> header says <C>application/json</C>, so a client
        will try to parse it and fail. Node.js reports{" "}
        <C>Unexpected token &apos;]&apos;</C>. Python reports{" "}
        <C>Illegal trailing comma before end of array</C>. In a real API this
        usually means the server crashed partway through writing the response,
        or a proxy cut it off. The lesson for tests: parse the body as part of
        every check. A 200 with an unparseable body is a failure, and a test
        that only looks at the status code will miss it.
      </P>

      <Note title="Tools that help">
        <P>
          The <A href="/tools/json-formatter">JSON formatter</A> on this site
          indents a response and points at the line of the first syntax
          error. Paste the malformed body above into it to see what the error
          looks like.
        </P>
      </Note>

      <H3>Reading a large response</H3>
      <P>
        Real responses are often hundreds of lines. Before checking details,
        get the shape: is the top level an object or an array, how many items
        are there, which fields does one item have. Then read one item fully.
        Most JSON bugs are visible from the shape alone, such as a list that
        comes back as a single object when there is one result, or an object
        wrapped in an extra <C>data</C> key on one endpoint and not on
        another.
      </P>

      <Exercise>
        <P>
          Send <C>GET /api/Countries/code/IN</C> and answer these from the
          response, writing each path in the dot notation from this lesson:
        </P>
        <Ul>
          <li>What type is <C>population</C>, and what type is <C>callingCode</C>? Why might they differ?</li>
          <li>What is the path to the currency symbol?</li>
          <li>What is the path to the second language?</li>
          <li>
            The <C>flag</C> field is an emoji. Look at the raw response with
            curl and compare it with what your browser shows. What is
            different, and does it matter to a client?
          </li>
        </Ul>
        <P>
          Then open <C>/api/edge-cases/strings</C> and find at least two
          values that would look fine in a browser but could break a program
          that stores or displays them.
        </P>
      </Exercise>
    </>
  );
}
