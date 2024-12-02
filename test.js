const fs = require('fs')

fs.readFile('./targetlist.txt', 'utf8', (err, data) => {

  if (err) {
    console.error(err)
    return
  }

  console.log(data.split('\n').filter((nomor) => nomor != ''))


})

