const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'playlist_songs',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new PlaylistSongsHandler(service, validator);
        server.route(routes(handler));
    },
};
