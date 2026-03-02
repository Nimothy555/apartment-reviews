const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../db')

// Simple in-memory rate limiter
const loginAttempts = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 10

function checkRateLimit(key) {
  const now = Date.now()
  const record = loginAttempts.get(key)
  if (!record) return true
  // Clean up expired entries
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.delete(key)
    return true
  }
  return record.count < MAX_ATTEMPTS
}

function recordAttempt(key) {
  const now = Date.now()
  const record = loginAttempts.get(key)
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(key, { count: 1, firstAttempt: now })
  } else {
    record.count++
  }
}

function clearAttempts(key) {
  loginAttempts.delete(key)
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  const errors = []
  if (!name || typeof name !== 'string' || name.trim().length === 0) errors.push('Name is required')
  if (name && name.trim().length > 100) errors.push('Name must be under 100 characters')
  if (!email || !isValidEmail(email)) errors.push('A valid email is required')
  if (!password) errors.push('Password is required')
  if (password && password.length < 8) errors.push('Password must be at least 8 characters')
  if (password && password.length > 128) errors.push('Password must be under 128 characters')

  if (errors.length > 0) return res.status(400).json({ errors })

  const ip = req.ip || 'unknown'
  if (!checkRateLimit(`register:${ip}`)) {
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' })
  }
  recordAttempt(`register:${ip}`)

  try {
    const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()])
    if (existing) return res.status(409).json({ error: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 10)
    const result = await db.runAsync('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashed])

    req.session.user = { id: result.lastID, name: name.trim(), email: email.toLowerCase().trim() }
    res.status(201).json({ message: 'Account created', user: { id: result.lastID, name: name.trim() } })
  } catch (err) {
    res.status(500).json({ error: 'Failed to register' })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' })

  const ip = req.ip || 'unknown'
  if (!checkRateLimit(`login:${ip}`)) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' })
  }
  recordAttempt(`login:${ip}`)

  try {
    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()])
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid email or password' })

    // Successful login — clear rate limit
    clearAttempts(`login:${ip}`)

    req.session.user = { id: user.id, name: user.name, email: user.email }
    res.json({ message: 'Logged in', user: { id: user.id, name: user.name } })
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' })
  }
})

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }))
})

// GET /auth/me
router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' })
  res.json({ user: req.session.user })
})

// PUT /auth/password
router.put('/password', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Login required' })

  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Current password and new password required' })
  if (newPassword.length < 8)
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  if (newPassword.length > 128)
    return res.status(400).json({ error: 'New password must be under 128 characters' })

  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.session.user.id])
    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await db.runAsync('UPDATE users SET password = ? WHERE id = ?', [hashed, req.session.user.id])
    res.json({ message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' })
  }
})

module.exports = router
