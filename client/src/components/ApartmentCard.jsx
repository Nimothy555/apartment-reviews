import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function ApartmentCard({ apartment }) {
  const { id, name, address, neighborhood, price, beds, baths, avg_rating, review_count } = apartment

  return (
    <Link to={`/apartments/${id}`} className="apartment-card">
      <div className="card-header">
        <h3>{name}</h3>
        <span className="price">${price.toLocaleString()}/mo</span>
      </div>
      <p className="card-address">{address}</p>
      <div className="card-details">
        <span className="badge">{neighborhood}</span>
        {beds && <span>{beds} bed{beds !== 1 ? 's' : ''}</span>}
        {baths && <span>{baths} bath{baths !== 1 ? 's' : ''}</span>}
      </div>
      <div className="card-footer">
        <StarRating rating={avg_rating} size="sm" />
        <span className="review-count">{review_count} review{review_count !== 1 ? 's' : ''}</span>
      </div>
    </Link>
  )
}
