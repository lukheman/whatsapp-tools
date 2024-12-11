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
  return new Promise((resolve) => {
    if (phone_number == undefined) {
      const filenames = fs.readdirSync("./session/");

      filenames.forEach((file, i) => {
        console.log(`${i + 1}. ${file}`);
      });

      let session = prompt("Pilih sesi: ");
      let nomor = "";

      nomor = filenames[session - 1];

      logger.debug("Membuat object client untuk nomor ", nomor);
      const client = new Client({
        authStrategy: new LocalAuth({ dataPath: "./session/" + nomor }),
      });

      resolve(client);
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
        resolve(client);
      });

      client.initialize();
    }
  });
}

async function sendMessage(client, message, targets) {
  logger.debug("initialize client");

  return new Promise((resolve) => {
    logger.debug("membuat handler untuk mengirim pesan");
    client.on("ready", () => {
      targets.forEach((target) => {
        try {
          client.sendMessage(target + "@c.us", message);
          logger.info("Berhasil mengirim pesan ke: " + target);
        } catch (err) {
          logger.error(err, "Gagal mengirim pesan ke: " + target);
        }
      });

      resolve(true);
    });
    client.initialize();
  });
}

// fungsi untuk mendapatkan list berdasarkn isi file targetlist.txt
function getTargetList() {
  logger.info("Mendapatkan daftar target dari targetlist.txt");
  const buffer = fs.readFileSync("./targetlist.txt", "utf8");

  const data = buffer.split("\n").filter((nomor) => nomor != "");

  return data;
}

module.exports = {
  clientLogin,
  generateClientsObject,
  sendMessage,
  getTargetList,
};
