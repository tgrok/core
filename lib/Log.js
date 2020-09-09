"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debug = false;
var Log = /** @class */ (function () {
    function Log() {
    }
    Object.defineProperty(Log, "debug", {
        set: function (newValue) {
            debug = newValue;
        },
        enumerable: false,
        configurable: true
    });
    Log.info = function (msg, show) {
        if (!debug && !show) {
            return;
        }
        /* tslint:disable */
        console.log(msg);
        /* tslint:enable */
    };
    Log.error = function (msg) {
        /* tslint:disable */
        console.log(msg);
        /* tslint:enable */
    };
    return Log;
}());
exports.default = Log;
