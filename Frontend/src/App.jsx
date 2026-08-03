<<<<<<< HEAD
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import Filters from "./components/Filters";
import ProductCard from "./components/ProductCard";
import Pagination from "./components/Pagination";
import ProductModal from "./components/ProductModal";
import Footer from "./components/Footer";
=======
import "./App.css";
import { useCallback, useEffect, useMemo, useState } from "react";

import Filters from "./components/Filters";
import AIChatbot from "./components/AIChatbot";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import Pagination from "./components/Pagination";
import RecommendationSection from "./components/RecommendationSection";
import SearchBar from "./components/SearchBar";
import { buildSearchUrl, buildSuggestionsUrl, rankAndDedupeHits } from "./utils/catalog";
import { getSearchHistory, getViewedProducts, saveSearchHistory, saveViewedProduct } from "./utils/userBehavior";
import { buildPersonalizedRecommendations } from "./utils/personalizedRecommendations";

const PRODUCTS_PER_PAGE = 10;
>>>>>>> da3b864 (Add AI chatbot, recommendation system, and frontend improvements)

function App() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [totalFound, setTotalFound] = useState(0);
  const [category, setCategory] = useState("");
  const [store, setStore] = useState("");
  const [rating, setRating] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [displayQuery, setDisplayQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
  const [viewedProducts, setViewedProducts] = useState(() => getViewedProducts());
  const [suggestionQuery, setSuggestionQuery] = useState("");

<<<<<<< HEAD
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
=======
>>>>>>> da3b864 (Add AI chatbot, recommendation system, and frontend improvements)
  useEffect(() => {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      if (suggestionQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(buildSuggestionsUrl(suggestionQuery), { signal: controller.signal });
        const data = await response.json();

<<<<<<< HEAD
        setSuggestions(data);
=======
        setSuggestions(Array.isArray(data) ? data : []);
>>>>>>> da3b864 (Add AI chatbot, recommendation system, and frontend improvements)
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [suggestionQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSuggestionQuery(query);
      if (!query) {
        setDisplayQuery("");
      }
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

<<<<<<< HEAD
  // -------------------------
  // Search Products
  // -------------------------
  const searchProducts = async (currentPage = page) => {
    if (!query.trim()) return;
=======
  const searchProducts = useCallback(async (currentPage = page, searchTerm = query) => {
    if (!searchTerm.trim()) {
      return;
    }
>>>>>>> da3b864 (Add AI chatbot, recommendation system, and frontend improvements)

    setLoading(true);
    setSearched(true);
    setError("");
    setSuggestions([]);

    try {
<<<<<<< HEAD
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
=======
      const response = await fetch(buildSearchUrl({
        query: searchTerm,
        page: currentPage,
        sortBy,
        category,
        store,
        rating,
        priceRange,
      }));
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      setSearchHistory(saveSearchHistory(searchTerm, { category, sampleProduct: data.hits?.[0]?.document }));
      setProducts(rankAndDedupeHits(data.hits || [], searchTerm, sortBy));
>>>>>>> da3b864 (Add AI chatbot, recommendation system, and frontend improvements)
      setTotalFound(data.found || 0);
    } catch (err) {
      console.log(err);
      setProducts([]);
<<<<<<< HEAD
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
=======
      setTotalFound(0);
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  }, [category, page, priceRange, query, rating, sortBy, store]);

  useEffect(() => {
    if (searched) {
      const timeoutId = window.setTimeout(() => {
        searchProducts(page, query);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [page, query, searched, searchProducts]);

  const totalPages = Math.ceil(totalFound / PRODUCTS_PER_PAGE);

  const handleViewDetails = (document) => {
    setSelectedProduct(document);
    setViewedProducts(saveViewedProduct(document));
  };

  const recommendationItems = useMemo(() => buildPersonalizedRecommendations({
    products,
    searchHistory,
    viewedProducts,
    limit: 3,
  }), [products, searchHistory, viewedProducts]);

  return (
    <div className="app-shell">
      <main className="app-page">
        <header className="app-header">
          <div className="app-branding">
            <h1>Product Search System</h1>
          </div>

          <div className="app-search-wrap">
            <SearchBar
              query={query}
              displayQuery={displayQuery}
              setQuery={setQuery}
              setDisplayQuery={setDisplayQuery}
              searchProducts={searchProducts}
              setPage={setPage}
              suggestions={suggestions}
              setSuggestions={setSuggestions}
            />
          </div>
        </header>

        <div className="app-layout">
          <aside className="app-sidebar">
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

          <section className="results-panel">
            <div className="results-meta">
              {loading ? (
                <span>Searching...</span>
              ) : error ? (
                <span className="error-state">{error}</span>
              ) : searched && products.length === 0 ? (
                <span>No products found</span>
              ) : products.length > 0 ? (
                <span>
                  Showing {products.length} of {totalFound} products
                </span>
              ) : (
                <span>Start with a search to explore products.</span>
              )}
            </div>

            <div className="results-grid">
              {products.map((item) => (
                <ProductCard
                  key={item.document.id}
                  product={item}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          </section>
        </div>

        <section className="recommendations-stack" aria-label="Product recommendations">
          <RecommendationSection
            title="Recommended For You"
            subtitle="Personalized from recent searches and products you've viewed."
            items={recommendationItems.recommendedForYou}
            onItemClick={handleViewDetails}
          />
          <RecommendationSection
            title="Recently Viewed"
            subtitle="Stored locally for this session and ready to revisit."
            items={recommendationItems.recentlyViewed}
            onItemClick={handleViewDetails}
            emptyMessage="Recently viewed products will appear here."
          />
          <RecommendationSection
            title="Continue Shopping"
            subtitle="A few relevant picks based on your browsing patterns."
            items={recommendationItems.continueShopping}
            onItemClick={handleViewDetails}
            emptyMessage="Continue shopping suggestions will appear here."
          />
        </section>

        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />

        <AIChatbot
          catalogItems={products}
          currentQuery={query}
          searchHistory={searchHistory}
          viewedProducts={viewedProducts}
        />

        <Footer />
      </main>
>>>>>>> da3b864 (Add AI chatbot, recommendation system, and frontend improvements)
    </div>
  );
}

export default App;
