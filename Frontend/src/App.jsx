import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import Filters from "./components/Filters";
import ProductCard from "./components/ProductCard";
import Pagination from "./components/Pagination";
import ProductModal from "./components/ProductModal";
import Footer from "./components/Footer";

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

  // Theme
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("ps-theme") !== "light"
  );

  const PRODUCTS_PER_PAGE = 10;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("ps-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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

  const totalPages = Math.ceil(totalFound / PRODUCTS_PER_PAGE);

  return (
    <div className="ps-app">
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((v) => !v)} />

      <div className="ps-header-block">
        <h1 className="ps-title">Product Search Pro</h1>
        <p className="ps-subtitle">Fast e-commerce discovery powered by Typesense</p>
      </div>

      <SearchBar
        query={query}
        setQuery={setQuery}
        searchProducts={searchProducts}
        setPage={setPage}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
      />

      <main className="ps-main">
        <aside className="ps-sidebar">
          <h3>Refine Results</h3>
          <Filters
            sortBy={sortBy}
            setSortBy={setSortBy}
            category={category}
            setCategory={setCategory}
            store={store}
            setStore={setStore}
            rating={rating}
            setRating={setRating}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            searchProducts={searchProducts}
            setPage={setPage}
          />
        </aside>

        <section className="ps-content">
          <div className="ps-results-toolbar">
            {loading && <h3>Searching...</h3>}

            {!loading && error && <h3 className="ps-error">{error}</h3>}

            {!loading && searched && !error && products.length === 0 && (
              <h3>No Products Found</h3>
            )}

            {!loading && products.length > 0 && (
              <h3>
                Showing {products.length} of {totalFound} products
              </h3>
            )}
          </div>

          <div className="ps-grid">
            {products.map((item) => (
              <ProductCard
                key={item.document.id}
                product={item}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </section>
      </main>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <Footer />
    </div>
  );
}

export default App;
