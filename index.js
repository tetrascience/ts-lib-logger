"use strict";

const _ = require('lodash');
const assert = require('assert');
const decorate = require('./util/decorate.js');
const graylogLogger = require('./lib/graylog-logger');
const fileLogger = require('./lib/file-logger');
const consoleLogger = require('./lib/console-logger');
const Joi = require('joi');

const commonTypes = {
    WORKER_CRASH: 'worker-crash',
    WORKER_START: 'worker-start',
    QUEUE_STALLED: 'queue-stalled',
    SERVICE_CRASH: 'service-crash',
    SERVICE_START: 'service-start',
    QUEUE_ANALYSIS_FAILED: 'queue-analysis-failed',
    UNCAUGHT_EXCEPTION: 'uncaught-exception',
    UNHANDLED_REJECTION: 'unhandled-rejection',
    UNKNOWN: 'unknown',
};
const configSchema = Joi.object().keys({
  throttle_wait: Joi.number().min(10),
  debug_mode: Joi.boolean(),
  service_name: Joi.string(),
  env: Joi.string(),
  tenant: Joi.string()
});

const transportSchema = Joi.string().allow(['graylog', 'console']);

/**
 * A factory function that creates a logger based on the config and transport
 * @param {String} transport 'graylog' or 'console'
 * @param {Object} config a config object fo the logger
 * @return {Object} logger
 */
let loggerFactory = function (transport, config) {

    Joi.assert(transport, transportSchema, `${transport} is not a valid transport.`);
    Joi.assert(config, configSchema, `${config} is not a valid config.`);

    let baseLogger;

    config = config || {};
    config.transport = transport;
    config.throttle_wait = config.throttle_wait || 1000;
    config.debug_mode = config.debug_mode || false;

    let consoleL = consoleLogger(config);

    // pick the base logger according to the transport
    // if there is no match, use console
    switch (transport) {
        case 'file':
            baseLogger = fileLogger(config);
            break;
        case 'graylog':
            baseLogger = graylogLogger(config);
            break;
        default:
            baseLogger = consoleL;
    }


    // create the new logger
    let logger = _.cloneDeep(baseLogger);

    // 1. decorate the base logger if base logger is NOT console
    // 2. always print to console if the base logger is NOT console AND it's debug mode
    if (transport !== 'console') {
        for (let method in baseLogger) {
            let originalFn = baseLogger[method];
            let decoratedFn = decorate(originalFn, config);

            // add console log to base logger in debug mode
            if (config.debug_mode) {
                logger[method]  = function (arg) {
                    decoratedFn(arg);
                    consoleL[method](arg);
                }
            } else {
                logger[method] = decoratedFn;
            }
        }
    }

    // add a throttle method to logger such that logs do not get too crazy
    // when there are hundreds of data points, the logs, if not throttled, can be overwhelming to digest/debug
    let throttledLogger = {};
    for (let method in baseLogger){
        throttledLogger[method] = _.throttle(logger[method], config.throttle_wait, { trailing: false });
    }
    logger.throttle = throttledLogger;

    // types
    logger.types = _.clone(commonTypes);
    logger.commonTypes = commonTypes;

    logger.extendTypes = (extraTypes)=>{
        logger.types = _.assign(logger.types, extraTypes);
    };

    logger.listTypes = () => logger.types;

    // attach the config object
    logger.config = config;
    return logger;
};


module.exports = loggerFactory;

