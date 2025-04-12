const { db } = require('../models/db');

async function createFavoritesTable() {
  try {
    // Create favorites table
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ticketmaster_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, ticketmaster_id)
      );
    `);
    
    console.log('Favorites table created successfully');
  } catch (error) {
    console.error('Error creating favorites table:', error);
  } finally {
    // Close the database connection
    await db.end();
  }
}

createFavoritesTable(); 