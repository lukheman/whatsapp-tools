const { Client, LocalAuth } = require('whatsapp-web.js')
const fs = require('fs')
const prompt = require('prompt-sync')()
const qrcode = require('qrcode-terminal')

function generateClientsObject() {

    const filenames = fs.readdirSync('./session/')

    const clients = {}

    filenames.forEach((sesi) => {

        clients[sesi] = new Client({
            authStrategy: new LocalAuth({ dataPath: './session/' + sesi })
        })

    })

    return clients

}

// fungsi ini digunakan untuk memilih client yang akan digunakan
// jika Client tidak ada maka buat client baru
// fungsi mengembaikan object Client
async function clientLogin() {
    return new Promise((resolve) => {

        const filenames = fs.readdirSync('./session/')

        filenames.forEach((file, i) => {
            console.log(`${i + 1}. ${file}`)
        })

        console.log('0 untuk sesi baru')

        let session = prompt('Pilih sesi: ')
        let nomor = ''

        if (session === "0") {

            while (!nomor.trim()) {
                nomor = prompt('Masukan nomor anda: ')
            }

        } else {
            nomor = filenames[session - 1]
        }

        const client = new Client({
            authStrategy: new LocalAuth({ dataPath: './session/' + nomor })
        })

        client.on('qr', async (qr) => {
            qrcode.generate(qr, { small: true })
        })

        resolve(client)

        // client.on('ready', () => {
        //     console.log('Anda login dengan nomor: ', nomor)
        //     console.log('Client siap digunakan')
        //     resolve(client)
        // })

    }
    )
}

module.exports = { clientLogin, generateClientsObject }
