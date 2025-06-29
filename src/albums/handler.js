const NotFoundError = require('../exceptions/NotFoundError')

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);

        const { name, year } = request.payload;
        const albumId = await this._service.addAlbum({ name, year });

        return h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            },
        }).code(201);
    }

    async getAlbumByIdHandler(request, h) {
        const { id } = request.params;

        const album = await this._service.getAlbumById(id);
        const songs = await this._service.getSongsByAlbumId(id);

        return {
            status: 'success',
            data: {
                album: {
                    ...album,
                    songs,
                    coverUrl: album.coverUrl ?? null,
                },
            },
        };
    }


    async putAlbumByIdHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._service.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }


    async deleteAlbumByIdHandler(request, h) {
        const { id } = request.params;

        await this._service.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }

}

module.exports = AlbumsHandler;
