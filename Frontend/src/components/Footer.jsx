function Footer() {
  return (
    <footer style={styles.footer}>
      <h3>🛒 Product Search System</h3>

      <p>
        Built with <strong>React</strong> • <strong>Node.js</strong> •{" "}
        <strong>Typesense</strong>
      </p>

      <p>Amazon Product Dataset (117,000+ Products)</p>

      <hr style={{ margin: "15px 0" }} />

      <p style={{ fontSize: "14px", color: "#ddd" }}>
        © 2026 Product Search System. All Rights Reserved.
      </p>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#1976d2",
    color: "white",
    textAlign: "center",
    padding: "30px",
    marginTop: "50px",
    borderRadius: "10px",
  },
};

export default Footer;