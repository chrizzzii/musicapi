class PlaylistSongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
        this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
    }

    async postSongToPlaylistHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { id: userId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        await this._service.addSongToPlaylist(playlistId, songId, userId);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        });
        response.code(201);
        return response;
    }

    async getSongsFromPlaylistHandler(request) {
        const { id: userId } = request.auth.credentials;
        const { id: playlistId } = request.params;

        const playlist = await this._service.getSongsFromPlaylist(playlistId, userId);

        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deleteSongFromPlaylistHandler(request) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { id: userId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        await this._service.deleteSongFromPlaylist(playlistId, songId, userId);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }
}

module.exports = PlaylistSongsHandler;
