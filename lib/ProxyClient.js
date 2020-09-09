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
var LocalClient_1 = require("./LocalClient");
var TgrokClient_1 = require("./TgrokClient");
var ProxyClient = /** @class */ (function (_super) {
    __extends(ProxyClient, _super);
    function ProxyClient(ctl) {
        var _this = _super.call(this) || this;
        _this.typeName = "pxy";
        _this.dataLength = 0;
        _this.onConnect = function () {
            _this.info("New connection to " + _this.host + ":" + _this.port);
            _this.send(_this.regProxy());
        };
        _this.onData = function (data) {
            if (_this.localClient) {
                _this.dataLength += data.length;
                return;
            }
            if (_this.recvBuffer) {
                _this.recvBuffer = Buffer.concat([_this.recvBuffer, data]);
            }
            else {
                _this.recvBuffer = data;
            }
            var headBuffer = _this.recvBuffer.slice(0, 8);
            var length = headBuffer.readUInt32LE(0);
            if (_this.recvBuffer.length < (8 + length)) {
                return;
            }
            _this.info("reading message with length: " + length);
            var raw = _this.recvBuffer.slice(8, length + 8).toString();
            _this.info("recv <<<< " + raw);
            var json = JSON.parse(raw);
            if (json.Type !== "StartProxy") {
                return;
            }
            var tunnel = lodash_1.find(_this.tunnelList, { url: json.Payload.Url });
            if (!tunnel || tunnel.status < 5) {
                if (_this.socket) {
                    _this.socket.destroy();
                }
                if (!tunnel) {
                    _this.info("No tunnel for " + json.Payload.Url + " found.");
                }
                else {
                    _this.info("Tunnel for " + json.Payload.Url + " is closed.");
                }
                return;
            }
            if (_this.socket != null) {
                _this.socket.pause();
            }
            _this.localClient = new LocalClient_1.default(_this, tunnel);
            _this.localClient.toSend(_this.recvBuffer.slice(8 + length));
            _this.recvBuffer = undefined;
            _this.localClient.start();
        };
        _this.onEnd = function () {
            if (!_this.localClient) {
                return;
            }
            _this.info(_this.dataLength + " bytes data transferred to prv:" + _this.localClient.name + " before closing");
            _this.localClient = undefined;
        };
        _this.regProxy = function () {
            return {
                /* tslint:disable */
                Type: "RegProxy",
                Payload: {
                    ClientId: _this.clientId,
                },
            };
        };
        _this.controlClient = ctl;
        _this.clientId = ctl.clientId;
        return _this;
    }
    Object.defineProperty(ProxyClient.prototype, "tunnelList", {
        get: function () {
            return this.controlClient.tunnelList;
        },
        enumerable: false,
        configurable: true
    });
    return ProxyClient;
}(TgrokClient_1.default));
exports.default = ProxyClient;
