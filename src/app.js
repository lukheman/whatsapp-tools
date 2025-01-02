const components = require("./ui/components.js");

const { isRegistered } = require("./utils/api.js");
const prompt = require("prompt-sync")();

const main = async () => {
  components.banner();
  try {
    const status = await isRegistered();
    if (!status) {
      prompt(
        "[!] Lakukan registrasi terlebih dahulu, sebelum menggunakan tools",
      );
      await components.registration();
    } else {
      console.log(
        "[!] Anda telah dertaftar, silahkan login menggunakan cookie",
      );
      await components.loginUsingToken();
    }
  } catch (error) {
    console.log("[!] cek koneksi internet Anda");
  }
};

main();
