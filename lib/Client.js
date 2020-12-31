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
var dayjs = require("dayjs");
// @ts-ignore
var randomatic = require("randomatic");
var Log_1 = require("./Log");
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client() {
        var _this = _super.call(this) || this;
        _this.name = "";
        _this.typeName = "";
        _this.getSocket = function () {
            return _this.socket;
        };
        _this.info = function (msg, show) {
            var time = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
            Log_1.default.info("[" + time + "] [" + _this.typeName + ":" + _this.name + "] " + msg, show);
        };
        _this.onData = function (data) {
            // on data
        };
        _this.onEnd = function () {
            _this.emit("end");
        };
        _this.onError = function (err) {
            _this.info('error');
            // tslint:disable-next-line:no-console
            console.log(err);
            // this.emit("error", err)
        };
        _this.name = randomatic('a0', 8);
        return _this;
    }
    Client.prototype.onConnect = function () {
        this.emit("connect", this.socket);
    };
    return Client;
}(events.EventEmitter));
exports.default = Client;
