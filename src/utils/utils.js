const fs = require("fs");
const prompt = require("prompt-sync")();
const qrcode = require("qrcode-terminal");
const logger = require("./../logger/logger.js");
const { SESSIONDIR } = require("./config.js");

function getTokenFromUser() {
  const token = prompt("[!] Masukan token: ");
  return token;
}

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
  logger.info("Mendapatkan daftar target dari targetlist.txt");
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

module.exports = {
  getTargetList,
  cekToken,
  sleep,
  getListSession,
};
