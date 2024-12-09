const { Client, LocalAuth } = require('whatsapp-web.js')
const fs = require('fs')
const prompt = require('prompt-sync')()
const qrcode = require('qrcode-terminal')
const logger = require('./../logger/logger.js')
const { log } = require('console')
const { createRequire } = require('module')

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

        logger.debug('Membuat object client untuk nomor ', nomor)
        const client = new Client({
            authStrategy: new LocalAuth({ dataPath: './session/' + nomor })
        })

        client.on('qr', async (qr) => {
            logger.info('Generate qr code')
            qrcode.generate(qr, { small: true })
        })

        resolve(client)

    }
    )
}

async function sendMessageMulti(client, pesan, targets) {

    logger.debug('initialize client')
    client.initialize()

    return new Promise(resolve => {

        logger.debug('membuat handler untuk mengirim pesan')
        client.on('ready', async () => {

            targets.forEach(async target => {

                try {
                    await client.sendMessage(target + '@c.us', pesan)
                    logger.info('Berhasil mengirim pesan ke: ', target)
                } catch (err) {
                    logger.error(err, 'Gagal mengirim pesan ke: ', target)
                }

            })

            resolve(true)

        })
    })

}

async function sendMessage(client, message, target) {

    client.initialize()

    logger.debug('Membuat handler untuk mengirim pesan')
    client.on('ready', async () => {
        try {
            await client.sendMessage(target + '@c.us', message)
            logger.info('Berhasil mengirim pesan ke: ', target)

        } catch {
            logger.error('Gagal mengirim pesan ke: ', target, err)
        }
    })

}

function getTargetList() {

    return new Promise(resolve => {
        logger.info('Memproses target list dari file')
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
    sendMessageMulti,
    sendMessage,
    getTargetList
}
