import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function AddApartment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', address: '', neighborhood: '', price: '', beds: '', baths: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    navigate('/login')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = {
        name: form.name,
        address: form.address,
        neighborhood: form.neighborhood,
        price: Number(form.price),
        ...(form.beds && { beds: Number(form.beds) }),
        ...(form.baths && { baths: Number(form.baths) }),
      }
      const result = await api.createApartment(data)
      navigate(`/apartments/${result.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="page">
      <div className="auth-container">
        <h1>Add a Listing</h1>
        <p className="text-muted">Share an apartment for others to review.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Apartment Name
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
              className="input" placeholder="e.g. Sunny Heights" required />
          </label>
          <label>
            Address
            <input type="text" value={form.address} onChange={e => update('address', e.target.value)}
              className="input" placeholder="e.g. 412 Park Ave" required />
          </label>
          <label>
            Neighborhood
            <input type="text" value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)}
              className="input" placeholder="e.g. Downtown" required />
          </label>
          <label>
            Monthly Rent ($)
            <input type="number" value={form.price} onChange={e => update('price', e.target.value)}
              className="input" placeholder="e.g. 1500" required min="1" />
          </label>
          <div className="form-row-inline">
            <label>
              Beds
              <input type="number" value={form.beds} onChange={e => update('beds', e.target.value)}
                className="input" placeholder="—" min="0" max="20" />
            </label>
            <label>
              Baths
              <input type="number" value={form.baths} onChange={e => update('baths', e.target.value)}
                className="input" placeholder="—" min="0" max="20" />
            </label>
          </div>
          <button type="submit" className="btn btn-full" disabled={loading}>
            {loading ? 'Creating...' : 'Add Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
