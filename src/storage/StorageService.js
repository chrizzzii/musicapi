const path = require('path');
const fs = require('fs');

class StorageService {
    constructor(folder) {
        this._folder = folder;

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
    }

    writeFile(file, meta) {
        const filename = +new Date() + '-' + meta.filename;
        const pathFile = path.resolve(this._folder, filename);

        const fileStream = fs.createWriteStream(pathFile);

        return new Promise((resolve, reject) => {
            fileStream.on('error', (error) => reject(error));
            file.pipe(fileStream);
            file.on('end', () => resolve(filename));
        });
    }
}

module.exports = StorageService;
