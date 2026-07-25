function SearchBar({
  query,
  setQuery,
  searchProducts,
  setPage,
  suggestions,
  setSuggestions,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              searchProducts(1);
            }
          }}
          style={{
            width: "450px",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />

        <button
          onClick={() => {
            setPage(1);
            searchProducts(1);
          }}
          style={{
            padding: "12px 20px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <div
          style={{
            width: "450px",
            margin: "0 auto 20px",
            background: "white",
            border: "1px solid #ddd",
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
    </>
  );
}

export default SearchBar;