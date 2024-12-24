function banner() {
  console.log(`
|  \\/  | ___ _ __ | |_ __ \\ \\      / /_ _
| |\\/| |/ _ \\ '_ \\| __/ _\` \\ \\ /\\ / / _\` |
| |  | |  __/ | | | || (_| |\\ V  V / (_| |
|_|  |_|\\___|_| |_|\\__\\__,_| \\_/\\_/ \\__,_|
 `);
}

function loginBanner() {
  console.clear();
  banner();
  console.log("       LOGIN MENGGUNAKAN COOKIE");
}

function menu() {
  console.clear();
  banner();

  console.log("[1] Auto sender");
  console.log("[2] Auto sender (save mode)");
  console.log("[3] Tambah Nomor");
  console.log("[4] Dapatkan Log Chat");
}

module.exports = { menu, loginBanner, banner };
