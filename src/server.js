require('dotenv').config();
const Hapi = require('@hapi/hapi');

const albums = require('./albums'); // plugin albums
const songs = require('./songs'); // plugin songs
const AlbumsService = require('./albums/service');
const AlbumsValidator = require('./albums/validator');
const SongsService = require('./songs/service');
const SongsValidator = require('./songs/validator');
const ClientError = require('./exceptions/ClientError');


const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: process.env.HOST || 'localhost',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    const songsService = new SongsService();
    const albumsService = new AlbumsService();

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            // Client Error
            if (response instanceof ClientError) {
                return h.response({
                    status: 'fail',
                    message: response.message,
                }).code(response.statusCode);
            }

            // Not Found
            if (response.output?.statusCode === 404) {
                return h.response({
                    status: 'fail',
                    message: 'Halaman tidak ditemukan',
                }).code(404);
            }

            // Server Error
            if (!response.isServer) {
                return h.continue;
            }

            console.error(response);
            return h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            }).code(500);
        }

        return h.continue;
    });





    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
