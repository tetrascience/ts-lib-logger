"use strict";
const colors = require('colors/safe');
const inspect = require('util').inspect;

module.exports = function (config) {



    function processMessage(msg, level) {
        if (typeof msg == 'object') {
            msg.level = level;
            msg.timestamp = new Date().toJSON();
            msg = JSON.stringify(msg);
        }
        return msg;
    }

    function log(level) {
        return function (msg) {
            console.error(processMessage(msg, level));
        }
    }

    return {
        emerg: log(0),
        alert: log(1),
        crit: log(2),
        error: log(3),
        warn: log(4),
        notice: log(5),
        info: log(6),
        log: log(6),
        debug: log(7)
    };
};


