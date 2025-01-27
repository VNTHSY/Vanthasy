const { db } = require("../handlers/db.js");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");
const CatLoggr = require("cat-loggr");
const log = new CatLoggr();

async function init() {
  const Overvoid = await db.get("Overvoid_instance");
  if (!Overvoid) {
    log.init("this is probably your first time starting Overvoid, welcome!");
    log.init("you can find documentation for the panel at Overvoid.dev");

    let imageCheck = await db.get("images");
    if (!imageCheck) {
      log.error(
        "before starting Overvoid for the first time, you didn't run the seed command!"
      );
      log.error("please run: npm run seed");
      log.error(
        "if you didn't do it already, make a user for yourself: npm run createUser"
      );
      process.exit();
    }

    let OvervoidId = uuidv4();
    let setupTime = Date.now();

    let info = {
      OvervoidId: OvervoidId,
      setupTime: setupTime,
      originalVersion: config.version,
    };

    await db.set("Overvoid_instance", info);
    log.info("initialized Overvoid panel with id: " + OvervoidId);
  }

  log.info("init complete!");
}

module.exports = { init };
