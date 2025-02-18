const fs = require("fs");
const { SESSIONDIR } = require("../utils/config");
const { getClientObject, accountSync } = require("../utils/auth");
const {
  getTargetList,
  sleep,
  getListSession,
  openUrl,
  saveStatus,
  saveToken,
} = require("../utils/utils");
const { sendMessage, chatLogFrom } = require("../utils/messages.js");
const prompt = require("prompt-sync")();
const logger = require("../logger/logger.js");
const validator = require("email-validator");
const { userSignup, tokenValidation } = require("../utils/api.js");

const banner = () => {
  console.log(`
|  \\/  | ___ _ __ | |_ __ \\ \\      / /_ _
| |\\/| |/ _ \\ '_ \\| __/ _\` \\ \\ /\\ / / _\` |
| |  | |  __/ | | | || (_| |\\ V  V / (_| |
|_|  |_|\\___|_| |_|\\__\\__,_| \\_/\\_/ \\__,_|
 `);
};

const selectMenu = async () => {
  console.clear();
  banner();

  console.log("[1] Auto sender");
  console.log("[2] Auto sender (save mode)");
  console.log("[3] Tambah Nomor");
  console.log("[4] Dapatkan Log Chat");
  console.log("[e] exit");
  console.log();

  let pilihan = prompt("[ ] Pilih menu: ");
  return pilihan;
};

const mainMenu = async () => {
  while (true) {
    const menu = await selectMenu();

    if (menu == "1") {
      await autoSendMessage();
    } else if (menu == "2") {
      await autoSendMessageSaveMode();
    } else if (menu == "3") {
      await addAccount();
    } else if (menu == "4") {
      await getChatLog();
    } else if (menu == "e") {
      process.exit();
    } else {
      console.log("[!] pilihan tidak tersedia");
    }
  }
};

const addAccount = async () => {
  while (true) {
    const phone_number = prompt("[?] Nomor telepon [menu - untuk kembali]: ");
    if (phone_number === "") {
      continue;
    }

    if (phone_number === "menu") {
      await mainMenu();
    }

    if (isNaN(phone_number)) {
      console.log("[!] Nomor telepon tidak valid");
      continue;
    }

    logger.info("Mencoba login ke nomor " + phone_number);
    try {
      await accountSync(phone_number);
      logger.info("Berhasil login ke nomor " + phone_number);

      const repeat = prompt("[?] Lagi (y/n): ");

      if (repeat == "y") {
        continue;
      } else {
        await mainMenu();
      }
    } catch (error) {
      console.log(`[!] Gagal sinkronisasi dengan nomor ${phone_number}`);
    }
  }
};

const autoSendMessage = async () => {
  if (!fs.existsSync(SESSIONDIR)) {
    fs.mkdirSync(SESSIONDIR);
  }

  const sessions = fs.readdirSync(SESSIONDIR);
  if (sessions.length <= 0) {
    console.log("[!] Anda belum mempunyai akun yang terhubung");
    prompt();
    return;
  }
  let i = 1;
  for (const sesi of sessions) {
    console.log(`[${i}] ${sesi}`);
    i++;
  }

  const index = prompt("[?] Pilih akun: ");
  const phone_number = sessions[Number(index) - 1];

  const client = getClientObject(phone_number);
  const message = prompt("[?] Masukan pesan yang ingin anda kirim: ");
  const targetlist = getTargetList();

  logger.info("Memulai mengirim pesan ke targetlist");
  await sleep(3000);
  const status = await sendMessage(client, message, targetlist);

  saveStatus(status, phone_number);

  prompt("[!] (enter) untuk lanjut kembali ke menu");
  await mainMenu();
};

const autoSendMessageSaveMode = async () => {
  const sessions = getListSession();
  if (sessions.length <= 0) {
    console.log(
      "[!] Anda belum memiliki akun yang terhubung, silahkan tambahkan akun dulu",
    );
    prompt();
    return;
  }

  sessions.forEach((sesi, i) => {
    console.log(`[${i + 1}] ${sesi}`);
  });

  const clients = getClientObject();
  const targetlist = getTargetList();

  const limitMsg = prompt("[?] Batas pesan per akun (limit): ");

  let currentTargetIndex = 0;
  let currentClientIndex = 0;

  // cetak info
  logger.info("Jumlah akun   : " + Object.keys(clients).length);
  logger.info("Jumlah target : " + targetlist.length);

  await sleep(3000);

  const message = prompt("[?] Masukan pesan yang ingin anda kirim: ");

  while (currentClientIndex < Object.keys(clients).length) {
    const currentNumberPhone = Object.keys(clients)[currentClientIndex];
    logger.info("Anda login dengan nomor " + currentNumberPhone);
    const client = Object.values(clients)[currentClientIndex];
    const targets = targetlist.slice(
      currentTargetIndex,
      currentTargetIndex + Number(limitMsg),
    );

    logger.info("Memulai mengirim pesan ke targetlist");
    await sleep(1000);

    const status = await sendMessage(client, message, targets);
    saveStatus(status, `${currentNumberPhone}savemode`);

    currentTargetIndex += Number(limitMsg);
    currentClientIndex++;
  }
  prompt("[!] (enter) untuk lanjut kembali ke menu");
  await mainMenu();
};

const getChatLog = async () => {
  const sessions = fs.readdirSync(SESSIONDIR);
  if (sessions.length <= 0) {
    console.log("[!] Anda belum mempunyai akun yang terhubung");
    return false;
  }

  let i = 1;
  for (const sesi of sessions) {
    console.log(`[${i}] ${sesi}`);
    i++;
  }

  const index = prompt("[?] Pilih akun: ");
  const phone_number = sessions[Number(index) - 1];
  const client = getClientObject(phone_number);

  console.log("[ ] Masukan nomor telepon yang ingin dilihat history chatnya!");
  const target = prompt("[?] Nomor target: ");
  const limit = prompt("[?] Berapa chat yang akan dilihat: ");

  await chatLogFrom(client, target, limit);

  prompt("[!] (enter) untuk lanjut kembali ke menu");
  await mainMenu();
};

const registration = async () => {
  const name = prompt("[?] Name: ");
  let email = "";

  while (!validator.validate(email)) {
    email = prompt("[?] Email: ");
    // console.log("[!] Invalid email");
    // process.exit();
  }

  try {
    await userSignup(name, email);

    const message = `Halo,
Saya ${name}, ingin meminta token akses untuk keperluan.

Berikut detail saya:

    Nama: ${name}
    Email: ${email}

Jika ada syarat tambahan yang perlu saya lengkapi, mohon kabari saya.

Terima kasih banyak atas bantuannya!

Salam`;

    let url = `https://wa.me/6282250223147?text=${encodeURIComponent(message)}`;
    await openUrl(url);
  } catch (err) {
    console.log("[!] Gagal melakukan registrasi, harap coba lagi");
  }
};

const loginUsingToken = async () => {
  let token = "";

  if (fs.existsSync(".token")) {
    token = fs.readFileSync(".token", "utf8");
  } else {
    token = prompt("[!] Masukan token: ");
  }

  const isTokenValid = await tokenValidation(token);
  if (isTokenValid) {
    saveToken(token);
    await mainMenu();
  } else {
    console.log("[!] invalid token");
    console.log("[!] Hubungi admin (082250223147) untuk mendapatkan token");
  }
};

module.exports = {
  selectMenu,
  banner,
  autoSendMessage,
  autoSendMessageSaveMode,
  addAccount,
  registration,
  getChatLog,
  mainMenu,
  loginUsingToken,
};
