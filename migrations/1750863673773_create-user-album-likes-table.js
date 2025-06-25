exports.up = (pgm) => {
    pgm.createTable('user_album_likes', {
        id: 'id',
        user_id: {
            type: 'TEXT',
            notNull: true,
            references: '"users"',
            onDelete: 'cascade',
        },
        album_id: {
            type: 'TEXT',
            notNull: true,
            references: '"albums"',
            onDelete: 'cascade',
        },
    });

    pgm.addConstraint('user_album_likes', 'unique_user_album', {
        unique: ['user_id', 'album_id'],
    });
};

exports.down = (pgm) => {
    pgm.dropTable('user_album_likes');
};
