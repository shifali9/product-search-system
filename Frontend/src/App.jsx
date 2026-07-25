import "./App.css";
import { useState, useEffect } from "react";

import ProductModal from "./components/ProductModal";

function App() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("");

  const [page, setPage] = useState(1);
  const [totalFound, setTotalFound] = useState(0);

  // Filters
  const [category, setCategory] = useState("");
  const [store, setStore] = useState("");
  const [rating, setRating] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const PRODUCTS_PER_PAGE = 10;

  // -------------------------
  // Fetch Suggestions
  // -------------------------
  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/suggestions?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        setSuggestions(data);

      } catch (err) {
        console.log(err);
      }
    };

    loadSuggestions();
  }, [query]);

  // -------------------------
  // Search Products
  // -------------------------
  const searchProducts = async (currentPage = page) => {

    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setError("");

    try {

      let url =
        `http://localhost:3000/search?q=${encodeURIComponent(query)}&page=${currentPage}`;

      if (sortBy) {
        url += `&sort_by=${encodeURIComponent(sortBy)}`;
      }

      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      if (store) {
        url += `&store=${encodeURIComponent(store)}`;
      }

      if (rating) {
        url += `&rating=${rating}`;
      }

      if (priceRange) {

        const [min, max] = priceRange.split("-");

        url += `&minPrice=${min}&maxPrice=${max}`;
      }

      const response = await fetch(url);

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message);

      }

      setProducts(data.hits || []);

      setTotalFound(data.found || 0);

    } catch (err) {

      console.log(err);

      setProducts([]);

      setError("Cannot connect to backend.");

    }

    setLoading(false);

  };

  useEffect(() => {

    if (searched) {

      searchProducts(page);

    }

  }, [page, sortBy]);

  const totalPages =
    Math.ceil(totalFound / PRODUCTS_PER_PAGE);
      return (
    <div
      style={{
        background: "#f4f6f8",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <h1
        style={{
          textAlign: "center",
          color: "#1565c0",
          marginBottom: "5px",
        }}
      >
        🛒 Product Search System
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#555",
          marginBottom: "30px",
        }}
      >
        Search Products using Typesense + React + Node.js
      </p>

      {/* Search Box */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              searchProducts(1);
            }
          }}
          style={{
            width: "420px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <button
          onClick={() => {
            setPage(1);
            searchProducts(1);
          }}
          style={{
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          🔍 Search
        </button>
      </div>

      {/* Autocomplete */}
      {suggestions.length > 0 && (
        <div
          style={{
            width: "420px",
            margin: "10px auto 20px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {suggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setQuery(item);
                setSuggestions([]);
                setPage(1);
                setTimeout(() => searchProducts(1), 100);
              }}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort</option>
          <option value="price:asc">Price ↑</option>
          <option value="price:desc">Price ↓</option>
          <option value="average_rating:desc">
            Highest Rating
          </option>
        </select>

        <input
          placeholder="Brand / Store"
          value={store}
          onChange={(e) => setStore(e.target.value)}
        />

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">Rating</option>
          <option value="4">4★ & Above</option>
          <option value="3">3★ & Above</option>
          <option value="2">2★ & Above</option>
        </select>

        <select
          value={priceRange}
          onChange={(e) =>
            setPriceRange(e.target.value)
          }
        >
          <option value="">Price</option>
          <option value="0-50">$0 - $50</option>
          <option value="50-100">$50 - $100</option>
          <option value="100-500">$100 - $500</option>
          <option value="500-100000">$500+</option>
        </select>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option value="">Category</option>
          <option value="AMAZON FASHION">
            Amazon Fashion
          </option>
          <option value="All Beauty">
            Beauty
          </option>
          <option value="Electronics">
            Electronics
          </option>
          <option value="Home & Kitchen">
            Home & Kitchen
          </option>
        </select>

        <button
          onClick={() => {
            setPage(1);
            searchProducts(1);
          }}
        >
          Apply Filters
        </button>
      </div>

      {loading && (
        <h3 style={{ textAlign: "center" }}>
          Searching...
        </h3>
      )}

      {error && (
        <h3
          style={{
            color: "red",
            textAlign: "center",
          }}
        >
          {error}
        </h3>
      )}

      {!loading &&
        searched &&
        !error &&
        products.length === 0 && (
          <h3 style={{ textAlign: "center" }}>
            No Products Found
          </h3>
        )}

      {!loading &&
        products.length > 0 && (
          <h3
            style={{
              textAlign: "center",
            }}
          >
            Showing {products.length} of{" "}
            {totalFound} products
          </h3>
        )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(280px,1fr))",
          gap: "20px",
        }}
      >
        {products.map((item) => (
          <div
            key={item.document.id}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "15px",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src={item.document.image}
              alt={item.document.title}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "contain",
              }}
            />

            <h3>{item.document.title}</h3>

            <p>
              <b>Store:</b>{" "}
              {item.document.store}
            </p>

            <p>
              <b>Price:</b> $
              {item.document.price}
            </p>

            <p>
              <b>Rating:</b> ⭐
              {item.document.average_rating}
            </p>

            <p
              style={{
                color: "#666",
              }}
            >
              {item.document.description?.substring(
                0,
                120
              )}
              ...
            </p>
            <button
              onClick={() => setSelectedProduct(item.document)}
              style={{
              width: "100%",
              marginTop: "10px",
              padding: "10px",
              background: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
>
  View Details
</button>
                      </div>
        ))}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: page === 1 ? "#ccc" : "#1976d2",
              color: "white",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            ◀ Previous
          </button>

          {Array.from(
            { length: Math.min(totalPages, 5) },
            (_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    background:
                      page === pageNumber
                        ? "#1976d2"
                        : "#e0e0e0",
                    color:
                      page === pageNumber
                        ? "white"
                        : "black",
                  }}
                >
                  {pageNumber}
                </button>
              );
            }
          )}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background:
                page === totalPages
                  ? "#ccc"
                  : "#1976d2",
              color: "white",
              cursor:
                page === totalPages
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Next ▶
          </button>
        </div>
      )}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          color: "#666",
          fontSize: "14px",
        }}
      >
        Developed using React • Node.js • Typesense
      </div>
    </div>
  );
}

export default App;