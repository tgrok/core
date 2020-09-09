const {Tgrok} = require('./lib/index.js')

const tgrok = new Tgrok()

// show debug info
tgrok.debug = true

tgrok.context = {
  family: 4, // you can speed up your local network connection
  rejectUnauthorized: false, // required if your server is using a self-signed certificate
}

tgrok.on('error', (err) => {
  console.log(err)
})

// set your own host
tgrok.host = "t.iganxi.net"

// start tgrok on a random subdomain to default port 80
tgrok.startLocal()

// or specify local port
// tgrok.startLocal(8000)

// or specify subdomain
// tgrok.startLocal("test")

// or specify both
// tgrok.startLocal(8000, "test")
