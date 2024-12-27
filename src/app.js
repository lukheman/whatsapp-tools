const prompt = require("prompt-sync")();
const config = require("./config/config_user.json");

const logger = require("./logger/logger.js");

const { machineIdSync } = require("node-machine-id");

const {
  clientLogin,
  generateClientsObject,
  sendMessage,
  getChatLog,
  getTargetList,
  sleep,
  getListSession,
} = require("./utils/utils.js");

const fs = require("fs");

const { onMessageCreate } = require("./utils/handlers.js");
const { tokenValidation, userRegistration } = require("./utils/validation.js");

const components = require("./ui/components.js");

const { BASEURL } = require("./utils/config.js");

async function pilihMenu() {
  components.menu();

  let pilihan = prompt("[ ] Pilih menu: ");
  return pilihan;
}

async function menuAutoSender() {
  let client = await clientLogin();
  const targetlist = getTargetList();

  let message = prompt("Masukan pesan yang ingin anda kirim: ");

  logger.info("Memulai mengirim pesan ke targetlist");
  await sendMessage(client, message, targetlist);

  onMessageCreate(client);

  // process.exit(0);
}

async function menuAutoSenderAntiBanned() {
  console.log();
  console.log("[I] daftar sesi yang akan dipakai");
  const listsession = getListSession();

  if (listsession.length <= 0) {
    console.log(
      "[!] Anda belum memiliki akun yang terhubung, silahkan tambahkan akun dulu",
    );
    return false;
  }

  listsession.forEach((sesi, i) => {
    console.log(`[${i + 1}] ${sesi}`);
  });

  const clients = generateClientsObject();
  const targetlist = getTargetList();

  let currentTargetIndex = 0;
  let currentClientIndex = 0;

  // cetak info
  logger.info("Jumlah akun   : " + Object.keys(clients).length);
  logger.info("Jumlah target : " + targetlist.length);

  await sleep(3000);

  const message = prompt("Masukan pesan yang ingin anda kirim: ");

  while (currentClientIndex < Object.keys(clients).length) {
    logger.info(
      "Anda login dengan nomor " + Object.keys(clients)[currentClientIndex],
    );
    const client = Object.values(clients)[currentClientIndex];
    const targets = targetlist.slice(
      currentTargetIndex,
      currentTargetIndex + config.clientLimitMsg,
    );

    logger.info("Memulai mengirim pesan ke targetlist");
    await sleep(1000);

    await sendMessage(client, message, targets);

    currentTargetIndex += config.clientLimitMsg;
    currentClientIndex++;
  }
  process.exit(0);
}

// fungsi ini digunakan untuk menambah dan menyimpan session
async function menuAddPhoneNumber() {
  while (true) {
    const phone_number = prompt("[ ] Masukan nomor telepon: ");
    logger.info("Mencoba login ke nomor " + phone_number);
    const result = await clientLogin(phone_number);
    logger.info("Berhasil login ke nomor " + phone_number);

    const repeat = prompt("[?] Lagi (y/n): ");

    if (repeat == "y") {
      continue;
    } else {
      process.exit(0);
    }
  }
}

async function menuGetChatLog() {
  const client = await clientLogin();
  const phone_number = prompt("[*] Nomor Hp: ");
  const limit = prompt("[*] Limit: ");

  try {
    logger.info("get chat log");
    await getChatLog(client, phone_number, Number(limit));
  } catch (err) {
    logger.error("Gagal mendapatkan log pesan: ", err);
  }
}

async function registerAndValidation() {
  components.loginBanner();

  // cek apakah machineId telah terdaftar di server
  logger.info("Synchronization with server...");
  const machineId = machineIdSync({ origin: true });
  // const machineId = "dkdk";

  fetch(BASEURL + "/ismachineidregistered", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Pastikan header JSON ditambahkan
    },
    body: JSON.stringify({ machineId }),
  })
    .then((response) => response.json())
    .then(async (res) => {
      logger.info("Successfully getting data from server...");
      await sleep(1000);
      if (res.status === "success") {
        // cek apakah ada file .token
        let token = undefined;

        // console.log("[!] Anda telah terdaftar");
        logger.info("You have registered");
        await sleep(1000);
        console.log();
        if (fs.existsSync(".token")) {
          token = fs.readFileSync(".token", "utf8");
        } else {
          token = prompt("[?] Masukan token anda: ");
        }

        // validasi token
        // dapatkan token dari user
        logger.info("Validate token");
        await sleep(3000);

        const result = await tokenValidation(machineId, token);

        if (result.status === "success") {
          // save token
          fs.writeFileSync(".token", token, "utf8");
          await menu();
        } else {
          if (fs.existsSync(".token")) {
            fs.unlinkSync(".token");
          }
          logger.error(result.message);
        }
      } else if (res.status === "error") {
        if (res.message == "machineId is not registered") {
          console.log("[!] Anda belum melakukan registrasi");
          prompt("[*] [enter] untuk melakukan registrasi");
          console.clear();
          components.banner();
          console.log("     REGISTRATION");
          await userRegistration();
          // process.exit(0);
        } else {
          logger.error("terjadi kesalahan");
          process.exit(1);
        }
      }
    });
}

async function menu() {
  const menu = await pilihMenu();

  if (menu == "1") {
    await menuAutoSender();
  } else if (menu == "2") {
    await menuAutoSenderAntiBanned();
  } else if (menu == "3") {
    await menuAddPhoneNumber();
  } else if (menu == "4") {
    await menuGetChatLog();
  } else if (menu == "e") {
  } else {
    console.log("[!] pilihan tidak tersedia");
  }
}

registerAndValidation();
