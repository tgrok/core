"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var ProxyClient_1 = require("./ProxyClient");
var TgrokClient_1 = require("./TgrokClient");
var event_1 = require("./event");
var ControlClient = /** @class */ (function (_super) {
    __extends(ControlClient, _super);
    function ControlClient(config, tunnels) {
        var _this = _super.call(this) || this;
        _this._clientId = "";
        _this.typeName = "ctl";
        _this.tunnelList = [];
        _this._status = 0;
        _this.onConnect = function () {
            _super.prototype.onConnect.call(_this);
            _this.status = 2;
            _this.send(_this.auth());
        };
        _this.onData = function (data) {
            if (data.length <= 0) {
                return;
            }
            if (_this.recvBuffer) {
                _this.recvBuffer = Buffer.concat([_this.recvBuffer, data]);
            }
            else {
                _this.recvBuffer = data;
            }
            var length = 0;
            do {
                var headBuffer = _this.recvBuffer.slice(0, 8);
                length = headBuffer.readUInt32LE(0);
                if (_this.recvBuffer.length < 8 + length) {
                    return;
                }
                _this.info("reading message with length: " + length);
                var raw = _this.recvBuffer.slice(8, length + 8);
                _this.recvBuffer = _this.recvBuffer.slice(length + 8);
                _this.handleData(raw.toString());
                if (_this.recvBuffer.length < 8) {
                    return;
                }
                length = _this.recvBuffer.slice(0, 8).readUInt32LE(0);
            } while (_this.recvBuffer.length >= (8 + length));
        };
        _this.onEnd = function () {
            _this.emit("end");
            _this.status = 3;
            _this.clearTimer();
        };
        _this.onError = function (err) {
            _this.emit("error", err);
            _this.status = 3;
            _this.clearTimer();
        };
        _this.handleData = function (raw) {
            _this.info("recv <<<< " + raw);
            var json = JSON.parse(raw);
            var payload = json.Payload;
            switch (json.Type) {
                case "AuthResp":
                    _this._clientId = payload.ClientId;
                    event_1.default.emit("info", {
                        evt: "auth:resp",
                        payload: payload.Error,
                    });
                    if (payload.Error) {
                        _this.status = 6;
                        return;
                    }
                    _this.status = 10;
                    // start timer
                    _this.startTimer();
                    // register tunnels
                    _this.registerTunnels();
                    break;
                case "ReqProxy":
                    _this.regProxy();
                    event_1.default.emit("info", {
                        evt: "proxy:req",
                    });
                    break;
                case "NewTunnel":
                    event_1.default.emit("info", {
                        evt: "tunnel:resp",
                        payload: payload.Error,
                    });
                    if (payload.Error) {
                        _this.info("Add tunnel failed, " + payload.Error, true);
                        return;
                    }
                    _this.newTunnel(payload);
                    break;
                default:
                    break;
            }
        };
        _this.regProxy = function () {
            if (!_this.host) {
                return;
            }
            var proxy = new ProxyClient_1.default(_this);
            proxy.start(_this.host, _this.port, _this.context);
        };
        _this.newTunnel = function (payload) {
            var tunnel = lodash_1.find(_this.tunnelList, { requestId: payload.ReqId });
            if (!tunnel) {
                _this.info("No tunnel found for requestId " + payload.ReqId, true);
                return;
            }
            tunnel.url = payload.Url;
            tunnel.status = 10;
            _this.info("Add tunnel OK, type: " + payload.Protocol + " url: " + payload.Url, true);
        };
        _this.auth = function () {
            return {
                /* tslint:disable */
                Type: "Auth",
                Payload: {
                    Version: "2",
                    MmVersion: "1.7",
                    User: _this.config.token,
                    Password: "",
                    OS: "darwin",
                    Arch: "amd64",
                    ClientId: _this.clientId,
                },
            };
        };
        _this.startTimer = function () {
            if (_this.timerId) {
                return;
            }
            _this.timerId = setInterval(function () {
                _this.send(_this.ping());
            }, 20 * 1000);
        };
        _this.ping = function () {
            /* tslint:disable */
            return {
                Type: "Ping",
                Payload: {},
            };
            /* tslint:enable */
        };
        _this.registerTunnels = function () {
            lodash_1.forEach(_this.tunnelList, function (tunnel) {
                _this.registerTunnel(tunnel);
            });
        };
        _this.registerTunnel = function (tunnel) {
            tunnel.status = 6;
            _this.send(tunnel.request());
        };
        _this.openTunnel = function (tunnel) {
            _this.info("opening tunnel for " + tunnel.subdomain);
            var oldTunnel = lodash_1.find(_this.tunnelList, {
                id: tunnel.id,
            });
            if (oldTunnel) {
                if (oldTunnel.status !== 0) {
                    // in changing state
                    return;
                }
                _this.tunnelList.splice(_this.tunnelList.indexOf(oldTunnel), 1);
            }
            _this.tunnelList.push(tunnel);
            if (oldTunnel && oldTunnel.subdomain === tunnel.subdomain && oldTunnel.url) {
                // tunnel is already successfully registered
                tunnel.url = oldTunnel.url;
                tunnel.status = 10;
                return;
            }
            // console.log(this.tunnelList)
            _this.registerTunnel(tunnel);
        };
        _this.closeTunnel = function (id) {
            _this.info("closing tunnel for " + id);
            var tunnel = lodash_1.find(_this.tunnelList, {
                id: id,
            });
            if (tunnel) {
                tunnel.status = 0;
            }
            // console.log(this.tunnelList)
        };
        _this.removeTunnel = function (id) {
            lodash_1.remove(_this.tunnelList, {
                id: id,
            });
            // console.log(this.tunnelList)
            event_1.default.emit("info", {
                evt: "tunnel:removed",
                payload: id,
            });
        };
        _this.config = config;
        _this.tunnelList = tunnels;
        return _this;
    }
    Object.defineProperty(ControlClient.prototype, "clientId", {
        get: function () {
            return this._clientId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ControlClient.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (val) {
            this._status = val;
            event_1.default.emit("info", {
                evt: "control:status",
                payload: val,
            });
        },
        enumerable: false,
        configurable: true
    });
    ControlClient.prototype.clearTimer = function () {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = undefined;
        }
    };
    return ControlClient;
}(TgrokClient_1.default));
exports.default = ControlClient;
