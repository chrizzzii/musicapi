require('dotenv').config();
const path = require('path');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { Pool } = require('pg');

// Plugin albums & songs
const albums = require('./albums');
const songs = require('./songs');
const playlists = require('./playlists');
const playlistSongs = require('./playlistSongs');
const collaborations = require('./collaborations');
const ExportsPlugin = require('./exports');
const UploadsPlugin = require('./uploads');
const AlbumLikesPlugin = require('./albumLikes');

// Services & Validators
const AlbumsService = require('./albums/service');
const AlbumsValidator = require('./albums/validator');
const SongsService = require('./songs/service');
const SongsValidator = require('./songs/validator');
const PlaylistsService = require('./playlists/service');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistSongsService = require('./playlistSongs/service');
const PlaylistSongsValidator = require('./validator/playlistSongs');
const CollaborationsService = require('./collaborations/service');
const CollaborationsValidator = require('./validator/collaborations');
const ExportsValidator = require('./exports/validator');
const ProducerService = require('./exports/service');
const StorageService = require('./storage/StorageService');
const UploadsValidator = require('./validator/uploads');
const AlbumLikesService = require('./albumLikes/service');

// Exceptions
const ClientError = require('./exceptions/ClientError');
const AuthorizationError = require('./exceptions/AuthorizationError');
const AuthenticationError = require('./exceptions/AuthenticationError');
const NotFoundError = require('./exceptions/NotFoundError');
const InvariantError = require('./exceptions/InvariantError');

// Auth
const UsersService = require('./users/service');
const AuthenticationsService = require('./authentications/service');
const UsersValidator = require('./users/validator');
const AuthenticationsValidator = require('./authentications/validator');
const TokenManager = require('./tokenize/TokenManager');


// Auth handlers & routes
const UsersHandler = require('./users/handler');
const AuthenticationsHandler = require('./authentications/handler');
const usersRoutes = require('./users/routes');
const authenticationsRoutes = require('./authentications/routes');

const init = async () => {
    const pool = new Pool();

    const songsService = new SongsService();
    const albumsService = new AlbumsService();
    const usersService = new UsersService(pool);
    const authenticationsService = new AuthenticationsService(pool);
    const collaborationsService = new CollaborationsService(pool);
    const playlistsService = new PlaylistsService(pool);
    playlistsService.setCollaborationService(collaborationsService);
    const playlistSongsService = new PlaylistSongsService(pool, songsService, playlistsService);
    const producerService = new ProducerService();
    const storageService = new StorageService(path.resolve(__dirname, 'uploads'));
    const albumLikesService = new AlbumLikesService();


    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: process.env.HOST || 'localhost',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([Jwt]);

    // JWT Strategy
    server.auth.strategy('musicapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    // Register plugin albums & songs
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
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator,
            },
        },
        {
            plugin: playlistSongs,
            options: {
                service: playlistSongsService,
                validator: PlaylistSongsValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                service: collaborationsService,
                playlistsService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: ExportsPlugin,
            options: {
                service: producerService,
                playlistsService,
                validator: ExportsValidator,
            },
        },
        {
            plugin: UploadsPlugin,
            options: {
                service: storageService,
                albumsService,
                validator: UploadsValidator,
            },
        },
        {
            plugin: AlbumLikesPlugin,
            options: {
                service: albumLikesService,
            },
        },
    ]);

    // Register routes for users & authentications (non-plugin)
    server.route(usersRoutes(new UsersHandler(usersService, UsersValidator)));
    server.route(
        authenticationsRoutes(
            new AuthenticationsHandler(
                authenticationsService,
                usersService,
                TokenManager,
                AuthenticationsValidator,
            ),
        ),
    );

    // Global error handling
    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            if (response instanceof ClientError) {
                const statusCode =
                    response instanceof AuthenticationError ? 401 :
                        response instanceof AuthorizationError ? 403 :
                            response instanceof NotFoundError ? 404 :
                                response instanceof InvariantError ? 400 : 400;


                return h.response({
                    status: 'fail',
                    message: response.message,
                }).code(statusCode);
            }

            if (response.output?.statusCode === 413) {
                return h.response({
                    status: 'fail',
                    message: 'Payload content terlalu besar',
                }).code(413);
            }

            if (response.output?.statusCode === 415) {
                return h.response({
                    status: 'fail',
                    message: 'Tipe konten tidak didukung',
                }).code(415);
            }


            if (response.output?.statusCode === 404) {
                return h.response({
                    status: 'fail',
                    message: 'Halaman tidak ditemukan',
                }).code(404);
            }

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


    await server.register(require('@hapi/inert'));

    server.route({
        method: 'GET',
        path: '/upload/images/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'uploads'),
            },
        },
    });


    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
