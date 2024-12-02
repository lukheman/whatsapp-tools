const prompt = require('prompt-sync')()

function prosesAsynchronous() {

  return new Promise((resolve) => {
    const nama = prompt('Nama kamu: ')
    resolve(nama)
  })

}

async function menunggu() {
  console.log('menunggu proses....')

  const hasil = await prosesAsynchronous();
  console.log(`Hasil: ${hasil}`)

  console.log('hasil berikutnya')

}

menunggu()
