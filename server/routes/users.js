const express = require('express')
const router = express.Router()
const db = require('../db')

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Login required' })
  next()
}

// GET /users/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.getAsync('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.session.user.id])
    const reviews = await db.allAsync(`
      SELECT r.*, a.name as apartment_name, a.neighborhood
      FROM reviews r
      JOIN apartments a ON a.id = r.apartment_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.session.user.id])
    res.json({ ...user, reviews })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await db.getAsync('SELECT id, name, created_at FROM users WHERE id = ?', [req.params.id])
    if (!user) return res.status(404).json({ error: 'User not found' })

    const reviews = await db.allAsync(`
      SELECT r.*, a.name as apartment_name, a.neighborhood
      FROM reviews r
      JOIN apartments a ON a.id = r.apartment_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id])
    res.json({ ...user, reviews })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

module.exports = router
