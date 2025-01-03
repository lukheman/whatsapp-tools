const fs = require("fs");
const prompt = require("prompt-sync")();
const qrcode = require("qrcode-terminal");
const logger = require("./../logger/logger.js");
const { SESSIONDIR } = require("./config.js");
const { exec } = require("child_process");
const { error, log } = require("console");

const getTokenFromUser = () => {
  const token = prompt("[!] Masukan token: ");
  return token;
};

const openUrl = async (url) => {
  let command;

  switch (process.platform) {
    case "darwin":
      command = `open "${url}"`;
      break;
    case "win32":
      command = `start "${url}"`;
      break;
    default:
      command = `xdg-open "${url}"`;
      break;
  }

  exec(command, (error) => {
    if (error) {
      logger.debug({ error }, "Error: ");
      return;
    }
    logger.info("Browser berhasil dibuka");
  });
};

// fungsi ini untuk mengecek file token
// jika ada maka gunakan token yang ada di file
// jika tidak maka user akan diminta memasukan token
const cekToken = () => {
  try {
    const token = fs.readFileSync(".token", "utf8");
    return token;
  } catch (error) {
    if (error.code === "ENOENT") {
      return getTokenFromUser();
    }
  }
};

const getTargetList = () => {
  // TODO: handing when nothing target
  logger.info("Mendapatkan daftar target dari targetlist.txt");
  if (!fs.existsSync("./targetlist.txt")) {
    fs.writeFileSync("./targetlist.txt", "");
  }
  const buffer = fs.readFileSync("./targetlist.txt", "utf8");

  const data = buffer.split("\n").filter((nomor) => nomor != "");

  return data;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getListSession = () => {
  return fs.readdirSync(SESSIONDIR);
};

const saveStatus = (data, filename) => {
  // cek directory result if (1fs.existsSync("results/")) { }
  if (!fs.existsSync("results/")) {
    fs.mkdirSync("results/");
  }

  var text = "";
  for (const number of data.failed) {
    text += `${number}\n`;
  }

  fs.writeFileSync(`results/${filename}_gagal.txt`, text, "utf8");

  var text = "";
  for (const number of data.success) {
    text += `${number}\n`;
  }
  fs.writeFileSync(`results/${filename}_berhasil.txt`, text, "utf8");
};

const saveToken = (token) => {
  fs.writeFileSync(".token", token);
};
module.exports = {
  getTargetList,
  cekToken,
  sleep,
  getListSession,
  saveStatus,
  openUrl,
  saveToken,
};
