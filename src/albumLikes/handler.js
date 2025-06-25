class AlbumLikesHandler {
    constructor(service) {
        this._service = service;

        this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
        this.deleteAlbumLikeHandler = this.deleteAlbumLikeHandler.bind(this);
        this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
    }

    async postAlbumLikeHandler(request, h) {
        const { id: userId } = request.auth.credentials;
        const { id: albumId } = request.params;

        await this._service.likeAlbum(albumId, userId);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil disukai',
        });
        response.code(201);
        return response;
    }

    async deleteAlbumLikeHandler(request) {
        const { id: userId } = request.auth.credentials;
        const { id: albumId } = request.params;

        await this._service.unlikeAlbum(albumId, userId);

        return {
            status: 'success',
            message: 'Batal menyukai album',
        };
    }

    async getAlbumLikesHandler(request, h) {
        const { id: albumId } = request.params;

        const { likes, cache } = await this._service.getAlbumLikes(albumId);

        const response = h.response({
            status: 'success',
            data: {
                likes,
            },
        });

        if (cache) {
            response.header('X-Data-Source', 'cache');
        }

        return response;
    }

}

module.exports = AlbumLikesHandler;
