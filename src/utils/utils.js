const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const prompt = require("prompt-sync")();
const qrcode = require("qrcode-terminal");
const logger = require("./../logger/logger.js");

function generateClientsObject() {
  const filenames = fs.readdirSync("./session/");

  const clients = {};

  filenames.forEach((sesi) => {
    clients[sesi] = new Client({
      authStrategy: new LocalAuth({ dataPath: "./session/" + sesi }),
    });
  });

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

    sessions.forEach((file, i) => {
      console.log(`${i + 1}. ${file}`);
    });

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
  logger.debug("Membuat client handler");
  client.on("ready", async () => {
    logger.info("client siap...");

    const chatId = phone_number + "@c.us";

    try {
      const chat = await client.getChatById(chatId);

      const messages = await chat.fetchMessages({ limit });

      logger.info("10 chat pertama dari " + phone_number);
      messages.forEach((msg, index) => {
        logger.info(`${index + 1} : ${msg.body}`);
      });
    } catch (err) {
      logger.error(err, "Gagal mengambil pesan");
    }
  });

  logger.debug("initialize client");
  client.initialize();
}

// fungsi untuk mendapatkan list berdasarkn isi file targetlist.txt
function getTargetList() {
  logger.info("Mendapatkan daftar target dari targetlist.txt");
  const buffer = fs.readFileSync("./targetlist.txt", "utf8");

  const data = buffer.split("\n").filter((nomor) => nomor != "");

  return data;
}

function getTokenFromUser() {
  return new Promise((resolve) => {
    const token = prompt("[!] Masukan token: ");
    resolve(token);
  });
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
