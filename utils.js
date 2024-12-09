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

    }
    )
}

async function sendMessage(client, targetlist) {

    client.initialize()

    return new Promise(resolve => {

        client.on('ready', async () => {
            console.log('membuat handler ready')

            targetlist.forEach(async target => {

                try {
                    await client.sendMessage(target + '@c.us', pesan)
                    console.log('Berhasil mengirim pesan ke: ', target)
                } catch (err) {
                    console.log('Gagal mengirim pesan ke: ', target, err)
                }

            })

            resolve(true)

        })
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

module.exports = {
    clientLogin,
    generateClientsObject,
    sendMessage,
    getTargetList
}
