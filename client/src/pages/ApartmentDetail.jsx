import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'

function ReviewForm({ apartmentId, onSubmit }) {
  const [form, setForm] = useState({ rating: 5, title: '', body: '', noise: '', safety: '', maintenance: '', landlord: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = {
        rating: Number(form.rating),
        title: form.title,
        body: form.body,
        ...(form.noise && { noise: Number(form.noise) }),
        ...(form.safety && { safety: Number(form.safety) }),
        ...(form.maintenance && { maintenance: Number(form.maintenance) }),
        ...(form.landlord && { landlord: Number(form.landlord) }),
      }
      await api.createReview(apartmentId, data)
      setForm({ rating: 5, title: '', body: '', noise: '', safety: '', maintenance: '', landlord: '' })
      onSubmit()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Write a Review</h3>
      {error && <div className="error-msg">{error}</div>}

      <div className="form-row">
        <label>Overall Rating
          <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} className="input">
            {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map(n => (
              <option key={n} value={n}>{n} ★</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>Title
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="input" placeholder="Summarize your experience" required />
        </label>
      </div>

      <div className="form-row">
        <label>Review
          <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
            className="input" rows={4} placeholder="What was it like living here?" required />
        </label>
      </div>

      <div className="sub-ratings">
        {['noise', 'safety', 'maintenance', 'landlord'].map(field => (
          <label key={field}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
            <select value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} className="input">
              <option value="">—</option>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        ))}
      </div>

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

function ReviewCard({ review, apartmentId, currentUserId, onDelete }) {
  const isOwner = currentUserId === review.user_id

  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return
    try {
      await api.deleteReview(apartmentId, review.id)
      onDelete()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="review-card">
      <div className="review-header">
        <StarRating rating={review.rating} size="sm" />
        <span className="review-author">by {review.user_name}</span>
        <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
      </div>
      <h4>{review.title}</h4>
      <p>{review.body}</p>
      {(review.noise || review.safety || review.maintenance || review.landlord) && (
        <div className="sub-ratings-display">
          {review.noise && <span>Noise: {review.noise}/5</span>}
          {review.safety && <span>Safety: {review.safety}/5</span>}
          {review.maintenance && <span>Maintenance: {review.maintenance}/5</span>}
          {review.landlord && <span>Landlord: {review.landlord}/5</span>}
        </div>
      )}
      {isOwner && (
        <button onClick={handleDelete} className="btn-link danger">Delete my review</button>
      )}
    </div>
  )
}

export default function ApartmentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [apartment, setApartment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.getApartment(id)
      .then(data => setApartment(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>
  if (error) return <div className="page"><div className="error-msg">{error}</div></div>
  if (!apartment) return <div className="page"><div className="empty">Apartment not found</div></div>

  const hasReviewed = user && apartment.reviews?.some(r => r.user_id === user.id)

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to listings</Link>

      <div className="apartment-detail">
        <div className="detail-header">
          <div>
            <h1>{apartment.name}</h1>
            <p className="detail-address">{apartment.address}</p>
            <div className="detail-meta">
              <span className="badge">{apartment.neighborhood}</span>
              {apartment.beds && <span>{apartment.beds} bed{apartment.beds !== 1 ? 's' : ''}</span>}
              {apartment.baths && <span>{apartment.baths} bath{apartment.baths !== 1 ? 's' : ''}</span>}
            </div>
          </div>
          <div className="detail-price">
            <span className="price-big">${apartment.price.toLocaleString()}</span>
            <span className="price-label">/month</span>
          </div>
        </div>

        <div className="detail-rating">
          <StarRating rating={apartment.avg_rating} size="lg" />
          <span>({apartment.review_count} review{apartment.review_count !== 1 ? 's' : ''})</span>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews</h2>

        {user && !hasReviewed && (
          <ReviewForm apartmentId={apartment.id} onSubmit={load} />
        )}

        {!user && (
          <p className="text-muted"><Link to="/login">Log in</Link> to write a review.</p>
        )}

        {hasReviewed && (
          <p className="text-muted">You've already reviewed this apartment.</p>
        )}

        {apartment.reviews?.length === 0 ? (
          <p className="empty">No reviews yet. Be the first!</p>
        ) : (
          <div className="reviews-list">
            {apartment.reviews.map(r => (
              <ReviewCard
                key={r.id}
                review={r}
                apartmentId={apartment.id}
                currentUserId={user?.id}
                onDelete={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
