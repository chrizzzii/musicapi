const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };

        const result = await this._pool.query(query);
        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const albumQuery = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };
        const albumResult = await this._pool.query(albumQuery);

        if (!albumResult.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const songsQuery = {
            text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
            values: [id],
        };
        const songsResult = await this._pool.query(songsQuery);

        const album = albumResult.rows[0];

        if (album.cover) {
            album.coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${album.cover}`;
        } else {
            album.coverUrl = null;
        }

        delete album.cover;

        return {
            ...album,
            songs: songsResult.rows,
        };
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        return result.rows[0].id;
    }


    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
        return result.rows[0].id;
    }

    async getSongsByAlbumId(albumId) {
        const query = {
            text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
            values: [albumId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async updateAlbumCover(albumId, filename) {
        const query = {
            text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
            values: [filename, albumId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui cover. Id tidak ditemukan');
        }
        return result.rows[0].id;
    }
}

module.exports = AlbumsService;
