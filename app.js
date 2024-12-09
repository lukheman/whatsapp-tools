const prompt = require('prompt-sync')()
const fs = require('fs')
//
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

const { clientLogin, generateClientsObject } = require('./utils.js')

const config = require('./config.json')
const { resolve } = require('path')

const pesan = 'asssalamualaikum teman-teman, maaf mengganggu ini adalah pesan yang dikirim melalui bot sebagai tahap testing dan debugging'

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
    console.log('1. Kirim pesan ke target list')
    console.log('2. Kirim pesan ke target list')

    return new Promise((resolve) => {
        const pilihan = prompt('Pilih menu: ')
        resolve(pilihan)
    })

}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function main() {

    if (config.antiBanned) {
        const clients = generateClientsObject()

        const targetlist = await getTargetList()

        let currentTargetIndex = 0
        let currentClientIndex = 0

        while (currentClientIndex < Object.keys(clients).length) {
            const client = Object.values(clients)[currentClientIndex]
            const targets = targetlist.slice(currentTargetIndex, currentTargetIndex + config.clientLimitMsg)
            await sendMessageTo(client, targets)

            currentTargetIndex += config.clientLimitMsg
            currentClientIndex++
        }

    }

    return

    let client = await clientLogin()
    // pilih menu
    let menu = await pilihMenu()

    if (menu === '1') {

        // menu 1
        //  dapatkan daftar target
        const targetlist = await getTargetList()

        let currentTargetIndex = 0

        client.on('ready', async () => {

            while (currentTargetIndex < targetlist.length) {

                const target = targetlist[currentTargetIndex] + '@c.us'

                try {

                    client.sendMessage(target, pesan)
                    console.log('Berhasil mengirim pesan ke: ', target)

                    // TODO: Buat fitur ganti client
                    if (config.antiBanned) {
                        if (currentTargetIndex % config.clientLimitMsg == 0) {
                        }
                    }


                } catch (err) {
                    console.log('Gagal mengirim pesan ke: ', target, err)
                }

                currentTargetIndex++

            }

            //targetlist.forEach( => {
            //
            //    client.sendMessage(target + '@c.us', pesan)
            //console.log('berhasil mengirim pesan ke: ', target)
            //
            //})

        })

    } else if (menu == '2') {
        //
    }

    client.initialize()


}



//client.on('message_create', message => {
//  if (message.body === '!ping') {
//    client.sendMessage(message.from, 'pong');
//    console.log('Berhasil mengirim pesan ke: ' + message.from)
//  }
//});

main()
