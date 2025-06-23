import { Client } from 'pg';

async function createPlaylistsTable() {
    const client = new Client({
        user: 'developer',
        host: 'localhost',
        database: 'musicdb',
        password: 'supersecretpassword',
        port: 5432,
    });
    await client.connect();

    const query = `
    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
  `;

    try {
        await client.query(query);
        console.log('Table "playlists" berhasil dibuat (atau sudah ada).');
    } catch (err) {
        console.error('Error membuat tabel:', err);
    } finally {
        await client.end();
    }
}

createPlaylistsTable();
