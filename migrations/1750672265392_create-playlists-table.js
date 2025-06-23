// migrations/xxxxx-create-playlists.js
exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: { type: 'text', primaryKey: true },
    name: { type: 'text', notNull: true },
    owner: { type: 'text', notNull: true },
  });
  pgm.addConstraint('playlists', 'fk_playlists_owner', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};
exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
