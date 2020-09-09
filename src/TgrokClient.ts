import * as tls from "tls"
import Client from "./Client"

class TgrokClient extends Client {

  protected host?: string
  protected port?: number
  protected context?: object

  constructor() {
    super()
  }

  public start = (host: string, port?: number | object, context?: object) => {
    this.host = host
    this.port = 4443
    if (typeof port === "object") {
      context = port
    } else if (typeof port === "number") {
      this.port = port
    }
    this.context = context
    this.connect()
  }

  public connect = () => {
    this.info("connecting")
    if (this.port == null) {
      return
    }
    this.socket = tls.connect(this.port, this.host, this.context, this.onConnect)
    this.socket.on("data", this.onData)
    this.socket.on("end", this.onEnd)
    this.socket.on("error", this.onError)
  }

  protected send = (data: object | string) => {
    if (this.socket == null) {
      return
    }
    if (typeof data === "object") {
      data = JSON.stringify(data)
    }
    const headBuffer = Buffer.alloc(8)
    headBuffer.writeUInt32LE(Buffer.byteLength(data), 0)
    this.socket.write(headBuffer)
    this.info(`send >>>> ${data}`)
    this.socket.write(data)
  }

  protected onEnd = () => {
    this.socket = undefined
  }
}

export default TgrokClient
