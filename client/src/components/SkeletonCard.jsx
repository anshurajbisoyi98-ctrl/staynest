/**
 * SkeletonCard – a placeholder card shown while listings are loading.
 * Uses a pure-CSS shimmer animation (defined in styles.css as .skeleton-shimmer).
 * Matches the visual shape of ListingCard so the layout doesn't shift on load.
 */
export default function SkeletonCard() {
  return (
    <div className="card listing-card skeleton-card" aria-hidden="true">
      <div className="skeleton-img skeleton-shimmer" />
      <div className="card-body">
        <div className="row-between">
          <div className="skeleton-line skeleton-shimmer" style={{ width: '60px', height: '20px', borderRadius: '999px' }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '40px', height: '14px' }} />
        </div>
        <div className="skeleton-line skeleton-shimmer" style={{ width: '80%', height: '16px' }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '55%', height: '14px' }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '45%', height: '14px' }} />
      </div>
    </div>
  );
}
