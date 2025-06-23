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
    CREATE TABLE IF NOT EXISTS collaborations (
      id TEXT PRIMARY KEY,
      playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
  `;

    try {
        await client.query(query);
        console.log('Table "collaborations" berhasil dibuat (atau sudah ada).');
    } catch (err) {
        console.error('Error membuat tabel:', err);
    } finally {
        await client.end();
    }
}

createPlaylistsTable();
