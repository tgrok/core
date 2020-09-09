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
var events = require("events");
var ControlClient_1 = require("./ControlClient");
var Log_1 = require("./Log");
var Tunnel_1 = require("./Tunnel");
var event_1 = require("./event");
var Tgrok = /** @class */ (function (_super) {
    __extends(Tgrok, _super);
    function Tgrok() {
        var _this = _super.call(this) || this;
        _this.host = "ngrok.local";
        _this.port = 4443;
        _this.config = {};
        _this.context = {};
        _this.started = false;
        _this.retryTimes = 0;
        _this.startLocal = function (lport, domain) {
            _this.start(lport, domain);
        };
        _this.start = function (lport, domain) {
            // no repeated start
            if (_this.started) {
                Log_1.default.error("\n\tAlready Started!!!\n");
                return;
            }
            _this.started = true;
            var tunnels = [];
            if (typeof lport === "object") {
                tunnels = lport;
            }
            else {
                var localPort = 80;
                var subdomain = domain;
                if (typeof lport === "number") {
                    localPort = lport;
                }
                else {
                    subdomain = lport;
                }
                tunnels.push(new Tunnel_1.default({
                    protocol: "http",
                    hostname: "",
                    subdomain: subdomain,
                    rport: 0,
                    lhost: "127.0.0.1",
                    lport: localPort,
                }));
            }
            var client = new ControlClient_1.default(_this.config, tunnels);
            client.on("connect", _this.onConnect);
            client.on("error", _this.onError);
            client.on("end", _this.onEnd);
            _this.controlClient = client;
            _this.connect();
        };
        _this.connect = function () {
            if (!_this.controlClient) {
                return;
            }
            _this.controlClient.start(_this.host, _this.port, _this.context);
        };
        _this.onConnect = function () {
            _this.retryTimes = 0;
        };
        _this.onEnd = function () {
            event_1.default.emit("info", {
                evt: "master:error",
                payload: "reconnect after " + _this.timeout + "s",
            });
            Log_1.default.error("main socket onEnd, reconnect after " + _this.timeout + "s");
            _this.reconnect(false);
        };
        _this.onError = function (err) {
            event_1.default.emit("info", {
                evt: "master:error",
                payload: "reconnect after " + _this.timeout + "s",
            });
            Log_1.default.error("main socket onError, reconnect after " + _this.timeout + "s");
            _this.reconnect(false);
        };
        _this.reconnect = function (clear) {
            if (clear) {
                clearTimeout(_this.timerId);
                _this.retryTimes = 0;
                _this.timerId = void 0;
            }
            // master socket run into a problem.
            if (_this.timerId) {
                // has already restart
                return;
            }
            _this.timerId = setTimeout(function () {
                _this.timerId = void 0;
                _this.connect();
            }, _this.timeout * 1000);
            _this.retryTimes += 1;
        };
        _this.openTunnel = function (tunnel) {
            if (!_this.controlClient) {
                return;
            }
            _this.controlClient.openTunnel(tunnel);
        };
        _this.closeTunnel = function (id) {
            if (!_this.controlClient) {
                return;
            }
            _this.controlClient.closeTunnel(id);
        };
        _this.removeTunnel = function (id) {
            if (!_this.controlClient) {
                return;
            }
            _this.controlClient.removeTunnel(id);
        };
        _this.status = function () {
            if (!_this.controlClient) {
                return {
                    status: 0,
                    tunnels: [],
                };
            }
            var tunnels = [];
            _this.controlClient.tunnelList.forEach(function (tunnel) {
                tunnels.push({
                    id: tunnel.id,
                    status: tunnel.status,
                });
            });
            return {
                status: _this.controlClient.status,
                tunnels: tunnels,
            };
        };
        return _this;
    }
    Object.defineProperty(Tgrok.prototype, "debug", {
        set: function (v) {
            Log_1.default.debug = v;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tgrok.prototype, "timeout", {
        get: function () {
            var timeList = [1, 1, 2, 3, 5, 8, 13, 21];
            if (this.retryTimes >= timeList.length) {
                return timeList[timeList.length - 1];
            }
            return timeList[this.retryTimes];
        },
        enumerable: false,
        configurable: true
    });
    return Tgrok;
}(events.EventEmitter));
exports.default = Tgrok;
