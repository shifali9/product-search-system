function Navbar() {
  return (
    <nav
      style={{
        background: "#1976d2",
        color: "white",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "10px",
        marginBottom: "30px",
      }}
    >
      <h2 style={{ margin: 0 }}>🛒 Product Search System</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <span>Home</span>
        <span>Products</span>
        <span>About</span>
      </div>
    </nav>
  );
}

export default Navbar;