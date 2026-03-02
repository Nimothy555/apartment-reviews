const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const db = new sqlite3.Database(path.join(__dirname, 'rentwise.db'), (err) => {
  if (err) console.error('Database error:', err)
  else console.log('✅ Connected to SQLite database')
})

db.run('PRAGMA foreign_keys = ON')

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    price REAL NOT NULL,
    beds INTEGER,
    baths INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rating REAL NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    noise REAL,
    safety REAL,
    maintenance REAL,
    landlord REAL,
    apartment_id INTEGER REFERENCES apartments(id),
    user_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Seed sample data if database is empty
  db.get('SELECT COUNT(*) as count FROM apartments', (err, row) => {
    if (err || (row && row.count > 0)) return

    console.log('📦 Seeding sample data...')

    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      ['Demo User', 'demo@rentwise.com', '$2b$10$PLACEHOLDER_NOT_FOR_LOGIN'])

    const apts = [
      ['Sunny Heights', '412 Park Ave', 'Downtown', 2100, 2, 1],
      ['The Greenway', '88 Elm Street', 'Midtown', 1750, 1, 1],
      ['Riverside Lofts', '230 River Rd', 'Waterfront', 2650, 3, 2],
      ['Maple Court', '15 Maple Dr', 'Suburbs', 1400, 2, 1],
      ['Urban Nest', '501 5th Ave', 'Downtown', 1900, 1, 1],
    ]
    apts.forEach(a => {
      db.run('INSERT INTO apartments (name, address, neighborhood, price, beds, baths) VALUES (?, ?, ?, ?, ?, ?)', a)
    })

    const reviews = [
      [4.5, 'Great natural light', 'Loved the big windows and open floor plan. Neighborhood is walkable.', 3, 5, 4, 5, 1, 1],
      [3.0, 'Decent but noisy', 'Good location but street noise can be rough on weekends.', 2, 4, 3, 3, 1, 1],
      [5.0, 'Best apartment ever', 'Spacious, quiet, and the landlord is super responsive.', 5, 5, 5, 5, 3, 1],
      [4.0, 'Solid choice for the price', 'Nothing fancy but clean, well-maintained, and affordable.', 4, 4, 4, 4, 4, 1],
      [2.5, 'Maintenance is slow', 'Nice space but took 3 weeks to fix a leaky faucet.', 3, 4, 1, 2, 2, 1],
    ]
    reviews.forEach(r => {
      db.run('INSERT INTO reviews (rating, title, body, noise, safety, maintenance, landlord, apartment_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', r)
    })

    console.log('✅ Seeded 5 apartments, 5 reviews, and 1 demo user')
  })
})

// Promise wrappers for async/await usage in routes
db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

module.exports = db
