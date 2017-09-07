"use strict";

var _ = require('lodash');
var assert = require('assert');
var decorate = require('./util/decorate.js');
var graylogLogger = require('./lib/graylog-logger');
var consoleLogger = require('./lib/console-logger');
var Joi = require('joi');
var dnsSync = require('dns-sync');

var string = Joi.string;
var number = Joi.number;
var boolean = Joi.boolean;

var transportOptions = ['graylog', 'console'];
var commonTypes = {
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
var configSchema = Joi.object().keys({
  transport: string().allow(transportOptions),
  throttle_wait: number().min(10).default(1000),
  debug_mode: boolean().default(true),
  service_name: string(),
  env: string(),
  tenant: string(),
  graylogHost: string().when('transport', {
    is: 'graylog',
    then: string().required(),
  }),
  graylogPort: number().default(12201),
}).options({
  stripUnknown: true,
});

var transportSchema = Joi.string().allow(transportOptions);

/**
 * A factory function that creates a logger based on the config and transport
 * @param {String} transport 'graylog' or 'console'
 * @param {Object} config a config object fo the logger
 * @return {Object} logger
 */
var loggerFactory = function (transport, config) {

  Joi.attempt(transport, transportSchema, `${transport} is not a valid transport.`);
  config = config || {};
  config.transport = transport;
  Joi.attempt(config, configSchema, `${config} is not a valid config.`);

  var baseLogger;

  config.throttle_wait = config.throttle_wait || 1000;

  var consoleL = consoleLogger(config);

  // pick the base logger according to the transport
  // if there is no match, use console
  switch (transport) {
    case 'graylog':
      if (dnsSync.resolve(config.graylogHost)){
        baseLogger = graylogLogger(config);
        break;
      }
    default:
      baseLogger = consoleL;
  }


  // create the new logger
  var logger = _.cloneDeep(baseLogger);

  // 1. decorate the base logger if base logger is NOT console
  // 2. always print to console if the base logger is NOT console AND it's debug mode
  if (transport !== 'console') {
    for (var method in baseLogger) {
      var originalFn = baseLogger[method];
      var decoratedFn = decorate(originalFn, config);

      // add console log to base logger in debug mode
      if (config.debug_mode) {
        logger[method] = function (arg) {
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
  var throttledLogger = {};
  for (var method in baseLogger) {
    throttledLogger[method] = _.throttle(logger[method], config.throttle_wait, {trailing: false});
  }
  logger.throttle = throttledLogger;

  // types
  logger.types = _.clone(commonTypes);
  logger.commonTypes = commonTypes;

  logger.extendTypes = function (extraTypes){
    logger.types = _.assign(logger.types, extraTypes);
  };

  logger.listTypes = function() {
    return logger.types;
  };

  // attach the config object
  logger.config = config;
  return logger;
};


module.exports = loggerFactory;

