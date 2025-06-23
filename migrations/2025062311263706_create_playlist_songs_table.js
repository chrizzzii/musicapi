exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(`CREATE TABLE IF NOT EXISTS playlist_songs (
        id TEXT PRIMARY KEY,
        playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE
    );`);
};

exports.down = pgm => {
    pgm.sql('DROP TABLE IF EXISTS playlist_songs CASCADE;');
};
