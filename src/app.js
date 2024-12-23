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
  cekToken,
} = require("./utils/utils.js");

const { onMessageCreate } = require("./utils/handlers.js");

const components = require("./ui/components.js");

const BASEURL = "http://localhost:3000";

function pilihMenu() {
  components.menu();

  return new Promise((resolve) => {
    let pilihan = prompt("[ ] Pilih menu: ");
    resolve(pilihan);
  });
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
  const clients = generateClientsObject();
  const targetlist = getTargetList();

  let currentTargetIndex = 0;
  let currentClientIndex = 0;

  // cetak info
  logger.info("Jumlah akun   : " + Object.keys(clients).length);
  logger.info("Jumlah target : " + targetlist.length);

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
    await sendMessage(client, message, targets);

    currentClientIndex++;
  }
  process.exit(0);
}

// fungsi ini digunakan untuk menambah dan menyimpan session
async function menuAddPhoneNumber() {
  while (true) {
    const phone_number = prompt("[ ] Masukan nomor telepon: ");
    logger.info("Mencoba login ke nomor " + phone_number);
    await clientLogin(phone_number);
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

  logger.info("get chat log");
  await getChatLog(client, phone_number, Number(limit));
}

async function register() {
  const name = prompt("Nama: ");
  const email = prompt("Email: ");
  const machineId = machineIdSync({ origin: true });

  await fetch(BASEURL + "/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, machineId }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}

async function main() {
  // cek apakah machineId telah terdaftar di server

  const machineId = machineIdSync({ origin: true });
  // const machineId = "machine1235";

  fetch(BASEURL + "/userinformation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Pastikan header JSON ditambahkan
    },
    body: JSON.stringify({ machineId }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.status === "error") {
        if (data.message == "machineId not found") {
          console.log("silahkan melakukan registrasi");
          prompt();
          await register();
          // process.exit(0);
        }
        console.log("terjadi kesalahan");
        process.exit(1);
      } else {
        const user = data.data.user;
        console.log(user);
      }
    });

  // const menu = await pilihMenu();
  //
  // if (menu == "1") {
  //   await menuAutoSender();
  // } else if (menu == "2") {
  //   await menuAutoSenderAntiBanned();
  // } else if (menu == "3") {
  //   await menuAddPhoneNumber();
  // } else if (menu == "4") {
  //   await menuGetChatLog();
  // } else if (menu == "e") {
  // } else {
  //   console.log("pilihan tidak tersedia");
  // }
}

main();

// cekToken();
