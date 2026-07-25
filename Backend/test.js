const Typesense = require("typesense");

const client = new Typesense.Client({
  nodes: [
    {
      host: "localhost",
      port: 8108,
      protocol: "http",
    },
  ],
  apiKey: "xyz",
  connectionTimeoutSeconds: 5,
});

const collection = client.collections("products");

console.log(collection);
console.log(Object.keys(collection));
