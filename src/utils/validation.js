const { machineIdSync } = require("node-machine-id");
const logger = require("../logger/logger");
const { sleep } = require("./utils");
const prompt = require("prompt-sync")();
const { BASEURL } = require("./config.js");
const validator = require("email-validator");

const tokenValidation = async (machineId, token) => {
  try {
    const response = await fetch(BASEURL + "/tokenvalidation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Pastikan header JSON ditambahkan
      },
      body: JSON.stringify({ machineId, token }),
    });

    if (!response.ok) {
      throw new error(`HTTP error status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    logger.error({ err }, "Error during fetching data from the server");
    throw err;
  }
};

const userRegistration = async () => {
  const name = prompt("[?] Nama: ");
  const email = prompt("[?] Email: ");

  if (!validator.validate(email)) {
    logger.error("invalid email");
    return false;
  }

  const machineId = machineIdSync({ origin: true });

  try {
    const response = await fetch(BASEURL + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, machineId }),
    });

    if (!response.ok) {
      throw new error(`HTTP error status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "error") {
      logger.error(data.message);
      throw new Error(data.message);
    }

    logger.info("User successfully registered");
    //await sleep(1000);
    //
    //console.log("[!] Token anda: \n");
    //console.log(data.data.token);
    //console.log("\n[!] Gunakan token tersebut untuk login di lain waktu");
    return true;
  } catch (err) {
    logger.error({ err }, "Error during fetching data from the server");
    throw err;
  }
};

module.exports = {
  tokenValidation,
  userRegistration,
};
