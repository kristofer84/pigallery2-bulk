const { resolve } = require('path');
const { readdir } = require('fs').promises;

async function* getFiles(dir) {

    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
};

exports.list = async function list(dir) {
    const files = [];
    for await (const f of getFiles(dir)) {
        const l = f.toLowerCase();
        if (l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.png')) {
            files.push(f)
        }
    }

    return files;
}
