const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const util = require('util');

const arr = JSON.parse(fs.readFileSync('./config.json'));

let from = '';
let to = '';

let counters = [];
const queue = [];
const queued = [...arr.map(() => 0)];

worker();
worker();
worker();
worker();
worker();
worker();
go();

async function go() {
  if (process.argv.length > 2) {
    let i = parseInt(process.argv[2]);
    const set = arr[i];
    await run(set, i);
  } else {
    for (const i in arr) {
      //Wait for queue before processing next file
      while (queue.length > 0) {
        await delay(500);
      }

      const set = arr[i];
      await run(set, i);
    }
  }

  while (queue.length > 0) {
    await delay(500);
  }

  console.log('Processed images: ' + queued);
  process.exit();
}

async function run(set, i) {
  const filer = fs.readFileSync(set[0]).toString().split('\n').filter(s => s.trim() !== '');
  from = set[1];
  to = set[2];
  const filename = set[0].split('\\').pop().split('/').pop().replace('.txt', '');
  console.log('Processing ' + filename);

  let j = 0;
  for (const file of filer) {
    counters[i] = `${++j}/${filer.length}`;

    process.stdout.write(counters[i] + '\r');
    while (queue.length >= 10) {
      await delay(500);
    }

    await convert(file, i)
  }
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function convert(file, num) {
  const sizes = [240, 1080];
  let buffer;

  for (const size of sizes) {
    const input = {
      size: size,
      quality: 80,
      outPath: "",
      mediaPath: file,
    }

    input.outPath = `${input.mediaPath}_${input.size}q${input.quality}.webp`
    input.outPath = input.outPath.replace(from, to)

    const outFolder = path.dirname(input.outPath);

    if (!fs.existsSync(outFolder)) {
      fs.mkdirSync(outFolder);
    }

    if (fs.existsSync(input.outPath)) continue;

    if (!buffer) {
      buffer = fs.readFileSync(file);
    }

    queue.push([input, buffer]);
    queued[num] = queued[num] + 1;
  }
}

async function worker() {
  while (true) {
    if (queue.length > 0) {
      const [input, buffer] = queue.shift();
      await resize(input, buffer);
    }
    else {
      await delay(500);
    }
  }
}

async function resize(input, buffer) {
  sharp.cache(false);

  const image = sharp(buffer, { failOnError: false });
  const metadata = await image.metadata();
  const kernel = sharp.kernel.lanczos3;

  if (metadata.height > metadata.width) {
    image.resize(Math.min(input.size, metadata.width), null, {
      kernel,
    });
  } else {
    image.resize(null, Math.min(input.size, metadata.height), {
      kernel,
    });
  }
  await image.rotate().webp({ effort: 6, quality: input.quality }).toFile(input.outPath);
}