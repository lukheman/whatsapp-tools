# Whatsapp Tools

## Instalasi

### Requirement

- NodeJs 18 >
- NPM

```bash
git clone https://gitlab.com/lukheeman/whatsapp-tools
cd whatsapp-tools
npm install
npm start # jalankan program
```

### Compile Ke EXE

Pastikan anda memiliki package `pkg` yang telah terinstal di komputer Anda.

Masuk ke ./node_modules/puppeteer lalu jalankan `npm install`.
Ini akan mendownload chromium yang sesuai dengan perangkat Anda.

setelah selesai, jalankan perintah untuk mencompile program jadi exe di root project `./whatsapp-tools`

```bash
pkg . --targets node18-win-x64
```

perintah ini akan mengahasil file.exe yang bisa Anda jalankan di windows.
