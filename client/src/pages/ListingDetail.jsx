import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import BookingBox from '../components/BookingBox.jsx';
import Reviews from '../components/Reviews.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  const [activeImg, setActiveImg] = useState(0);

  const load = () =>
    api
      .get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!listing) return <Loader />;

  return (
    <section>
      <h1>{listing.title}</h1>
      <p className="muted">
        {listing.reviewCount > 0 ? `★ ${listing.avgRating} · ${listing.reviewCount} reviews · ` : ''}
        {listing.city}, {listing.state}
      </p>

      <div className="gallery" style={{ marginBottom: '24px' }}>
        <img className="hero-img" src={listing.images[activeImg]} alt={listing.title} style={{ marginBottom: '12px' }} />
        {listing.images.length > 1 && (
          <div className="thumbnails row" style={{ overflowX: 'auto', gap: '10px' }}>
            {listing.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Thumbnail ${i + 1}`}
                onClick={() => setActiveImg(i)}
                style={{
                  width: '100px',
                  height: '75px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: i === activeImg ? '2px solid var(--primary)' : '2px solid transparent',
                  opacity: i === activeImg ? 1 : 0.6,
                  transition: '0.2s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="detail-layout">
        <div>
          <h2>
            {listing.type} hosted by {listing.host?.name}
          </h2>
          <p className="muted">
            Up to {listing.maxGuests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
          </p>
          <p>{listing.description}</p>

          <h3>Amenities</h3>
          <ul className="amenities">
            {listing.amenities.map((a) => <li key={a}>✓ {a}</li>)}
          </ul>

          <h3>Location</h3>
          <p className="muted">{listing.address}, {listing.city}</p>
          {/* TODO: show a map (Leaflet + OpenStreetMap) - see issue tracker */}

          <Reviews listingId={listing._id} onReviewAdded={load} />
        </div>
        <BookingBox listing={listing} />
      </div>
    </section>
  );
}
