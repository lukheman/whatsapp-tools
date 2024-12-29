const prompt = require("prompt-sync")();
const config = require("./config/config_user.json");

const components = require("./ui/components.js");

const { isRegistered } = require("./utils/api.js");

const main = async () => {
  const status = await isRegistered();

  if (!status) {
    await components.registration();
  }
  components.mainMenu();
};

main();
