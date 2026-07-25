const Typesense = require("typesense");

const client = new Typesense.Client({
  nodes: [
    {
      host: "127.0.0.1",
      port: 8108,
      protocol: "http",
    },
  ],
  apiKey: "xyz",
  connectionTimeoutSeconds: 5,
});

async function test() {
  try {
    const result = await client.collections("products").retrieve();
    console.log("✅ Connected!");
    console.log(result);
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  }
}

test();