class UploadsHandler {
    constructor(service, albumsService, validator) {
        this._service = service;
        this._albumsService = albumsService;
        this._validator = validator;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
    }

    async postUploadImageHandler(request, h) {
        const { cover } = request.payload;
        const { id } = request.params;

        if (!cover) {
            throw new InvariantError('Gagal upload. File tidak ditemukan');
        }

        this._validator.validateImageHeaders(cover.hapi.headers);

        const filename = await this._service.writeFile(cover, cover.hapi);
        await this._albumsService.updateAlbumCover(id, filename);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }
}

module.exports = UploadsHandler;
