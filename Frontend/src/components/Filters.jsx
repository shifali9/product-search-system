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
    <div className="filters-sidebar">
      <div className="filters-section">
        <h3 className="filters-heading">Filters</h3>

        <label className="filters-label">
          Sort Results
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-control"
          >
            <option value="">Sort Results</option>
            <option value="price:asc">Price ↑</option>
            <option value="price:desc">Price ↓</option>
            <option value="average_rating:desc">Highest Rating</option>
          </select>
        </label>

        <label className="filters-label">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="filter-control"
          >
            <option value="">All Categories</option>
            <option value="AMAZON FASHION">Amazon Fashion</option>
            <option value="All Beauty">Beauty</option>
            <option value="Electronics">Electronics</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
          </select>
        </label>

        <label className="filters-label">
          Brand / Store
          <input
            type="text"
            placeholder="Brand / Store"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="filter-control"
          />
        </label>

        <label className="filters-label">
          Rating
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="filter-control"
          >
            <option value="">Any Rating</option>
            <option value="4">4★ & Above</option>
            <option value="3">3★ & Above</option>
            <option value="2">2★ & Above</option>
          </select>
        </label>

        <label className="filters-label">
          Price
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="filter-control"
          >
            <option value="">Any Price</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500-100000">$500+</option>
          </select>
        </label>

        <div className="filters-actions">
          <button
            type="button"
            onClick={() => {
              setPage(1);
              searchProducts(1);
            }}
            className="filter-apply-button"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default Filters;