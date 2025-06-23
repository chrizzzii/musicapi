const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: handler.postSongToPlaylistHandler,
        options: {
            auth: 'musicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{id}/songs',
        handler: handler.getSongsFromPlaylistHandler,
        options: {
            auth: 'musicapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}/songs',
        handler: handler.deleteSongFromPlaylistHandler,
        options: {
            auth: 'musicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{id}/activities',
        handler: handler.getPlaylistActivitiesHandler,
        options: {
            auth: 'musicapp_jwt',
        },
    },
];

module.exports = routes;
