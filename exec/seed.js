const axios = require('axios');
const { db } = require('../handlers/db');
const CatLoggr = require('cat-loggr');
const log = new CatLoggr();
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function seed() {
  try {
    // check if there are any images already in the database
  const existingImages = await db.get('images');
  if (existingImages && existingImages.length > 0) {
    rl.question('\'images\' is already set in the database. Do you want to continue seeding? (y/n) ', async (answer) => {
      if (answer.toLowerCase() !== 'y') {
        log.info('seeding aborted by the user.');
        rl.close();
        process.exit(0);
      } else {
        await performSeeding();
        rl.close();
      }
    });
  } else {
    await performSeeding();
    rl.close();
  }
} catch (error) {
  log.error('failed during seeding process: ${error}');
  rl.close();
  }
}

async function performSeeding() {
  try {
    const imagesIndexResponse = await axios.get('https://raw.githubusercontent.com/OvervoidLabs/images/main/images.json');
    const imagesUrls = imagesIndexResponse.data;
    let imagesDataArray = [];

    for (let url of imagesUrls) {
      log.init('fetching image data...');
      try {
        const imageDataResponse = await axios.get(url);
        let imageData = imageDataResponse.data;
        imageData.Id = uuidv4();

        log.init('seeding: ' + imageData.Name);
        imagesDataArray.push(imageData);
      } catch (error) {
        log.error('failed to fetch image data from: ${url}: ${error}');
      }
    }

    if (imagesDataArray.lenght > 0) {
      await db.set('images', imagesDataArray);
      log.info('seeding completed successfully.');
    } else {
      log.info('no new images to seed');
    }
  } catch (error) {
    log.error('failed to fetch image URLs or store image data: ${error}');
  }
}

seed();

process.on('exit', (code) => {
  log.info('exiting...');
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('unhandled rejection at: ', promise, 'reason:', reason);
  process.exit(1);
});