exports.up = pgm => {
    pgm.sql(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        fullname TEXT NOT NULL
    );`);
};

exports.down = pgm => {
    pgm.sql('DROP TABLE IF EXISTS users CASCADE;');
};
