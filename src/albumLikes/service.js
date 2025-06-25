const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumLikesService {
    constructor(pool, cacheService) {
        this._pool = pool;
        this._cacheService = cacheService;
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

    async likeAlbum(albumId, userId) {
        await this._verifyAlbumExists(albumId);

        const query = {
            text: 'INSERT INTO user_album_likes (user_id, album_id) VALUES ($1, $2)',
            values: [userId, albumId],
        };

        try {
            await this._pool.query(query);
            await this._cacheService.delete(`album-likes:${albumId}`);
        } catch (error) {
            throw new InvariantError('Anda sudah menyukai album ini');
        }
    }

    async unlikeAlbum(albumId, userId) {

        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        await this._pool.query(query);
        await this._cacheService.delete(`album-likes:${albumId}`);
    }

    async getAlbumLikes(albumId) {

        try {
            const result = await this._cacheService.get(`album-likes:${albumId}`);
            return {
                likes: JSON.parse(result),
                cache: true,
            };
        } catch (error) {
            const query = {
                text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };

            const result = await this._pool.query(query);
            const likes = parseInt(result.rows[0].count, 10);

            await this._cacheService.set(`album-likes:${albumId}`, JSON.stringify(likes));

            return {
                likes,
                cache: false,
            };
        }
    }
}

module.exports = AlbumLikesService;
