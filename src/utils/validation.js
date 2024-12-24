const { machineIdSync } = require("node-machine-id");

const BASEURL = "http://localhost:3000";

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
      if (data.status === "error") {
        console.log(data.message);
        return false;
      }

      console.log(data);
      return true;
    });
};

module.exports = {
  tokenValidation,
  userRegistration,
};
