import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';
import { STAY_TYPES } from '../utils/format.js';

const initial = { city: '', type: '', guests: '', maxPrice: '' };
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top rated' },
];
const PAGE_SIZE = 12;

export default function Home() {
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = (params, sortVal, pageVal) => {
    setLoading(true);
    setError('');
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    api
      .get('/listings', { params: { ...clean, sort: sortVal, page: pageVal, limit: PAGE_SIZE } })
      .then(({ data }) => {
        setListings(data.listings);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search(initial, sort, page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setPage(1);
    search(filters, sort, 1);
  };

  const handleSort = (e) => {
    const s = e.target.value;
    setSort(s);
    setPage(1);
    search(filters, s, 1);
  };

  const goToPage = (p) => {
    setPage(p);
    search(filters, sort, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your next nest.</h1>
        <p className="muted">Homestays, havelis, villas and hostels across India.</p>
        <form className="search-bar card" onSubmit={submit}>
          <input placeholder="Where to? (e.g. Jaipur)" value={filters.city} onChange={set('city')} />
          <select value={filters.type} onChange={set('type')}>
            <option value="">Any type</option>
            {STAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" min="1" placeholder="Guests" value={filters.guests} onChange={set('guests')} />
          <input type="number" min="0" placeholder="Max ₹/night" value={filters.maxPrice} onChange={set('maxPrice')} />
          <button className="btn">Search</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Sort dropdown + result count */}
      {!loading && (
        <div className="row-between" style={{ marginBottom: '16px' }}>
          <span className="muted small">{total} stay{total !== 1 ? 's' : ''} found</span>
          <label className="row" style={{ gap: '8px', margin: 0 }}>
            <span className="muted small">Sort:</span>
            <select value={sort} onChange={handleSort} style={{ width: 'auto' }}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="muted">No stays match your search.</p>
      ) : (
        <div className="grid">
          {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      )}

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="pagination row" style={{ justifyContent: 'center', gap: '6px', marginTop: '32px' }}>
          <button
            className="btn btn-ghost"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`btn ${p === page ? '' : 'btn-ghost'}`}
              onClick={() => goToPage(p)}
              style={{ minWidth: '40px' }}
            >
              {p}
            </button>
          ))}
          <button
            className="btn btn-ghost"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
