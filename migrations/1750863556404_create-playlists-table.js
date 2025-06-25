exports.up = pgm => {
    pgm.sql(`CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );`);
};

exports.down = pgm => {
    pgm.sql('DROP TABLE IF EXISTS playlists CASCADE;');
};
