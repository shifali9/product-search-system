import { useState } from "react";
import { formatPrice, formatProductDisplay, formatRating, getProductImage } from "../utils/catalog";

function ProductCard({ product, onViewDetails }) {
  const displayProduct = formatProductDisplay(product.document);
  const normalizedImage = getProductImage(displayProduct);
  const {
    title,
    displayTitle,
    displayBrand,
    price,
    average_rating,
  } = displayProduct;
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <article
      className="product-card"
      role="button"
      tabIndex={0}
      onClick={() => onViewDetails(product.document)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewDetails(product.document);
        }
      }}
    >
      <img
        src={normalizedImage}
        alt={displayTitle}
        className={isImageLoaded ? "product-card-image loaded" : "product-card-image"}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsImageLoaded(true)}
      />

      <div className="product-card-content">
        <h3 className="product-card-title" title={title}>{displayTitle}</h3>

        <p className="product-card-brand">
          <strong>{displayBrand || "Unknown Brand"}</strong>
        </p>

        <p className="product-card-price">
          {formatPrice(price)}
        </p>

        <div className="product-card-rating">
          <span>⭐</span>
          <span>{formatRating(average_rating)}</span>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;