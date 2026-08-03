import { useEffect, useRef } from "react";
import { cleanProductTitle, getProductDisplayTitle } from "../utils/catalog";

function getSuggestionTitle(item) {
  if (item && typeof item === "object") {
    return item.title || item.name || item.display_title || item.displayTitle || "";
  }

  return String(item || "");
}

function getSuggestionDisplayTitle(item) {
  if (item && typeof item === "object") {
    return getProductDisplayTitle(item);
  }

  return cleanProductTitle(item);
}

function SearchBar({
  query,
  displayQuery,
  setQuery,
  setDisplayQuery,
  searchProducts,
  setPage,
  suggestions,
  setSuggestions,
}) {
  const searchWrapRef = useRef(null);

  useEffect(() => {
    const handleDocumentMouseDown = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => document.removeEventListener("mousedown", handleDocumentMouseDown);
  }, [setSuggestions]);

  const handleSearch = () => {
    setPage(1);
    setSuggestions([]);
    searchProducts(1);
  };

  const handleSuggestionSelect = (item) => {
    const originalTitle = getSuggestionTitle(item);
    const displayTitle = getSuggestionDisplayTitle(item);

    setQuery(originalTitle);
    setDisplayQuery(displayTitle);
    setSuggestions([]);
    setPage(1);
    setTimeout(() => searchProducts(1), 0);
  };

  return (
<<<<<<< HEAD
    <div className="ps-search-wrap">
      <div className="ps-search-row">
        <input
          className="ps-search-input"
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
        />

        <button
          className="ps-search-btn"
          onClick={() => {
            setPage(1);
            searchProducts(1);
          }}
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="ps-suggestions">
          {suggestions.map((item, index) => (
            <button
              key={index}
              className="ps-suggestion-item"
              onClick={() => {
                setQuery(item);
                setSuggestions([]);
                setPage(1);
                setTimeout(() => searchProducts(1), 100);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
=======
    <>
      <div className="search-bar-shell" ref={searchWrapRef}>
        <div className="search-bar-row">
          <div className="search-bar-field">
            <input
              type="text"
              placeholder="Search products..."
              value={displayQuery || query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDisplayQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="search-bar-input"
            />

            {suggestions.length > 0 && (
              <div className="search-suggestions" role="listbox">
                {suggestions.map((item, index) => (
                  <button
                    key={`${getSuggestionTitle(item) || getSuggestionDisplayTitle(item) || index}-${index}`}
                    type="button"
                    className="search-suggestion-item"
                    title={getSuggestionDisplayTitle(item)}
                    onClick={() => handleSuggestionSelect(item)}
                  >
                    <span className="search-suggestion-text">{getSuggestionDisplayTitle(item)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="search-bar-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </>
>>>>>>> da3b864 (Add AI chatbot, recommendation system, and frontend improvements)
  );
}

export default SearchBar;
