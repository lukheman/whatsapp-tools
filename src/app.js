const prompt = require("prompt-sync")();
const config = require("./config/config_user.json");

const logger = require("./logger/logger.js");

const {
  clientLogin,
  generateClientsObject,
  sendMessage,
  getTargetList,
} = require("./utils/utils.js");

function pilihMenu() {
  console.log("silahkan pilih menu");
  console.log("[1] Auto sender");
  console.log("[2] Auto sender (save mode)");
  console.log("[3] Tambah Nomor");

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

    // currentTargetIndex += config.clientLimitMsg;
    currentClientIndex++;
  }
}

// fungsi ini digunakan untuk menambah dan menyimpan session
async function menuAddPhoneNumber() {
  const phone_number = prompt("[ ] Masukan nomor telepon: ");
  logger.info("Mencoba login ke nomor " + phone_number);
  await clientLogin(phone_number);
  logger.info("Berhasil login ke nomor " + phone_number);
}

async function main() {
  const menu = await pilihMenu();

  if (menu == "1") {
    await menuAutoSender();
  } else if (menu == "2") {
    await menuAutoSenderAntiBanned();
  } else if (menu == "3") {
    await menuAddPhoneNumber();
  } else if (menu == "e") {
  } else {
    console.log("pilihan tidak tersedia");
  }
}

main();
