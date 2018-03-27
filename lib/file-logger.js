/**
 * Created by pengwei on 2/23/16.
 */

var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var moment = require('moment');
var mkdirp = require('mkdirp');

module.exports = function(config){
    var logDir = config.logDir;
    fs.existsSync(logDir) || mkdirp(logDir);

    var applicationLogStream = FileStreamRotator.getStream({
        filename : logDir + '/application-%DATE%.log',
        frequency: 'daily',
        verbose: false,
        date_format: "YYYY-MM-DD"
    });
    var maxLogLevel = config.maxLogLevel;
    function log(level){
        return function(content){
            if(level > maxLogLevel) return;
            var time_clf = moment().format('DD/MMM/YYYY:hh:mm:ss ZZ');
            var content_json, content_obj;
            content_obj = {time: time_clf, level: level, content: content}; // content can be obj or string
            content_json = JSON.stringify(content_obj) + '\n';
            applicationLogStream.write(content_json);
        }
    }

    return {
        emerg:  log(0),
        alert:  log(1),
        crit:   log(2),
        error:  log(3),
        warn:   log(4),
        notice: log(5),
        info:   log(6),
        log:    log(6),
        debug:  log(7)
    };
};