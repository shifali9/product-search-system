function Pagination({
  page,
  totalPages,
  setPage,
}) {
  if (totalPages <= 1) return null;

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.button,
          background: page === 1 ? "#ccc" : "#1976d2",
        }}
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
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
                ...styles.pageButton,
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
        style={{
          ...styles.button,
          background:
            page === totalPages
              ? "#ccc"
              : "#1976d2",
        }}
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next ▶
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "30px",
    flexWrap: "wrap",
  },

  button: {
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  pageButton: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Pagination;