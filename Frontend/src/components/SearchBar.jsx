function SearchBar({
  query,
  setQuery,
  searchProducts,
  setPage,
  suggestions,
  setSuggestions,
}) {
  return (
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
  );
}

export default SearchBar;
