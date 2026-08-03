import { formatProductDisplay } from "../utils/catalog";

function RecommendationCard({ item, onClick }) {
  const displayItem = formatProductDisplay(item);

  return (
    <button className="recommendation-card" type="button" onClick={onClick}>
      <div className="recommendation-card-body">
        <h4 className="recommendation-card-title" title={displayItem.displayTitle}>{displayItem.displayTitle}</h4>
        <p className="recommendation-card-brand">{item.brand || displayItem.displayBrand}</p>
        <p className="recommendation-card-meta">{item.reason}</p>
        <div className="recommendation-card-footer">
          <span className="recommendation-card-price">{item.price || "N/A"}</span>
          <span className="recommendation-card-rating">⭐ {item.rating ?? "N/A"}</span>
        </div>
      </div>
    </button>
  );
}

export default RecommendationCard;
