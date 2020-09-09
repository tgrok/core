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
var net = require("net");
var Client_1 = require("./Client");
var event_1 = require("./event");
var LocalClient = /** @class */ (function (_super) {
    __extends(LocalClient, _super);
    function LocalClient(proxy, tunnel) {
        var _this = _super.call(this) || this;
        _this.typeName = "prv";
        _this.isConnected = false;
        _this.start = function () {
            _this.info("connecting");
            _this.socket = net.connect(_this.tunnel.localPort, _this.tunnel.localHost, _this.onConnect);
            _this.socket.on("data", _this.onData);
            _this.socket.on("end", _this.onEnd);
            _this.socket.on("error", _this.onError);
        };
        _this.toSend = function (data) {
            _this.recvBuffer = data;
        };
        _this.onConnect = function () {
            _this.isConnected = true;
            _this.info("connected to local");
            // connect proxy and client
            var proxySocket = _this.proxyClient.getSocket();
            if (!_this.socket || !proxySocket) {
                return;
            }
            _this.socket.pipe(proxySocket);
            proxySocket.pipe(_this.socket);
            if (_this.recvBuffer) {
                _this.socket.write(_this.recvBuffer.toString());
            }
            _this.recvBuffer = undefined;
            proxySocket.resume();
        };
        _this.onEnd = function () {
            _this.info("closing");
            _this.socket = undefined;
            _this.isConnected = false;
        };
        _this.onError = function (err) {
            if (!_this.proxyClient || !_this.proxyClient.getSocket()) {
                _this.info("remote socket not available");
                return;
            }
            var body = "<html>\n<body style=\"background-color: #97a8b9\">\n  <div style=\"margin:auto; width:400px;padding: 20px 60px; background-color: #D3D3D3; border: 5px solid maroon;\">\n    <h2>Tunnel " + _this.tunnel.url + " unavailable</h2>\n    <p>Unable to initiate connection to <strong>" + _this.tunnel.localPort + "</strong>.\n    A web server must be running on port <strong>" + _this.tunnel.localPort + "</strong> to complete the tunnel.</p>\n";
            var header = "HTTP/1.0 502 Bad Gateway\n  Content-Type: text/html\n  Content-Length: " + body.length + "\n\n  " + body;
            var socket = _this.proxyClient.getSocket();
            if (socket) {
                socket.write(header);
                socket.end();
            }
            var error = "A web server must be running on port " + _this.tunnel.localPort + " to complete the tunnel.";
            event_1.default.emit("info", {
                evt: "tunnel:error",
                payload: {
                    id: _this.tunnel.id,
                    error: error,
                },
            });
            _this.info(error, true);
        };
        _this.proxyClient = proxy;
        _this.tunnel = tunnel;
        return _this;
    }
    return LocalClient;
}(Client_1.default));
exports.default = LocalClient;
