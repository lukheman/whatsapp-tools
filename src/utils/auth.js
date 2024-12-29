const { Client, LocalAuth } = require("whatsapp-web.js");
const { SESSIONDIR } = require("./config");
const logger = require("../logger/logger");
const { sleep } = require("./utils");
const qrcode = require("qrcode-terminal");

const fs = require("fs");

const getClientObject = (phone_number) => {
  if (phone_number != undefined) {
    return new Client({
      authStrategy: new LocalAuth({
        dataPath: `${SESSIONDIR}/${phone_number}`,
      }),
    });
  } else {
    const sessions = fs.readdirSync(SESSIONDIR);

    const clients = {};

    for (const sesi of sessions) {
      clients[sesi] = new Client({
        authStrategy: new LocalAuth({ dataPath: `${SESSIONDIR}/${sesi}` }),
      });
    }

    return clients;
  }
};

const accountSync = async (phone_number) => {
  const client = getClientObject(phone_number);
  try {
    await client.initialize();

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Client ready timeout after 5 minutes"));
      }, 300000);

      client.once("qr", async (qr) => {
        logger.info("Generate qr code untuk nomor ");
        await sleep(1000);
        qrcode.generate(qr, { small: true });
      });

      client.once("ready", () => {
        logger.info("client siap digunakan untuk nomor ");
        clearTimeout(timeout);
        resolve();
      });

      client.once("auth_failure", (err) => {
        clearTimeout(timeout);
        reject(new Error(`Authentication failed: ${err}`));
      });
    });
    return true;
  } catch (error) {
    logger.error(error);
    fs.unlinkSync(`${SESSIONDIR}/${phone_number}`);
    throw error;
  } finally {
    try {
      client.destroy();
      logger.debug("Client destroyed successfully");
    } catch (error) {
      logger.error({ error }, "Error destroying client");
    }
  }
};

// fungsi ini digunakan untuk memilih client yang akan digunakan
// jika Client tidak ada maka buat client baru
// fungsi mengembaikan object Client
const clientLogin = async (phone_number) => {
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
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      webVersionCache: {
        type: "remote",
        remotePath:
          "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2411.2.html",
      },
    });

    return client;
  } else {
  }
};

module.exports = { getClientObject, clientLogin, accountSync };
