const prompt = require('prompt-sync')()
const fs = require('fs')

const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const { format, resolve } = require('path')

const pesan = 'asssalamualaikum teman-teman, maaf mengganggu ini adalah pesan yang dikirim melalui bot sebagai tahap testing dan debugging'

function selectSession() {

  const filenames = fs.readdirSync('./session')

  return new Promise((resolve) => {

    filenames.forEach((file, i) => {
      console.log(`${i + 1}. ${file}`)
    })
    console.log('0 untuk sesi baru')

    let session = prompt('Pilih sesi: ')
    let nomor = ''

    if (session === "0") {

      while (!nomor.trim()) {
        nomor = prompt('Masukan nomor anda: ')
        resolve(nomor)
      }

    } else {
      resolve(filenames[session - 1])
    }

  })

}

function getTargetList() {

  return new Promise(resolve => {
    fs.readFile('./targetlist.txt', 'utf8', (err, data) => {

      if (err) {
        console.error(err)
        return
      }
      resolve(data.split('\n').filter((nomor) => nomor != ''))

    })

  })

}

function pilihMenu() {

  console.log('silahkan pilih menu')
  console.log('1. Kirim pesan ke target lisr')

  return new Promise((resolve) => {
    const pilihan = prompt('Pilih menu: ')
    resolve(pilihan)
  })

}

async function main() {

  const sesi = await selectSession()

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: 'session/' + sesi
    })
  })

  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true })
  })

  // pilih menu
  let menu = await pilihMenu()

  if (menu === '1') {

    // menu 1

    //  dapatkan daftar target
    const targetlist = await getTargetList()

    client.on('ready', async () => {

      targetlist.forEach(target => {

        client.sendMessage(target + '@c.us', pesan)
        console.log('berhasil mengirim pesan ke: ', target)

      })

    })

  }

  await client.initialize()


}



//client.on('message_create', message => {
//  if (message.body === '!ping') {
//    client.sendMessage(message.from, 'pong');
//    console.log('Berhasil mengirim pesan ke: ' + message.from)
//  }
//});


main()
