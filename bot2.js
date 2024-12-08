const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const fs = require('fs')

const filenames = fs.readdirSync('./session')

filenames.forEach(file => {
  console.log(file)
});

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: 'session/' + selected_session
  })
})

client.on('ready', () => {
  console.log('client is ready')
})

client.on('qr', (qr) => {
  qrcode.generate(qr, {small: true})
})

client.initialize()
