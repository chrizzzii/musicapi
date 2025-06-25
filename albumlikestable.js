require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_album_likes (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      album_id TEXT NOT NULL,
      UNIQUE (user_id, album_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    );
  `;

  try {
    await pool.query(query);
    console.log('Tabel user_album_likes berhasil dibuat');
  } catch (error) {
    console.error('Gagal membuat tabel', error);
  } finally {
    await pool.end();
  }
};

createTable();
