import { cleanProductDescription, formatPrice, formatProductDisplay, formatRating, getProductImage } from "../utils/catalog";

function ProductModal({ product, onClose }) {
  if (!product) return null;
  const displayProduct = formatProductDisplay(product);

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>

        <button
          className="product-modal-close"
          onClick={onClose}
        >
          ✖
        </button>

        <img
          src={getProductImage(displayProduct)}
          alt={displayProduct.displayTitle}
          className="product-modal-image"
          loading="lazy"
          decoding="async"
          onLoad={(event) => event.currentTarget.classList.add("loaded")}
        />

        <h2 className="product-modal-title">{displayProduct.displayTitle}</h2>

        <div className="product-modal-meta">
          <p><strong>Brand:</strong> {displayProduct.displayBrand || "Unknown Brand"}</p>
          <p><strong>Price:</strong> {formatPrice(product.price)}</p>
          <p><strong>Rating:</strong> {formatRating(product.average_rating)}</p>
          <p><strong>Category:</strong> {product.main_category || "N/A"}</p>
        </div>

        <h3 className="product-modal-section-title">Description</h3>

        <p className="product-modal-description">
          {cleanProductDescription(product.description, 120)}
        </p>

      </div>
    </div>
  );
}

export default ProductModal;