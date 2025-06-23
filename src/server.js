require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { Pool } = require('pg');

// Plugin albums & songs
const albums = require('./albums');
const songs = require('./songs');
const playlists = require('./playlists');
const playlistSongs = require('./playlistSongs');

// Services & Validators
const AlbumsService = require('./albums/service');
const AlbumsValidator = require('./albums/validator');
const SongsService = require('./songs/service');
const SongsValidator = require('./songs/validator');
const PlaylistsService = require('./playlists/service');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistSongsService = require('./playlistSongs/service');
const PlaylistSongsValidator = require('./validator/playlistSongs');

// Exceptions
const ClientError = require('./exceptions/ClientError');
const AuthorizationError = require('./exceptions/AuthorizationError');
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
    const playlistsService = new PlaylistsService(pool);
    const playlistSongsService = new PlaylistSongsService(pool, songsService, playlistsService);

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
                // 🔥 Custom handling error code
                const statusCode = response instanceof AuthorizationError ? 403 :
                    response instanceof NotFoundError ? 404 :
                        response instanceof InvariantError ? 400 : 400;

                return h.response({
                    status: 'fail',
                    message: response.message,
                }).code(statusCode);
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


    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
