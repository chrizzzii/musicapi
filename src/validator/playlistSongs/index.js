const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistSongPayloadSchema } = require('./schema');

const PlaylistSongsValidator = {
    validatePlaylistSongPayload: (payload) => {
        const result = PlaylistSongPayloadSchema.validate(payload);
        if (result.error) {
            throw new InvariantError(result.error.message);
        }
    },
};

module.exports = PlaylistSongsValidator;
