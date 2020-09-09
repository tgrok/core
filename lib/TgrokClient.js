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
var tls = require("tls");
var Client_1 = require("./Client");
var TgrokClient = /** @class */ (function (_super) {
    __extends(TgrokClient, _super);
    function TgrokClient() {
        var _this = _super.call(this) || this;
        _this.start = function (host, port, context) {
            _this.host = host;
            _this.port = 4443;
            if (typeof port === "object") {
                context = port;
            }
            else if (typeof port === "number") {
                _this.port = port;
            }
            _this.context = context;
            _this.connect();
        };
        _this.connect = function () {
            _this.info("connecting");
            if (_this.port == null) {
                return;
            }
            _this.socket = tls.connect(_this.port, _this.host, _this.context, _this.onConnect);
            _this.socket.on("data", _this.onData);
            _this.socket.on("end", _this.onEnd);
            _this.socket.on("error", _this.onError);
        };
        _this.send = function (data) {
            if (_this.socket == null) {
                return;
            }
            if (typeof data === "object") {
                data = JSON.stringify(data);
            }
            var headBuffer = Buffer.alloc(8);
            headBuffer.writeUInt32LE(Buffer.byteLength(data), 0);
            _this.socket.write(headBuffer);
            _this.info("send >>>> " + data);
            _this.socket.write(data);
        };
        _this.onEnd = function () {
            _this.socket = undefined;
        };
        return _this;
    }
    return TgrokClient;
}(Client_1.default));
exports.default = TgrokClient;
