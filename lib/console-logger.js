"use strict";
const colors = require('colors/safe');
const inspect = require('util').inspect;

module.exports = function () {

    return {
        emerg: function (msg) {
            console.error(colors.magenta.bold(processMessage(msg)));
        },
        alert: function (msg) {
            console.error(colors.magenta(processMessage(msg)));
        },
        crit: function (msg) {
            console.error(colors.red.bold(processMessage(msg)));
        },
        error: function (msg) {
            console.error(colors.red(processMessage(msg)));
        },
        warn: function (msg) {
            console.log(colors.yellow(processMessage(msg)));
        },
        notice: function (msg) {
            console.log(colors.green.bold(processMessage(msg)));
        },
        info: function (msg) {
            console.log(colors.green(processMessage(msg)));
        },
        log: function (msg, level, timestamp) {
            console.log(colors.green(processMessage(msg, level, timestamp)));
        },
        debug: function (msg) {
            console.log(colors.gray(processMessage(msg)));
        },


    }
};

function processMessage(msg, level = null, timestamp = null) {
    if (typeof msg == 'object') {
        msg = inspect(msg);
    }

    const prefix = `${level ? `${level} `  : ""} ${timestamp ? `${timestamp} ` : ""}`;

    return prefix + msg;
}