import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No reset token found. Please request a new password reset link.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const data = await api.resetPassword(token, password)
      setStatus('success')
      setMessage(data.message || 'Password reset successfully.')
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  if (status === 'success') {
    return (
      <div className="page">
        <div className="auth-container">
          <h1>Password reset!</h1>
          <div className="success-msg" style={{ marginTop: '0.75rem' }}>{message}</div>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" className="btn btn-full">Log In</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="auth-container">
        <h1>Set new password</h1>
        <p className="text-muted">Choose a strong password for your account.</p>

        {status === 'error' && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{message}</div>}

        {token && (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              New Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="input"
                placeholder="Repeat your password"
                required
                minLength={8}
              />
            </label>
            <button type="submit" className="btn btn-full" disabled={status === 'loading'}>
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  )
}
