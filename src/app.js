const prompt = require('prompt-sync')()
const config = require('./config/config_user.json')

const { clientLogin, generateClientsObject, sendMessage, getTargetList } = require('./utils/utils.js')

const message = 'asssalamualaikum teman-teman, maaf mengganggu ini adalah pesan yang dikirim melalui bot sebagai tahap testing dan debugging'


function pilihMenu() {

    console.log('silahkan pilih menu')
    console.log('[1] Auto sender')
    console.log('[2] Auto sender (save mode)')

    return new Promise((resolve) => {
        let pilihan = prompt('[ ] Pilih menu: ')
        resolve(pilihan)
    })

}

async function menuAutoSender() {

    let client = await clientLogin()
    const targetlist = await getTargetList()

    let currentTargetIndex = 0

    client.on('ready', async () => {

        while (currentTargetIndex < targetlist.length) {

            const target = targetlist[currentTargetIndex] + '@c.us'

            try {

                client.sendMessage(target, message)
                console.log('Berhasil mengirim pesan ke: ', target)


            } catch (err) {
                console.log('Gagal mengirim pesan ke: ', target, err)
            }

            currentTargetIndex++

        }

    })

    client.initialize()

}

async function menuAutoSenderAntiBanned() {

    const clients = generateClientsObject()

    const targetlist = await getTargetList()

    let currentTargetIndex = 0
    let currentClientIndex = 0

    while (currentClientIndex < Object.keys(clients).length) {
        const client = Object.values(clients)[currentClientIndex]
        const targets = targetlist.slice(currentTargetIndex, currentTargetIndex + config.clientLimitMsg)
        await sendMessage(client, targets)

        currentTargetIndex += config.clientLimitMsg
        currentClientIndex++
    }

}

async function main() {
}


main()
