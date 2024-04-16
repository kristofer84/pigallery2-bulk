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
}
; (async () => {
  for await (const f of getFiles('/mnt/readynas/cloud/onedrive/Kristykke/Bilder/')) {
    const l = f.toLowerCase();
    if (l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.png')) {
      
     }
    else
      console.log(f);
  }
  // console.log('dine')
})()
