const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthenticationError');

class PlaylistSongsService {
    constructor(pool, songsService, playlistsService) {
        this._pool = pool;
        this._songsService = songsService;
        this._playlistsService = playlistsService;
    }

    async addSongToPlaylist(playlistId, songId, userId) {
        await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

        await this._songsService.getSongById(songId);

        const id = `playlistsong-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }
    }

    async getSongsFromPlaylist(playlistId, userId) {
        await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

        const playlistQuery = {
            text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        JOIN users ON playlists.owner = users.id
        WHERE playlists.id = $1
      `,
            values: [playlistId],
        };

        const songsQuery = {
            text: `
        SELECT songs.id, songs.title, songs.performer
        FROM songs
        JOIN playlist_songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1
      `,
            values: [playlistId],
        };

        const playlistResult = await this._pool.query(playlistQuery);
        const songsResult = await this._pool.query(songsQuery);

        if (!playlistResult.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = {
            ...playlistResult.rows[0],
            songs: songsResult.rows,
        };

        return playlist;
    }

    async deleteSongFromPlaylist(playlistId, songId, userId) {
        await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
        }
    }

    async getPlaylistActivities(playlistId, userId) {
        await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

        const query = {
            text: `
          SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
          FROM playlist_song_activities
          JOIN users ON users.id = playlist_song_activities.user_id
          JOIN songs ON songs.id = playlist_song_activities.song_id
          WHERE playlist_song_activities.playlist_id = $1
          ORDER BY playlist_song_activities.time ASC
        `,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        return result.rows.map((row) => ({
            username: row.username,
            title: row.title,
            action: row.action,
            time: row.time,
        }));
    }


}

module.exports = PlaylistSongsService;
