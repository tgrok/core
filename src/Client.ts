import * as events from "events"
import * as net from "net"
import * as tls from "tls"
import * as dayjs from "dayjs"
// @ts-ignore
import * as randomatic from "randomatic"
import Log from "./Log"

class Client extends events.EventEmitter {

  public name = ""
  protected typeName = ""
  protected socket?: tls.TLSSocket | net.Socket

  constructor() {
    super()
    this.name = randomatic('a0', 8)
  }

  public getSocket = () => {
    return this.socket
  }

  protected info = (msg: string, show?: boolean) => {
    const time = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
    Log.info(`[${time}] [${this.typeName}:${this.name}] ${msg}`, show)
  }

  protected onConnect () {
    this.emit("connect", this.socket)
  }

  protected onData = (data: Buffer) => {
    // on data
  }

  protected onEnd = () => {
    this.emit("end")
  }

  protected onError = (err: Error) => {
    this.emit("error", err)
    this.info(err.message)
  }
}

export default Client
