"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var randomatic = require("randomatic");
var event_1 = require("./event");
var Tunnel = /** @class */ (function () {
    function Tunnel(config) {
        var _this = this;
        this.url = "";
        this._status = 0;
        this.request = function () {
            return {
                /* tslint:disable */
                Type: "ReqTunnel",
                Payload: {
                    ReqId: _this.requestId,
                    Protocol: _this.protocol,
                    Hostname: _this.hostname,
                    Subdomain: _this.subdomain,
                    HttpAuth: "",
                    RemotePort: _this.remotePort,
                },
            };
        };
        this.id = config.id;
        this.requestId = randomatic('a0', 20);
        this.hostname = config.hostname;
        this.subdomain = config.subdomain;
        this.protocol = config.protocol;
        this.localHost = config.lhost;
        this.localPort = config.lport;
        this.remotePort = config.rport;
    }
    Object.defineProperty(Tunnel.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (val) {
            this._status = val;
            event_1.default.emit("info", {
                evt: "tunnel:status",
                payload: {
                    id: this.id,
                    status: this._status,
                    url: this.url,
                },
            });
        },
        enumerable: false,
        configurable: true
    });
    return Tunnel;
}());
exports.default = Tunnel;
