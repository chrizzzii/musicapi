const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class CollaborationsService {
    constructor(pool) {
        this._pool = pool;
    }

    async addCollaboration(playlistId, userId) {
        const id = `collab-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async deleteCollaboration(playlistId, userId) {
        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal dihapus');
        }
    }

    async verifyCollaborator(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi tidak ditemukan');
        }
    }
}

module.exports = CollaborationsService;
