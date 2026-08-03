import RecommendationCard from "./RecommendationCard";

function RecommendationSection({ title, subtitle, items = [], emptyMessage = "No recommendations yet.", onItemClick }) {
  return (
    <section className="recommendation-section">
      <div className="recommendation-section-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>

      <div className="recommendation-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <RecommendationCard key={item.id} item={item} onClick={() => onItemClick?.(item.document || item)} />
          ))
        ) : (
          <div className="recommendation-empty">{emptyMessage}</div>
        )}
      </div>
    </section>
  );
}

export default RecommendationSection;
