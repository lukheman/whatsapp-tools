const components = require("./ui/components.js");

const { isRegistered } = require("./utils/api.js");
const prompt = require("prompt-sync")();

const main = async () => {
  components.banner();
  const status = await isRegistered();

  if (!status) {
    prompt("[!] Lakukan registrasi terlebih dahulu, sebelum menggunakan tools");
    await components.registration();
  } else {
    await components.loginUsingToken();
  }
};

main();
