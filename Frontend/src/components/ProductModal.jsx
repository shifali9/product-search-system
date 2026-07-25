function ProductModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <button
          style={styles.closeButton}
          onClick={onClose}
        >
          ✖
        </button>

        <img
          src={product.image}
          alt={product.title}
          style={styles.image}
        />

        <h2>{product.title}</h2>

        <p>
          <strong>🏪 Store:</strong> {product.store}
        </p>

        <p>
          <strong>💲 Price:</strong> ${product.price}
        </p>

        <p>
          <strong>⭐ Rating:</strong> {product.average_rating}
        </p>

        <p>
          <strong>📂 Category:</strong> {product.main_category}
        </p>

        <hr />

        <h3>Description</h3>

        <p style={{ lineHeight: "1.7" }}>
          {product.description || "No description available."}
        </p>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    background: "white",
    width: "700px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "12px",
    padding: "25px",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "300px",
    objectFit: "contain",
    marginBottom: "20px",
  },

  closeButton: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default ProductModal;