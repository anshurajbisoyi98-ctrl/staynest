import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import { formatDate } from '../utils/format.js';

export default function Reviews({ listingId, onReviewAdded }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  
  // For new review or editing an existing one
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get(`/listings/${listingId}/reviews`).then(({ data }) => setReviews(data));
  
  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/listings/${listingId}/reviews/${editingId}`, form);
      } else {
        await api.post(`/listings/${listingId}/reviews`, form);
      }
      setForm({ rating: 5, comment: '' });
      setEditingId(null);
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({ rating: r.rating, comment: r.comment });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ rating: 5, comment: '' });
    setError('');
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/listings/${listingId}/reviews/${id}`);
      if (editingId === id) cancelEdit();
      load();
      onReviewAdded?.();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const hasReviewed = user && reviews.some((r) => r.user?._id === user._id);

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>
      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      
      {reviews.map((r) => (
        <div key={r._id} className="review">
          <div className="row-between">
            <strong>{r.user?.name}</strong>
            <span className="muted small">{formatDate(r.createdAt)}</span>
          </div>
          <div className="stars-static">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
          <p>{r.comment}</p>
          {user && r.user?._id === user._id && (
            <div className="row" style={{ marginTop: '8px', gap: '8px' }}>
              <button className="btn btn-ghost small" onClick={() => startEdit(r)}>Edit</button>
              <button className="btn btn-ghost small error" onClick={() => deleteReview(r._id)}>Delete</button>
            </div>
          )}
        </div>
      ))}

      {user && (!hasReviewed || editingId) && (
        <form className="card form" style={{ marginTop: '20px' }} onSubmit={submit}>
          <h3>{editingId ? 'Edit your review' : 'Write a review'}</h3>
          <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          <textarea
            required
            placeholder="How was your stay?"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button className="btn">{editingId ? 'Update' : 'Submit review'}</button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
