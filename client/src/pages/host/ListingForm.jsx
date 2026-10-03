import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  imageUrl: '',
};

/** Return an object with field-level error strings (empty string = valid). */
function validate(form) {
  const errs = {};

  const title = form.title.trim();
  if (title.length < 10) errs.title = 'Title must be at least 10 characters.';
  else if (title.length > 100) errs.title = 'Title must be 100 characters or fewer.';

  if (form.description.trim().length < 30)
    errs.description = 'Description must be at least 30 characters.';

  const price = Number(form.pricePerNight);
  if (!form.pricePerNight || price <= 0)
    errs.pricePerNight = 'Price per night must be greater than 0.';

  if (form.imageUrl.trim()) {
    try {
      new URL(form.imageUrl.trim());
    } catch {
      errs.imageUrl = 'Image URL must be a valid URL (e.g. https://…).';
    }
  }

  return errs;
}

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: data.amenities.join(', '),
        imageUrl: data.images[0] || '',
      })
    );
  }, [id, isEdit]);

  const set = (key) => (e) => {
    const updated = { ...form, [key]: e.target.value };
    setForm(updated);
    // Re-validate that field on every change so errors clear immediately.
    const errs = validate(updated);
    setFieldErrors((prev) => ({ ...prev, [key]: errs[key] || '' }));
  };

  const hasErrors = Object.values(validate(form)).some(Boolean);

  // TODO: replace the image URL field with real image upload (Cloudinary / multer).
  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.values(errs).some(Boolean)) {
      setFieldErrors(errs);
      return;
    }
    setError('');
    const { title, description, type, city, state, address, imageUrl, amenities } = form;
    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    if (imageUrl) payload.images = [imageUrl];
    try {
      if (isEdit) await api.put(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>

      <input required placeholder="Title (10–100 chars)" value={form.title} onChange={set('title')} />
      {fieldErrors.title && <p className="error small">{fieldErrors.title}</p>}

      <textarea required placeholder="Describe your place (at least 30 chars)" value={form.description} onChange={set('description')} />
      {fieldErrors.description && <p className="error small">{fieldErrors.description}</p>}

      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="grow">
          <input required type="number" min="0" placeholder="Price per night (₹)" value={form.pricePerNight} onChange={set('pricePerNight')} />
          {fieldErrors.pricePerNight && <p className="error small">{fieldErrors.pricePerNight}</p>}
        </div>
      </div>

      <div className="row">
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="State" value={form.state} onChange={set('state')} />
      </div>
      <input required placeholder="Address" value={form.address} onChange={set('address')} />

      <div className="row">
        <label className="grow">Max guests
          <input type="number" min="1" value={form.maxGuests} onChange={set('maxGuests')} />
        </label>
        <label className="grow">Bedrooms
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
        </label>
      </div>

      <input placeholder="Amenities (comma separated: WiFi, AC, Parking)" value={form.amenities} onChange={set('amenities')} />

      <div>
        <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={set('imageUrl')} />
        {fieldErrors.imageUrl && <p className="error small">{fieldErrors.imageUrl}</p>}
      </div>

      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={hasErrors}>
        {isEdit ? 'Save changes' : 'Publish listing'}
      </button>
      {hasErrors && <p className="muted small">Please fix the errors above before submitting.</p>}
    </form>
  );
}
