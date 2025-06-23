const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError')

class PlaylistsService {
    constructor(pool) {
        this._pool = pool;
    }

    async addPlaylist(name, owner) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        JOIN users ON playlists.owner = users.id
        WHERE playlists.owner = $1
      `,
            values: [owner],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async verifyPlaylistOwner(playlistId, userId) {
        const query = {
            text: 'SELECT owner FROM playlists WHERE id = $1',
            values: [playlistId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];
        if (playlist.owner !== userId) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    setCollaborationService(collaborationService) {
        this._collaborationService = collaborationService;
    }

}

module.exports = PlaylistsService;
