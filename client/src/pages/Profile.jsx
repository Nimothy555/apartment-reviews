import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import StarRating from '../components/StarRating'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    api.getMyProfile()
      .then(data => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>
  if (!profile) return null

  return (
    <div className="page">
      <h1>My Profile</h1>
      <div className="profile-info">
        <h2>{profile.name}</h2>
        <p className="text-muted">{profile.email}</p>
        <p className="text-muted">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
      </div>

      <h2>My Reviews ({profile.reviews.length})</h2>

      {profile.reviews.length === 0 ? (
        <p className="empty">You haven't written any reviews yet. <Link to="/">Browse apartments</Link> to get started.</p>
      ) : (
        <div className="reviews-list">
          {profile.reviews.map(r => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <StarRating rating={r.rating} size="sm" />
                <Link to={`/apartments/${r.apartment_id}`} className="review-apt-link">
                  {r.apartment_name} — {r.neighborhood}
                </Link>
              </div>
              <h4>{r.title}</h4>
              <p>{r.body}</p>
              <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
