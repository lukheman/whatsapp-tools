const { machineIdSync } = require("node-machine-id");
const logger = require("../logger/logger");
const { sleep } = require("./utils");
const prompt = require("prompt-sync")();
const { BASEURL } = require("./config.js");

const tokenValidation = async (machineId, token) => {
  return new Promise((resolve) => {
    fetch(BASEURL + "/tokenvalidation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Pastikan header JSON ditambahkan
      },
      body: JSON.stringify({ machineId, token }),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
};

const userRegistration = async () => {
  const name = prompt("[?] Nama: ");
  const email = prompt("[?] Email: ");
  const machineId = machineIdSync({ origin: true });

  await fetch(BASEURL + "/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, machineId }),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.status === "error") {
        logger.error(data.message);
        return false;
      }

      logger.info("User successfully registered");
      await sleep(1000);
      console.log("[!] Token anda: \n");
      console.log(data.data.token);
      console.log("\n[!] Gunakan token tersebut untuk login di lain waktu");
      return true;
    });
};

module.exports = {
  tokenValidation,
  userRegistration,
};
