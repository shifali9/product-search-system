function Pagination({
  page,
  totalPages,
  setPage,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-bar">
      <button
        className="pagination-button"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>

      <div className="pagination-pills">
        {Array.from(
          { length: Math.min(totalPages, 5) },
          (_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={page === pageNumber ? "pagination-pill active" : "pagination-pill"}
              >
                {pageNumber}
              </button>
            );
          }
        )}
      </div>

      <button
        className="pagination-button"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;