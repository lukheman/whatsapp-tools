const logger = require("../logger/logger.js");
const { sleep, saveStatus } = require("./utils.js");

const sendMessage = async (client, message, targets) => {
  logger.debug("initialize client");
  try {
    // Initialize client first
    await client.initialize();
    logger.debug("Client initialized successfully");
    await sleep(1000);

    let status = {
      failed: [],
      success: [],
    };

    for (const target of targets) {
      try {
        await client.sendMessage(`${target}@c.us`, message);
        logger.info(`Berhasil mengirim pesan ke: ${target}`);
        await sleep(2000);
        status.success.push(target);
      } catch (err) {
        logger.error(`Gagal mengirim pesan ke: ${target}`);
        status.failed.push(target);
        // throw err;
        // Continue with next target even if current one fails
      }
    }

    saveStatus(status);

    return status;
  } catch (err) {
    logger.error({ err }, "Error during client initialization");
    throw err;
  } finally {
    // Ensure client is always destroyed properly
    try {
      await client.destroy();
      logger.debug("Client destroyed successfully");
    } catch (destroyErr) {
      logger.error({ destroyErr }, "Error destroying client");
    }
  }
};

const chatLogFrom = async (client, phone_number, limit) => {
  logger.debug("Initializing client");

  try {
    await client.initialize();
    logger.debug("menunggu client siap untuk digunakan");

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Client ready timeout after 30 seconds"));
      }, 30000);

      client.once("ready", () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    logger.info("Client siap mendapatkan pesan");

    const chatId = `${phone_number}@c.us`;

    const chat = await client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit });

    logger.info(`Retrieved ${messages.length} messages from ${phone_number}`);

    let index = 0;
    for (const msg of messages) {
      index++;
      logger.info(`${index}: ${msg.body}`);
    }
    return messages;
  } catch (err) {
    logger.error(`Failed to fetch messages from ${phone_number}`);
    throw err; // Re-throw to allow caller to handle error
  } finally {
    // Cleanup
    try {
      await client.destroy();
      logger.debug("Client destroyed successfully");
    } catch (destroyErr) {
      logger.error("Error destroying client");
    }
  }
};

module.exports = { sendMessage, chatLogFrom };
