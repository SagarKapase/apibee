import { A, C, Code, Exercise, H2, H3, Note, P, Run, Table, Ul } from "@/components/lesson";

const fieldCheck = `test("GET /api/Products/1 returns the headphones", async () => {
  const res = await fetch(\`\${BASE}/api/Products/1\`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.title, "Wireless Noise-Cancelling Headphones");
});`;

const productSchema = `// product-schema.mjs
export const productSchema = {
  type: "object",
  required: ["id", "title", "price", "description", "category", "image", "rating", "inStock", "createdAt"],
  additionalProperties: false,
  properties: {
    id: { type: "integer", minimum: 1 },
    title: { type: "string", minLength: 1 },
    price: { type: "number", exclusiveMinimum: 0 },
    description: { type: "string" },
    category: { enum: ["electronics", "clothing", "books", "home", "sports"] },
    image: { type: "string", format: "uri" },
    rating: {
      type: "object",
      required: ["rate", "count"],
      additionalProperties: false,
      properties: {
        rate: { type: "number", minimum: 0, maximum: 5 },
        count: { type: "integer", minimum: 0 },
      },
    },
    inStock: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
  },
};`;

const install = `npm install --save-dev ajv ajv-formats`;

const schemaTest = `// products.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { productSchema } from "./product-schema.mjs";

const BASE = "https://api.snap-test.in";
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateProduct = ajv.compile(productSchema);

test("GET /api/Products/1 matches the product schema", async () => {
  const res = await fetch(\`\${BASE}/api/Products/1\`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(validateProduct(body), ajv.errorsText(validateProduct.errors));
});

test("every product in the list matches the schema", async () => {
  const res = await fetch(\`\${BASE}/api/Products\`);
  const products = await res.json();
  assert.ok(products.length > 0);
  for (const p of products) {
    assert.ok(validateProduct(p), \`product \${p.id}: \${ajv.errorsText(validateProduct.errors)}\`);
  }
});`;

const schemaTestOutput = `$ node --test products.test.mjs
✔ GET /api/Products/1 matches the product schema (506.1345ms)
✔ every product in the list matches the schema (314.0142ms)
ℹ tests 2
ℹ pass 2
ℹ fail 0`;

const brokenScript = `// Same Ajv setup as above, with validate = ajv.compile(productSchema)
const product = await (await fetch("https://api.snap-test.in/api/Products/1")).json();
const broken = { ...product, price: "249.99", discount: 10 };
delete broken.inStock;

validate(broken);
console.log(ajv.errorsText(validate.errors, { separator: "\\n" }));`;

const brokenOutput = `data must have required property 'inStock'
data must NOT have additional properties
data/price must be number`;

const wrongValue = `const product = await (await fetch("https://api.snap-test.in/api/Products/1")).json();
console.log(validate({ ...product, price: 2.49, title: "Smartwatch Series 6" }));
// true`;

const specPath = `"/api/Products/{id}": {
  "get": {
    "tags": ["Products"],
    "summary": "Get a product by ID.",
    "operationId": "Products_GetById",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Product ID.",
        "required": true,
        "schema": { "type": "integer", "format": "int32" }
      }
    ],
    "responses": {
      "200": { "description": "The product." },
      "404": { "description": "The product does not exist." },
      "500": { "description": "Unexpected server error." }
    }
  }
}`;

const specComponent = `"Product": {
  "type": "object",
  "properties": {
    "id": { "type": "integer", "format": "int32" },
    "title": { "type": "string", "nullable": true },
    "price": { "type": "number", "format": "double" },
    "description": { "type": "string", "nullable": true },
    "category": { "type": "string", "nullable": true },
    "image": { "type": "string", "nullable": true },
    "rating": { "$ref": "#/components/schemas/Rating" },
    "inStock": { "type": "boolean" },
    "createdAt": { "type": "string", "nullable": true }
  },
  "additionalProperties": false
}`;

const specCheck = `import Ajv from "ajv";

const BASE = "https://api.snap-test.in";
const spec = await (await fetch(\`\${BASE}/openapi/v1.json\`)).json();

// The spec uses OpenAPI formats such as int32 and double, which Ajv
// doesn't know. Register them as "anything goes" so it doesn't refuse.
const ajv = new Ajv({ allErrors: true, strict: false });
for (const f of ["int32", "int64", "double", "float"]) ajv.addFormat(f, true);
ajv.addSchema(spec, "spec");

const validate = ajv.getSchema("spec#/components/schemas/Product");
const product = await (await fetch(\`\${BASE}/api/Products/1\`)).json();

console.log("real product:", validate(product));
console.log("empty object:", validate({}));
console.log("extra field:", validate({ ...product, discount: 10 }));
console.log("title: null:", validate({ ...product, title: null }));`;

const specCheckOutput = `real product: true
empty object: true
extra field: false
title: null: true`;

const v1 = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
deprecation: @1751328000
link: </api/v2/profile>; rel="successor-version"
sunset: Thu, 31 Dec 2026 23:59:59 GMT
x-api-version: 1

{
  "id": 101,
  "name": "Ava Thompson",
  "email": "ava.thompson@example.com",
  "phone": "+1-555-0101",
  "address": "742 Evergreen Terrace, Springfield, IL 62704, USA",
  "memberSince": "2023-04-12"
}`;

const v2 = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
x-api-version: 2

{
  "id": 101,
  "firstName": "Ava",
  "lastName": "Thompson",
  "displayName": "Ava T.",
  "contact": {
    "email": "ava.thompson@example.com",
    "phone": { "countryCode": "+1", "number": "555-0101" }
  },
  "address": {
    "street": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62704",
    "country": "US"
  },
  "preferences": { "language": "en-US", "timezone": "America/Chicago", "newsletter": true },
  "createdAt": "2023-04-12T09:30:00Z",
  "apiVersion": "2"
}`;

const negotiate = `$ curl -i -H "X-API-Version: 1" "https://api.snap-test.in/api/versioned/profile?api-version=2"
HTTP/1.1 200 OK
deprecation: @1751328000
sunset: Thu, 31 Dec 2026 23:59:59 GMT
x-api-version: 1
x-api-version-source: header

$ curl -i -H "X-API-Version: 3" https://api.snap-test.in/api/versioned/profile
HTTP/1.1 400 Bad Request

{"status":400,"error":"Bad Request","message":"API version '3' is not supported.","source":"header","supportedVersions":["1","2"]}`;

export default function SchemasContracts() {
  return (
    <>
      <P>
        Most tests written in the <A href="/learn/automation">automation lesson</A>{" "}
        look something like this:
      </P>
      <Code code={fieldCheck} lang="javascript" />
      <P>
        It checks one field. It keeps passing if a developer renames{" "}
        <C>inStock</C> to <C>in_stock</C>, drops <C>rating</C>, or starts
        sending the price as the string <C>&quot;249.99&quot;</C> instead of
        the number <C>249.99</C>. Every one of those changes breaks some
        client. The string price is a good example of how quietly it can
        happen. In JavaScript, <C>&quot;249.99&quot; * 2</C> is still{" "}
        <C>499.98</C>, so the cart total looks fine, but{" "}
        <C>&quot;249.99&quot; + 5</C> is <C>&quot;249.995&quot;</C>, so the
        total with shipping is wrong. A Swift or Kotlin app that decodes the
        response into a typed model fails to decode it at all and shows an
        empty screen.
      </P>
      <P>
        You could add an assertion for every field on every endpoint, but
        nobody keeps that up for long. The usual answer is to describe the
        shape of a response once, as a schema, and check every response
        against it.
      </P>

      <H2 id="json-schema">JSON Schema</H2>
      <P>
        JSON Schema is a JSON document that describes other JSON documents:
        which fields exist, their types, which ones are required, and limits
        on their values. Here is a schema for a product, written by looking at
        what <C>GET /api/Products/1</C> actually returns and at the categories
        from <C>GET /api/Products/categories</C>:
      </P>
      <Code code={productSchema} lang="javascript" />
      <P>
        A few of these choices are deliberate. <C>required</C> lists every
        field, because a client that reads <C>product.rating.rate</C> crashes
        if <C>rating</C> is missing. <C>additionalProperties: false</C> makes
        unknown fields an error, which is stricter than most people want; more
        on that below. The <C>category</C> enum means a new category fails the
        test, and that is intentional too: the product filter in the app has a
        fixed list of categories, and someone should decide what happens to a
        sixth one.
      </P>

      <H3>Validating in a test</H3>
      <P>
        Ajv is the most widely used JSON Schema validator for JavaScript.{" "}
        <C>ajv-formats</C> adds checks for formats such as{" "}
        <C>date-time</C> and <C>uri</C>, which Ajv ignores otherwise.
      </P>
      <Code code={install} lang="curl" />
      <Code code={schemaTest} lang="javascript" />
      <Code code={schemaTestOutput} lang="text" label="Output" />
      <P>
        The second test is the more useful one. A single product can look
        fine while product 17 has a null description because someone created
        it through a form that allowed one. Checking the whole list catches
        that. Note that the list includes records other people created on this
        API, so it may fail for reasons that have nothing to do with you. That
        is also realistic.
      </P>
      <P>
        To see what a failure looks like, break a real product on purpose:
        turn the price into a string, add a field and remove another.
      </P>
      <Code code={brokenScript} lang="javascript" />
      <Code code={brokenOutput} lang="text" label="Output" />
      <P>
        Three problems, reported at once because of <C>allErrors: true</C>.
        Without that option Ajv stops at the first error, and you fix them one
        test run at a time.
      </P>

      <H3>How strict to be</H3>
      <P>
        Adding a field to a response is normally safe. Clients that don&apos;t
        know about the field ignore it. So <C>additionalProperties: false</C>{" "}
        makes your test fail on a change that breaks nobody. Teams split on
        this. My preference: be strict in the test suite that belongs to the
        API itself, so every new field is a conscious decision and someone
        updates the schema and the docs. Be loose in tests that a consuming
        team writes against someone else&apos;s API, because there you only
        care about the fields you use, and you don&apos;t want your build to
        break every time the other team ships something.
      </P>

      <H2 id="what-schemas-miss">What a schema won&apos;t catch</H2>
      <P>
        A schema checks shape, not truth. Take the real product and give it
        another product&apos;s title and a price that is a hundred times too
        low:
      </P>
      <Code code={wrongValue} lang="javascript" />
      <P>
        Valid. The schema has no way to know that product 1 costs 249.99 or
        that it is headphones. The same goes for rules that link fields
        together, such as &quot;<C>refundedAt</C> is set only when{" "}
        <C>status</C> is <C>refunded</C>&quot;. JSON Schema can express some
        of these with <C>if</C> and <C>then</C>, but the result is hard to
        read, and a plain assertion in the test is usually clearer. Schema
        validation replaces the long list of type checks. It doesn&apos;t
        replace the handful of value checks that tell you the API did the
        right thing.
      </P>

      <H2 id="openapi">OpenAPI as the contract</H2>
      <P>
        Writing schemas by hand works for a few endpoints. For a whole API,
        the schemas usually come from an OpenAPI document: a single file that
        lists every path, its parameters, request bodies and responses, with
        schemas for each. This API publishes one at{" "}
        <C>/openapi/v1.json</C>. It describes 286 paths. Here is the entry
        for getting a product, trimmed to the <C>get</C> operation:
      </P>
      <Code code={specPath} lang="json" label="openapi/v1.json (excerpt)" />
      <P>
        Look at the <C>200</C> response. It has a description and nothing
        else. There is no <C>content</C> section, so the document doesn&apos;t
        say what the body of a successful response looks like. This is not
        an isolated gap. When I counted, 1 of the 428 success responses in
        this document declares a body schema. The spec tells you which
        endpoints exist and what they accept, but it can&apos;t be used to
        check what they return.
      </P>
      <P>
        There is a <C>Product</C> schema in <C>components</C>, used for the
        request body of create and update:
      </P>
      <Code code={specComponent} lang="json" label="components.schemas (excerpt)" />
      <P>
        You can validate responses against it. Ajv understands the OpenAPI
        3.0 <C>nullable</C> keyword, and you can load the whole spec and point
        at the component by its path:
      </P>
      <Code code={specCheck} lang="javascript" />
      <Code code={specCheckOutput} lang="text" label="Output" />
      <P>
        An empty object passes. The schema has no <C>required</C> list, and
        every string is nullable, so almost anything with the right types is
        a valid product. Only the extra field fails, because of{" "}
        <C>additionalProperties: false</C>.
      </P>
      <P>
        This is typical of a spec generated from code. The framework can see
        that a controller method returns &quot;some result&quot;, but not what
        is inside it, and it marks reference types as nullable because the
        code allows null. The document is accurate about what the code
        promises, which is very little. When a team says the OpenAPI file is
        the contract, it is worth testing the file itself: every operation
        should have a response schema, and schemas should list their required
        fields. A short script that walks the spec and counts the gaps, like
        the count above, makes a reasonable first test. Tools such as
        Schemathesis go further and generate requests from the spec, then
        check the responses against it, but they can only be as strict as the
        document they read.
      </P>

      <H2 id="contract-testing">Consumer-driven contract testing</H2>
      <P>
        Schemas describe what the provider says it returns. Contract testing
        flips that around and records what each consumer actually relies on.
        Pact is the tool most people mean when they say contract testing.
      </P>
      <P>
        It works in two halves. The team that builds the consumer (say, the
        mobile app) writes tests against a mock server provided by Pact. Each
        test states a request and the parts of the response the app needs:
        &quot;GET /api/Products/1 returns 200 with a numeric{" "}
        <C>price</C> and a string <C>title</C>&quot;. Running those tests
        produces a contract file. The provider team then runs that file
        against the real API in its own pipeline. Pact replays each request
        and checks the response still satisfies what the consumer asked for.
        If a provider change would break the app, the provider&apos;s build
        fails before anything is deployed.
      </P>
      <P>
        This pays off when several teams own services that call each other
        and deploy on their own schedules, which is where the question
        &quot;can I ship this without breaking someone&quot; is hard to answer.
        It is a lot of machinery otherwise: a broker to store contracts,
        provider states to set up test data, and agreement between teams on
        who fixes what. If one team owns the API and its only client, schema
        tests in the API&apos;s own suite plus a few end-to-end tests cover
        the same risk for much less work.
      </P>

      <H2 id="breaking-changes">Breaking and non-breaking changes</H2>
      <P>
        Whichever tool you use, the point is to notice breaking changes before
        clients do. Roughly:
      </P>
      <Table
        head={["Change", "Usually"]}
        rows={[
          ["Add an optional field to a response", "Safe"],
          ["Add a new endpoint", "Safe"],
          ["Add an optional request parameter", "Safe"],
          ["Remove or rename a response field", "Breaking"],
          ["Change a field's type, such as number to string", "Breaking"],
          ["Make an optional request field required", "Breaking"],
          ["Add a value to an enum in a response", "Often breaking: clients with a switch statement hit their default case"],
          ["Change the meaning of a field without changing its name", "Breaking, and no schema test will notice"],
          ["Tighten validation, such as a shorter maximum length", "Breaking for anyone sending longer values"],
        ]}
      />
      <P>
        APIs that need to make breaking changes publish a new version and
        keep the old one running for a while. This API has an example of that.
      </P>

      <H2 id="versioning">Versioning on this API</H2>
      <P>
        The profile endpoint exists in two versions, selected by the path:
      </P>
      <Run path="/api/v1/profile" showHeaders={["Deprecation", "Sunset", "Link", "X-API-Version"]} />
      <Code code={v1} lang="text" label="Response" />
      <Code code={v2} lang="text" label="GET /api/v2/profile" />
      <P>
        Nearly every field changed. <C>name</C> was split into{" "}
        <C>firstName</C> and <C>lastName</C>. <C>phone</C> and{" "}
        <C>address</C> went from strings to objects. <C>memberSince</C>, a
        date, became <C>createdAt</C>, a full timestamp. Any one of these
        would break a v1 client, which is why v2 is a separate version rather
        than an update to v1.
      </P>
      <P>
        The v1 response also carries headers that tell clients it is on the
        way out. <C>Deprecation: @1751328000</C> is a Unix timestamp (1 July
        2025), the moment v1 became deprecated. <C>Sunset</C> is the date it
        is scheduled to stop working. <C>Link</C> points to the replacement.
        These are standard headers, and a client or a monitoring job can log
        a warning when it sees them. The v2 response has none of them.
      </P>
      <P>
        <C>/api/versioned/profile</C> serves both versions from one path and
        picks one from an <C>X-API-Version</C> header, an{" "}
        <C>api-version</C> query parameter or the <C>Accept</C> media type,
        falling back to the latest. <C>GET /api/versions</C> documents the
        order of precedence as header, then query, then Accept. The response
        tells you which source won:
      </P>
      <Code code={negotiate} lang="text" label="Terminal" />
      <P>For a versioned API, the tests worth having are:</P>
      <Ul>
        <li>each selection method returns the version it asked for</li>
        <li>conflicting selections resolve in the documented order</li>
        <li>no selection returns the documented default</li>
        <li>an unsupported version fails clearly with a 400, not a silent fallback</li>
        <li>deprecated versions send <C>Deprecation</C> and <C>Sunset</C>, and current versions don&apos;t</li>
        <li>each version still matches its own schema, so fixing a bug in v2 doesn&apos;t change v1</li>
      </Ul>
      <P>
        The last point is where versioned APIs usually go wrong. Two versions
        often share code, and a change made for v2 leaks into v1. A schema per
        version, checked on every build, catches that.
      </P>

      <Note title="The default version moves">
        <P>
          Clients that send no version get the latest. That is convenient
          until v3 ships and every one of those clients changes behaviour on
          the same day. If you write a client against a versioned API, always
          send a version.
        </P>
      </Note>

      <Exercise>
        <P>
          Write a JSON Schema for the v2 profile, with <C>required</C> lists
          at every level. Validate <C>GET /api/v2/profile</C> against it, then
          validate <C>GET /api/v1/profile</C> against the same schema and read
          the errors. They are a list of the breaking changes between the two
          versions.
        </P>
        <P>
          Then add two tests for <C>/api/versioned/profile</C>. The first
          sends <C>?api-version=1</C> together with{" "}
          <C>Accept: application/vnd.apibee.v2+json</C> and checks that the
          query wins, as <C>/api/versions</C> says it should. The second
          checks that a v1 response includes a <C>Sunset</C> header with a
          date in the future. That second test will start failing on 1
          January 2027. Decide whether that is what you want, and what the
          test should do instead.
        </P>
      </Exercise>
    </>
  );
}
