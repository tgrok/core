import * as events from "events"
import ControlClient from "./ControlClient"
import Log from "./Log"
import Tunnel from "./Tunnel"
import event from "./event"

export default class Tgrok extends events.EventEmitter {
  public host: string = "ngrok.local"
  public port: number = 4443
  public config: any = {}
  public context: any = {}

  private started = false

  private controlClient?: ControlClient
  private timerId: any
  private retryTimes = 0

  constructor() {
    super()
  }

  public set debug(v: boolean) {
    Log.debug = v
  }

  public startLocal = (lport?: number | string, domain?: string) => {
    // no repeated start
    if (this.started) {
      Log.error("\n\tAlready Started!!!\n")
      return
    }
    this.started = true

    let localPort = 80
    let subdomain = domain
    if (typeof lport === "number") {
      localPort = lport
    } else {
      subdomain = lport
    }
    const tunnel = new Tunnel({
      protocol: "http",
      hostname: "",
      subdomain,
      rport: 0,
      lhost: "127.0.0.1",
      lport: localPort,
    })
    this.start([tunnel])
  }

  public start = (tunnels: Tunnel[]) => {
    const client = new ControlClient(this.config, tunnels)
    client.on("connect", this.onConnect)
    client.on("error", this.onError)
    client.on("end", this.onEnd)
    this.controlClient = client
    this.connect()
  }

  protected connect = () => {
    if (!this.controlClient) {
      return
    }
    this.controlClient.start(this.host, this.port, this.context)
  }

  protected onConnect = () => {
    this.retryTimes = 0
  }

  protected onEnd = () => {
    event.emit("info", {
      evt: "master:error",
      payload: `reconnect after ${this.timeout}s`,
    })
    Log.error(`main socket onEnd, reconnect after ${this.timeout}s`)
    this.reconnect(false)
  }

  protected onError = (err: Error) => {
    event.emit("info", {
      evt: "master:error",
      payload: `reconnect after ${this.timeout}s`,
    })
    Log.error(`main socket onError, reconnect after ${this.timeout}s`)
    this.reconnect(false)
  }

  public reconnect = (clear: boolean) => {
    if (clear) {
      clearTimeout(this.timerId)
      this.retryTimes = 0
      this.timerId = void 0
    }
    // master socket run into a problem.
    if (this.timerId) {
      // has already restart
      return
    }
    this.timerId = setTimeout(() => {
      this.timerId = void 0
      this.connect()
    }, this.timeout * 1000)
    this.retryTimes += 1
  }

  private get timeout() {
    const timeList = [1, 1, 2, 3, 5, 8, 13, 21]
    if (this.retryTimes >= timeList.length) {
      return timeList[timeList.length - 1]
    }
    return timeList[this.retryTimes]
  }

  public openTunnel = (tunnel: Tunnel) => {
    if (!this.controlClient) {
      return
    }
    this.controlClient.openTunnel(tunnel)
  }

  public closeTunnel = (id: string) => {
    if (!this.controlClient) {
      return
    }
    this.controlClient.closeTunnel(id)
  }

  public removeTunnel = (id: string) => {
    if (!this.controlClient) {
      return
    }
    this.controlClient.removeTunnel(id)
  }

  public status = () => {
    if (!this.controlClient) {
      return {
        status: 0,
        tunnels: [],
      }
    }
    const tunnels: any[] = []
    this.controlClient.tunnelList.forEach((tunnel) => {
      tunnels.push({
        id: tunnel.id,
        status: tunnel.status,
      })
    })
    return {
      status: this.controlClient.status,
      tunnels,
    }
  }
}
