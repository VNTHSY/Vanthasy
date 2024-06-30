const { db } = require('../handlers/db.js');
const config = require('../config.json');
const { v4: uuidv4 } = require('uuid');
const CatLoggr = require('cat-loggr');
const log = new CatLoggr();

async function init() {
    const vanthasy = await db.get('Vanthasy_instance');
    if (!vanthasy) {
        log.init('this is probably your first time starting Vanthasy, welcome!');
        log.init('you can find documentation for the panel at Vanthasy.dev');

        let imageCheck = await db.get('images');
        if (!imageCheck) {
            log.error('before starting vanthasy for the first time, you didn\'t run the seed command!');
            log.error('please run: npm run seed');
            log.error('if you didn\'t do it already, make a user for yourself: npm run createUser');
            process.exit();
        }

        let VanthasyId = uuidv4();
        let setupTime = Date.now();
        
        let info = {
            VanthasyId: VanthasyId,
            setupTime: setupTime,
            originalVersion: config.version
        }

        await db.set('Vanthasy_instance', info)
        log.info('initialized vanthasy panel with id: ' + VanthasyId)
    }        

    log.info('init complete!')
}

module.exports = { init }