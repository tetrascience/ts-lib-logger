"use strict";

var _ = require('lodash');


/**
 * Decorate the logging function
 * 1. always add the service name and NODE_ENV
 * 2. turn string into object as well
 * 3. use 'unknown', if there is no value for the field
 *
 * @param {Function} fn The base logger function
 * @param {Object} config The logging config object
 * @returns {Function}
 */
module.exports = function decorate(fn, config) {
  config = config || {};

  return function (arg) {
    var UNKNOWN = 'unknown';

    // if not an object, turn arg into an object
    if (!_.isObject(arg)) {
      arg = {
        message: arg
      }
    }

    // add ENV
    if (!arg.env) {
      arg.env = config.env || process.env.ENV || UNKNOWN;
    }
    // add the service
    if (!arg.service_name) {
      arg.service_name = config.service_name || process.env.SERVICE_NAME || UNKNOWN;
    }

    // add the log type
    if (!arg.type) {
      arg.type = UNKNOWN;
    }

    return fn(arg);
  }
};
