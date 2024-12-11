const logger = require("../logger/logger.js");

function onMessageCreate(client) {
  logger.info("Membuat penanganan ketika client menerima pesan dari kontak");

  client.on("message_crete", (message) => {
    if (message.body.includes("@c.us")) {
      logger.info(`${message.from}: ${message.body}`);
    }
  });
}

module.exports = { onMessageCreate };
