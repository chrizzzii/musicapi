const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'collaborations',
    version: '1.0.0',
    register: async (server, { collaborationsService, playlistsService, validator }) => {
        const handler = new CollaborationsHandler(collaborationsService, playlistsService, validator);
        server.route(routes(handler));
    },
};
