function ProductCard({ product, onViewDetails }) {
  const {
    image,
    title,
    store,
    price,
    average_rating,
    description,
  } = product.document;

  return (
    <div style={styles.card}>
      <img
        src={image || "https://via.placeholder.com/250x220?text=No+Image"}
        alt={title}
        style={styles.image}
      />

      <div style={styles.content}>
        <h3 style={styles.title}>
          {title.length > 60 ? title.substring(0, 60) + "..." : title}
        </h3>

        <p style={styles.store}>
          🏪 <strong>{store || "Unknown Store"}</strong>
        </p>

        <p style={styles.price}>
          💲 {price ? `$${price}` : "Price Not Available"}
        </p>

        <div style={styles.rating}>
          ⭐ {average_rating || "N/A"}
        </div>

        <p style={styles.description}>
          {description
            ? description.substring(0, 100) + "..."
            : "No Description Available"}
        </p>

        <button
          style={styles.button}
          onClick={() => onViewDetails(product.document)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    transition: "0.3s",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "contain",
    background: "#fafafa",
    padding: "10px",
  },

  content: {
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },

  title: {
    fontSize: "17px",
    marginBottom: "10px",
    color: "#222",
    minHeight: "50px",
  },

  store: {
    color: "#1976d2",
    marginBottom: "8px",
  },

  price: {
    fontSize: "20px",
    color: "#2e7d32",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  rating: {
    background: "#FFD700",
    width: "80px",
    textAlign: "center",
    borderRadius: "20px",
    padding: "6px",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  description: {
    color: "#666",
    fontSize: "14px",
    flexGrow: 1,
    lineHeight: "1.5",
  },

  button: {
    marginTop: "15px",
    padding: "10px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
};

export default ProductCard;