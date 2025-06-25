const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{id}/covers',
        handler: handler.postUploadImageHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 512000,
                output: 'stream',
                parse: true,
            },
        },

    },
];

module.exports = routes;
