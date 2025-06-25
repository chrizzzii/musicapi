exports.up = pgm => {
    pgm.sql(`CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        year INTEGER NOT NULL,
        performer TEXT NOT NULL,
        genre TEXT,
        duration INTEGER,
        album_id TEXT,
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
    );`);
};

exports.down = pgm => {
    pgm.sql('DROP TABLE IF EXISTS songs CASCADE;');
};
