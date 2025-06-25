const InvariantError = require('../../exceptions/InvariantError');

const UploadsValidator = {
    validateImageHeaders: (headers) => {
        const contentType = headers['content-type'];

        if (!contentType.startsWith('image/')) {
            throw new InvariantError('Berkas yang dimuat bukan gambar');
        }
    },
};

module.exports = UploadsValidator;
