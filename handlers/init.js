const { db } = require('../handlers/db.js');
const config = require('../config.json');
const { v4: uuidv4 } = require('uuid');
const CatLoggr = require('cat-loggr');
const log = new CatLoggr();

async function init() {
    const overvoid = await db.get('overvooid_instance');
    if (!overvoid) {
        log.init('this is probably your first time starting overvoid, welcome!');
        log.init('you can find documentation for the panel at overvoid.xyz');

        let imageCheck = await db.get('images');
        if (!imageCheck) {
            log.error('before starting overvoid for the first time, you didn\'t run the seed command!');
            log.error('please run: npm run seed');
            log.error('if you didn\'t do it already, make a user for yourself: npm run createUser');
            process.exit();
        }

        let overvoidId = uuidv4();
        let setupTime = Date.now();
        
        let info = {
            overvoidId: overvoidId,
            setupTime: setupTime,
            originalVersion: config.version
        }

        await db.set('overvoid_instance', info)
        log.info('initialized overvoid panel with id: ' + overvoidId)
    }        

    log.info('init complete!')
}

module.exports = { init }