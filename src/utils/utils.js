const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const prompt = require("prompt-sync")();
const qrcode = require("qrcode-terminal");
const logger = require("./../logger/logger.js");

function generateClientsObject() {
  const sessions = fs.readdirSync("./session/");

  const clients = {};

  for (const sesi of sessions) {
    clients[sesi] = new Client({
      authStrategy: new LocalAuth({ dataPath: "./session/" + sesi }),
    });
  }

  return clients;
}

// fungsi ini digunakan untuk memilih client yang akan digunakan
// jika Client tidak ada maka buat client baru
// fungsi mengembaikan object Client
async function clientLogin(phone_number) {
  if (phone_number == undefined) {
    const sessions = fs.readdirSync("./session/");

    if (sessions.length <= 0) {
      console.log(
        "[!] Anda belum memiliki akun yang terhubung, silahkan tambahkan akun dulu",
      );
      return false;
    }

    for (const [i, sesi] of sessions.entries()) {
      console.log(`${i + 1}. ${sesi}`);
    }

    let session = prompt("Pilih sesi: ");
    let nomor = "";

    nomor = sessions[session - 1];

    if (nomor == undefined) {
      // TODO: tulis pesan kesalahan di sini
      return false;
    }

    logger.debug("Membuat object client untuk nomor ", nomor);
    const client = new Client({
      authStrategy: new LocalAuth({ dataPath: "./session/" + nomor }),
    });

    return client;
  } else {
    const client = new Client({
      authStrategy: new LocalAuth({ dataPath: "./session/" + phone_number }),
    });

    client.on("qr", async (qr) => {
      logger.info("Generate qr code untuk nomor " + phone_number);
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      logger.info("client siap digunakan untuk nomor " + phone_number);
      return client;
    });

    client.initialize();
  }
}

async function sendMessage(client, message, targets) {
  logger.debug("initialize client");

  try {
    // Initialize client first
    await client.initialize();
    logger.debug("Client initialized successfully");

    // Process each target sequentially
    for (const target of targets) {
      try {
        await sleep(2000);
        await client.sendMessage(`${target}@c.us`, message);
        logger.info(`Berhasil mengirim pesan ke: ${target}`);
      } catch (err) {
        logger.error({ err }, `Gagal mengirim pesan ke: ${target}`);
        // Continue with next target even if current one fails
      }
    }
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
}

async function getChatLog(client, phone_number, limit) {
  logger.debug("Initializing client");

  try {
    await client.initialize();
    logger.debug("menunggu client siap untuk digunakan");

    await new Promise((resolve, rejects) => {
      const timeout = setTimeout(() => {
        rejects(new Error("Client ready timeout after 30 seconds"));
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
    logger.error({ err }, `Failed to fetch messages from ${phone_number}`);
    throw err; // Re-throw to allow caller to handle error
  } finally {
    // Cleanup
    try {
      await client.destroy();
      logger.debug("Client destroyed successfully");
    } catch (destroyErr) {
      logger.error({ destroyErr }, "Error destroying client");
    }
  }
}

// fungsi untuk mendapatkan list berdasarkn isi file targetlist.txt
function getTargetList() {
  logger.info("Mendapatkan daftar target dari targetlist.txt");
  const buffer = fs.readFileSync("./targetlist.txt", "utf8");

  const data = buffer.split("\n").filter((nomor) => nomor != "");

  return data;
}

function getTokenFromUser() {
  const token = prompt("[!] Masukan token: ");
  return token;
}

// fungsi ini untuk mengecek file token
// jika ada maka gunakan token yang ada di file
// jika tidak maka user akan diminta memasukan token
function cekToken() {
  try {
    const token = fs.readFileSync(".token", "utf8");
    return token;
  } catch (error) {
    if (error.code === "ENOENT") {
      return getTokenFromUser();
    }
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getListSession() {
  return fs.readdirSync("session");
}

module.exports = {
  clientLogin,
  generateClientsObject,
  sendMessage,
  getChatLog,
  getTargetList,
  cekToken,
  sleep,
  getListSession,
};
