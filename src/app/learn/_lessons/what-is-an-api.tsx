import { A, C, Code, Exercise, H2, Note, P, Run, Table, Ul } from "@/components/lesson";

const product = `{
  "id": 1,
  "title": "Wireless Noise-Cancelling Headphones",
  "price": 249.99,
  "description": "Over-ear headphones with 30hr battery life and active noise cancellation.",
  "category": "electronics",
  "image": "https://picsum.photos/seed/prod1/400/400",
  "rating": { "rate": 4.3, "count": 127 },
  "inStock": true,
  "createdAt": "2025-06-12T10:30:00Z"
}`;

const notFound = `{
  "status": 404,
  "error": "Not Found",
  "message": "Product with ID 9999 does not exist."
}`;

export default function WhatIsAnApi() {
  return (
    <>
      <P>
        An API is a way for one program to ask another program for something.
        The name stands for application programming interface, which tells you
        very little. In practice, and in the rest of this tutorial, an API is a
        server that answers requests with data instead of web pages.
      </P>
      <P>
        A weather app on your phone does not store forecasts. When you open it,
        it sends a request to a server somewhere, gets back a few kilobytes of
        temperatures and wind speeds, and draws them on the screen. The server
        part is the API. The app is one of its clients.
      </P>

      <H2 id="first-request">Your first request</H2>
      <P>
        Paste this address into your browser&apos;s address bar and press Enter:
      </P>
      <Code code="https://api.testingapis.com/api/Products/1" lang="text" label="URL" />
      <P>You get back something like this:</P>
      <Code code={product} lang="json" />
      <P>
        Your browser sent a request to a server. The server looked up product
        number 1 and sent back a description of it. That exchange, one request
        and one response, is what every API interaction comes down to. The
        rest of this tutorial is about the details of that exchange, and how to
        check that the server gets them right.
      </P>
      <P>
        You can also send the request from this page. The Send button below
        does the same thing your browser just did, and shows the status of the
        response above the body. You will see these buttons throughout the
        lessons.
      </P>
      <Run path="/api/Products/1" />

      <H2 id="clients-and-servers">Clients and servers</H2>
      <P>
        The program that sends the request is the client. The program that
        answers is the server. A client can be a browser, a phone app, another
        server, a command-line tool or a test you wrote. The server can&apos;t
        tell them apart, and it doesn&apos;t need to. It reads the request,
        does its work and replies.
      </P>
      <P>
        This matters for testing. Because the server treats every client the
        same way, you can test it without the app that normally talks to it.
        You don&apos;t need to tap through five screens of a shopping app to
        see whether the product price is right. You ask the API for the
        product and look at the price.
      </P>

      <H2 id="endpoints">Endpoints</H2>
      <P>
        The address you opened has two parts. <C>https://api.testingapis.com</C>{" "}
        is the base URL: it says which server to talk to. <C>/api/Products/1</C>{" "}
        is the path: it says what you want from that server. Each path the
        server understands is called an endpoint. This API has a few hundred.
        Some examples:
      </P>
      <Table
        head={["Path", "What it returns"]}
        rows={[
          [<C key="a">/api/Products/1</C>, "Product number 1"],
          [<C key="b">/api/Products</C>, "Every product, as a list"],
          [<C key="c">/api/Products/categories</C>, "The product categories"],
          [<C key="d">/api/Countries/code/IN</C>, "The country with the ISO code IN"],
          [<C key="e">/api/health</C>, "Whether the API is running"],
        ]}
      />
      <P>
        You find out which endpoints exist from the API&apos;s documentation.
        For this API that is the <A href="/docs">API reference</A>. Real
        projects vary a lot here. Some have careful docs, some have an
        OpenAPI file generated from the code, and some have a message in a
        chat channel from the developer who wrote it. Part of a tester&apos;s
        job is noticing when the docs and the API disagree.
      </P>

      <H2 id="when-things-go-wrong">When the answer is no</H2>
      <P>Now ask for a product that doesn&apos;t exist:</P>
      <Run path="/api/Products/9999" />
      <P>The server replies:</P>
      <Code code={notFound} lang="json" />
      <P>
        This is also a correct response. There is no product 9999, and the
        server says so clearly: a 404 status, which means &quot;not
        found&quot;, and a message explaining which ID was missing. A good API
        is as careful about the requests it can&apos;t fulfil as the ones it
        can. A lot of API testing happens here, on the unhappy path, because
        that is where developers spend the least time and where most bugs are.
      </P>

      <H2 id="why-test-apis">Why test at the API level</H2>
      <P>
        You could test everything through the app&apos;s screens. Teams test
        APIs directly for a few practical reasons.
      </P>
      <Ul>
        <li>
          It is faster. A request takes milliseconds. Clicking through a UI to
          reach the same state takes seconds, and automating those clicks
          takes much longer to write and breaks whenever a button moves.
        </li>
        <li>
          The API usually exists first. Backend and frontend are often built
          in parallel, so you can start testing the backend before there is
          anything to click.
        </li>
        <li>
          The UI hides problems. Say a shopping app&apos;s quantity box only
          allows numbers from 1 to 10. The API behind it receives a plain
          request, and anyone can send one with a quantity of -5. If the
          server trusts the app to have checked, the order goes through with
          a negative total. You only find that by talking to the API directly.
        </li>
        <li>
          One API often serves several clients: a website, an iPhone app, an
          Android app, a partner integration. A bug in the API is a bug in all
          of them.
        </li>
      </Ul>
      <P>
        UI testing still has its place. It is the only way to check that the
        screens work. But the rules of the system (who can see what, what a
        valid order looks like, what happens when stock runs out) live in the
        API, so that is where you check them.
      </P>

      <Note title="About the API used in this tutorial">
        <P>
          Every example uses <C>https://api.testingapis.com</C>, a public API
          built for practice. You don&apos;t need an account. You can create,
          change and delete records, and everything resets to the original
          data when the server restarts. Other people use it too, so
          don&apos;t send anything private, and don&apos;t be surprised if a
          record you created disappears.
        </P>
      </Note>

      <Exercise>
        <P>Open each of these in your browser and write down what you get back.</P>
        <Ul>
          <li>
            <C>/api/Products/2</C>
          </li>
          <li>
            <C>/api/Countries/code/</C> followed by your own country&apos;s
            two-letter code
          </li>
          <li>
            <C>/api/Products/9999</C> and then <C>/api/Products/abc</C>
          </li>
        </Ul>
        <P>
          The last two both fail with a 404, but they don&apos;t fail the same
          way. Look closely at the body of each. Would you report the
          difference as a bug? There is no single right answer. What matters
          is that you noticed, and that you can explain why a client might
          care.
        </P>
      </Exercise>
    </>
  );
}
