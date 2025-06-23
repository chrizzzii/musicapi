class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);

        const { name } = request.payload;
        const { id: owner } = request.auth.credentials;

        const playlistId = await this._service.addPlaylist(name, owner);

        const response = h.response({
            status: 'success',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request) {
        const { id: owner } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(owner);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request) {
        const { id } = request.params;
        const { id: owner } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(id, owner);
        await this._service.deletePlaylistById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }
}

module.exports = PlaylistsHandler;
