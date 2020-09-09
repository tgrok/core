// @ts-ignore
import * as randomatic from "randomatic"
import event from "./event"

class Tunnel {
  public readonly id: string
  public url = ""
  public localHost: string
  public localPort: number
  public requestId: string

  private readonly hostname: string
  public readonly subdomain: string
  public readonly protocol: string
  private readonly remotePort: number

  private _status = 0

  public set status(val) {
    this._status = val
    event.emit("info", {
      evt: "tunnel:status",
      payload: {
        id: this.id,
        status: this._status,
        url: this.url,
      },
    })
  }

  public get status() {
    return this._status
  }

  constructor(config: any) {
    this.id = config.id
    this.requestId = randomatic('a0', 20)
    this.hostname = config.hostname
    this.subdomain = config.subdomain
    this.protocol = config.protocol
    this.localHost = config.lhost
    this.localPort = config.lport
    this.remotePort = config.rport
  }

  public request = () => {
    return {
      /* tslint:disable */
      Type: "ReqTunnel",
      Payload: {
        ReqId: this.requestId,
        Protocol: this.protocol,
        Hostname: this.hostname,
        Subdomain: this.subdomain,
        HttpAuth: "",
        RemotePort: this.remotePort,
      },
      /* tslint:enable */
    }
  }
}

export default Tunnel
