const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session/085942951794' }) // Menggunakan LocalAuth untuk menyimpan session
})




// when the client receive the qr code
client.on('qr', async (qr) => {
    // console.log('receive', qr)
    qrcode.generate(qr, { small: true })
})


client.on('ready', async () => {
    console.log('client is ready')
})

client.on('ready', async (message) => {

    await client.sendMessage('6285942951794@c.us', 'pong');
    await client.sendMessage('6285942951794@c.us', 'ini info');

});

client.initialize()
