exports.up = pgm => {
    pgm.sql(`CREATE TABLE IF NOT EXISTS authentications (
        token TEXT NOT NULL
    );`);
};

exports.down = pgm => {
    pgm.sql('DROP TABLE IF EXISTS authentications CASCADE;');
};
