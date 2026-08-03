const express = require("express");
const cors = require("cors");
const Typesense = require("typesense");

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// Typesense Configuration
// =========================
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

async function verifyTypesenseConnection() {
  try {
    const health = await client.health.retrieve();
    console.log("Typesense health:", health);

    const collection = await client.collections("products").retrieve();
    console.log("Typesense collection verified:", {
      name: collection.name,
      fieldCount: Array.isArray(collection.fields) ? collection.fields.length : 0,
    });
  } catch (error) {
    console.error("Typesense startup verification failed:", error.stack || error);
  }
}

// =========================
// Home Route
// =========================
app.get("/", (req, res) => {
  res.send("✅ Product Search Backend is Running!");
});

// =========================
// Product Search
// =========================
app.get("/search", async (req, res) => {
  try {
    console.log("Incoming request:", {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
    });

    const query = req.query.q || "*";
    const page = parseInt(req.query.page) || 1;

    const category = req.query.category;
    const store = req.query.store;
    const rating = req.query.rating;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    const searchParameters = {
      q: query,

      query_by:
        "title,store,main_category,categories,description,features",

      query_by_weights:
        "8,6,5,4,2,1",

      prefix: true,

      num_typos: 2,

      typo_tokens_threshold: 1,

      split_join_tokens: "always",

      prioritize_exact_match: true,

      per_page: 10,

      page: page,
    };

    // =========================
    // Sorting
    // =========================
    if (req.query.sort_by) {
      searchParameters.sort_by = req.query.sort_by;
    } else {
      searchParameters.sort_by = "_text_match:desc";
    }

    // =========================
    // Filters
    // =========================
    let filters = [];

    if (category) {
      filters.push(`main_category:=${category}`);
    }

    if (store) {
      filters.push(`store:=${store}`);
    }

    if (rating) {
      filters.push(`average_rating:>=${rating}`);
    }

    if (minPrice && maxPrice) {
      filters.push(`price:>=${minPrice} && price:<=${maxPrice}`);
    }

    if (filters.length > 0) {
      searchParameters.filter_by = filters.join(" && ");
    }

    console.log("Parsed query:", {
      query,
      page,
      category,
      store,
      rating,
      minPrice,
      maxPrice,
      searchParameters,
    });

    console.log("Typesense request:", searchParameters);

    const results = await client
      .collections("products")
      .documents()
      .search(searchParameters);

    console.log("Typesense response:", {
      found: results?.found,
      hits: results?.hits?.length || 0,
    });

    console.log("Final response returned to frontend:", {
      status: "success",
      query,
      hits: results?.hits?.length || 0,
    });

    res.json(results);

  } catch (error) {
    console.error("Search Error:", error);
    console.log("Final response returned to frontend:", {
      status: "error",
      message: error.message,
    });

    res.status(500).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
    });
  }
});

// =========================
// Autocomplete Suggestions
// =========================
app.get("/suggestions", async (req, res) => {
  try {
    const q = req.query.q || "";

    if (q.length < 2) {
      return res.json([]);
    }

    const results = await client
      .collections("products")
      .documents()
      .search({
        q,
        query_by: "title",
        prefix: true,
        per_page: 8,
        prioritize_exact_match: true,
        num_typos: 1,
      });

    const suggestions = Array.from(
      new Map(
        results.hits
          .map((item) => ({
            title: item?.document?.title || "",
            display_title: item?.document?.display_title || item?.document?.displayTitle || item?.document?.title || "",
          }))
          .filter((item) => item.title)
          .map((item) => [item.title, item])
      ).values()
    );

    res.json(suggestions);

  } catch (error) {
    console.error("Suggestion Error:", error);

    res.status(500).json([]);
  }
});

// =========================
// Start Server
// =========================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  verifyTypesenseConnection();
});