# Tgrok

A tunneling service written in TypeScript.

## Installation

```sh
$ npm i https://github.com/tgrok/tgrok.git
```

## Usage

```js
const { Tgrok } = require("tgrok")

const tgrok = new Tgrok()

tgrok.context = {
  family: 4, // you can speed up your local network connection
  rejectUnauthorized: false, // required if your server is using a self-signed certificate
}

// show debug info
// tgrok.debug = true

// set your own host
// tgrok.host = "t.example.com"

// start tgrok on a random subdomain with default port 80
tgrok.startLocal()

// or spcified local port
// tgrok.startLocal(8080)

// or spcified subdomain
// tgrok.startLocal("test")

// or spcified both
// tgrok.startLocal(8080, "test")
```

## Development

```sh
$ git clone https://github.com/tgrok/tgrok.git && cd tgrok

# install dependencies
$ npm i

# start development
$ npm run dev

# build
$ npm run build

# start the client
$ npm run start
```

## Todo

- [ ] npm cli: npm install -g tgrok
- [ ] add tests
- [ ] tcp support
- [ ] https support
- [ ] logging system
