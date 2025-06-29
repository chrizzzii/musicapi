exports.up = pgm => {
    pgm.sql(`CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cover_url TEXT, 
        year INTEGER NOT NULL
    );`);
};

exports.down = pgm => {
    pgm.sql('DROP TABLE IF EXISTS albums CASCADE;');
};
