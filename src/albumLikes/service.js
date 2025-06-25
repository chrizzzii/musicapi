const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumLikesService {
    constructor() {
        this._pool = new Pool();
    }

    async likeAlbum(albumId, userId) {
        await this._verifyAlbumExists(albumId);

        const queryCheck = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };
        const resultCheck = await this._pool.query(queryCheck);

        if (resultCheck.rowCount > 0) {
            throw new InvariantError('Anda sudah menyukai album ini');
        }

        const query = {
            text: 'INSERT INTO user_album_likes (user_id, album_id) VALUES ($1, $2)',
            values: [userId, albumId],
        };
        await this._pool.query(query);
    }

    async unlikeAlbum(albumId, userId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        await this._pool.query(query);
    }

    async getAlbumLikes(albumId) {
        await this._verifyAlbumExists(albumId);

        const query = {
            text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
            values: [albumId],
        };

        const result = await this._pool.query(query);
        return parseInt(result.rows[0].count, 10);
    }

    async _verifyAlbumExists(albumId) {
        const query = {
            text: 'SELECT id FROM albums WHERE id = $1',
            values: [albumId],
        };
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }
    }
}

module.exports = AlbumLikesService;
    