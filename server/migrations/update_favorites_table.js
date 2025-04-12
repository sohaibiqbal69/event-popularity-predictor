const { db } = require('../config/database');

async function updateFavoritesTable() {
  try {
    // Drop the existing foreign key constraint if it exists
    await db.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 
          FROM information_schema.table_constraints 
          WHERE constraint_name = 'favorites_event_id_fkey'
        ) THEN
          ALTER TABLE favorites DROP CONSTRAINT favorites_event_id_fkey;
        END IF;
      END $$;
    `);

    // Rename event_id column to ticketmaster_id and change its type
    await db.query(`
      ALTER TABLE favorites 
      RENAME COLUMN event_id TO ticketmaster_id;
      
      ALTER TABLE favorites 
      ALTER COLUMN ticketmaster_id TYPE VARCHAR(255);
    `);

    // Add unique constraint for user_id and ticketmaster_id
    await db.query(`
      ALTER TABLE favorites 
      ADD CONSTRAINT unique_user_ticketmaster_favorite 
      UNIQUE (user_id, ticketmaster_id);
    `);
    
    console.log('Favorites table updated successfully');
  } catch (error) {
    console.error('Error updating favorites table:', error);
  } finally {
    // Close the database connection
    await db.end();
  }
}

updateFavoritesTable(); 