function Filters({
  sortBy,
  setSortBy,
  category,
  setCategory,
  store,
  setStore,
  rating,
  setRating,
  priceRange,
  setPriceRange,
  searchProducts,
  setPage,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "25px",
      }}
    >
      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={styles.select}
      >
        <option value="">Sort Results</option>
        <option value="price:asc">Price ↑</option>
        <option value="price:desc">Price ↓</option>
        <option value="average_rating:desc">Highest Rating</option>
      </select>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={styles.select}
      >
        <option value="">All Categories</option>
        <option value="AMAZON FASHION">Amazon Fashion</option>
        <option value="All Beauty">Beauty</option>
        <option value="Electronics">Electronics</option>
        <option value="Home & Kitchen">Home & Kitchen</option>
      </select>

      {/* Brand / Store */}
      <input
        type="text"
        placeholder="Brand / Store"
        value={store}
        onChange={(e) => setStore(e.target.value)}
        style={styles.input}
      />

      {/* Rating */}
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        style={styles.select}
      >
        <option value="">Any Rating</option>
        <option value="4">4★ & Above</option>
        <option value="3">3★ & Above</option>
        <option value="2">2★ & Above</option>
      </select>

      {/* Price */}
      <select
        value={priceRange}
        onChange={(e) => setPriceRange(e.target.value)}
        style={styles.select}
      >
        <option value="">Any Price</option>
        <option value="0-50">$0 - $50</option>
        <option value="50-100">$50 - $100</option>
        <option value="100-500">$100 - $500</option>
        <option value="500-100000">$500+</option>
      </select>

      {/* Apply */}
      <button
        onClick={() => {
          setPage(1);
          searchProducts(1);
        }}
        style={styles.button}
      >
        Apply Filters
      </button>
    </div>
  );
}

const styles = {
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    minWidth: "150px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    minWidth: "180px",
  },

  button: {
    padding: "10px 20px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Filters;