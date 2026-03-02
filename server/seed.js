const db = require('./db')

const apartments = [
  ['Sunny Heights', '412 Park Ave', 'Downtown', 2100, 2, 1],
  ['The Greenway', '88 Elm Street', 'Midtown', 1750, 1, 1],
  ['Riverside Lofts', '230 River Rd', 'Waterfront', 2650, 3, 2],
  ['Maple Court', '15 Maple Dr', 'Suburbs', 1400, 2, 1],
  ['Urban Nest', '501 5th Ave', 'Downtown', 1900, 1, 1],
]

const reviews = [
  [4.5, 'Great natural light', 'Loved the big windows and open floor plan. Neighborhood is walkable.', 3, 5, 4, 5, 1],
  [3.0, 'Decent but noisy', 'Good location but street noise can be rough on weekends.', 2, 4, 3, 3, 1],
  [5.0, 'Best apartment ever', 'Spacious, quiet, and the landlord is super responsive.', 5, 5, 5, 5, 3],
  [4.0, 'Solid choice for the price', 'Nothing fancy but clean, well-maintained, and affordable.', 4, 4, 4, 4, 4],
  [2.5, 'Maintenance is slow', 'Nice space but took 3 weeks to fix a leaky faucet.', 3, 4, 1, 2, 2],
]

db.serialize(() => {
  // Check if already seeded
  db.get('SELECT COUNT(*) as count FROM apartments', (err, row) => {
    if (row && row.count > 0) {
      console.log('Database already has data — skipping seed.')
      return
    }

    console.log('Seeding database...')

    const insertApt = db.prepare(
      'INSERT INTO apartments (name, address, neighborhood, price, beds, baths) VALUES (?, ?, ?, ?, ?, ?)'
    )
    apartments.forEach(a => insertApt.run(...a))
    insertApt.finalize()

    // Insert a demo user with a placeholder password (register a real user via the API)
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Demo User', 'demo@rentwise.com', '$2b$10$PLACEHOLDER_NOT_FOR_LOGIN'],
      function (err) {
        if (err) {
          console.error('User seed error:', err)
          return
        }
        const userId = this.lastID

        const insertReview = db.prepare(
          'INSERT INTO reviews (rating, title, body, noise, safety, maintenance, landlord, apartment_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
        reviews.forEach(r => insertReview.run(...r, userId))
        insertReview.finalize(() => {
          console.log('Seeded 5 apartments, 1 user, and 5 reviews.')
        })
      }
    )
  })
})
