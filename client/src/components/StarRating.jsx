export default function StarRating({ rating, size = 'md' }) {
  if (rating == null) return <span className="text-muted">No ratings yet</span>

  const stars = []
  const rounded = Math.round(rating * 2) / 2
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) stars.push('★')
    else if (i - 0.5 === rounded) stars.push('½')
    else stars.push('☆')
  }

  return (
    <span className={`star-rating star-${size}`} title={`${rating} out of 5`}>
      <span className="stars">{stars.join('')}</span>
      <span className="rating-num">{rating}</span>
    </span>
  )
}
