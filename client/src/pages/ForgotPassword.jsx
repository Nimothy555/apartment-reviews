import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.forgotPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="auth-container">
          <h1>Check your inbox</h1>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            If <strong>{email}</strong> is registered, you'll receive a password reset link shortly. It expires in 1 hour.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" className="btn btn-outline btn-full">Back to Login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="auth-container">
        <h1>Forgot password?</h1>
        <p className="text-muted">Enter your email and we'll send you a reset link.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </label>
          <button type="submit" className="btn btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  )
}
