const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

const client = new Client({
  authStrategy: new LocalAuth() // Menggunakan LocalAuth untuk menyimpan session
})


client.once('ready', () => {
  console.log('client is ready')
})

// when the client receive the qr code
client.on('qr', (qr) => {
  // console.log('receive', qr)
  qrcode.generate(qr, {small: true})
})

client.on('message_create', message => {
  let msg = message.body

	if (msg === 'ping') {
		client.sendMessage(message.from, 'pong');
	} else if (msg === '!info') {
		client.sendMessage(message.from, 'ini info');
  }

});


client.initialize()
