const { machineIdSync } = require("node-machine-id");
const logger = require("../logger/logger");
const { sleep } = require("./utils");
const prompt = require("prompt-sync")();
const { BASEURL } = require("./config.js");
const validator = require("email-validator");

const tokenValidation = async (token) => {
  const machineId = machineIdSync({ origin: true });
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
    if (data.status === "error") {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    logger.debug({ err }, "Error during fetching data from the server");
    throw err;
  }
};

const userSignup = async (name, email) => {
  if (!validator.validate(email)) {
    logger.debug("invalid email");
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
      logger.debug(data.message);
      throw new Error(data.message);
    }

    return true;
  } catch (err) {
    logger.debug({ err }, "Error during fetching data from the server");
    throw err;
  }
};

const isRegistered = async () => {
  const machineId = machineIdSync({ origin: true });

  try {
    const response = await fetch(BASEURL + "/ismachineidregistered", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Pastikan header JSON ditambahkan
      },
      body: JSON.stringify({ machineId }),
    });

    logger.debug("Successfully getting data from server...");
    await sleep(1000);
    const data = await response.json();

    if (data.status === "success") {
      return true;
    }

    return false;
  } catch (err) {
    logger.debug({ err }, " Error during fetching data from the server");
    throw err;
  }
};

module.exports = {
  tokenValidation,
  userSignup,
  isRegistered,
};
