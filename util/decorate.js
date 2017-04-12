"use strict";

const _ = require('lodash');

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
module.exports = function decorate(fn, config){
    config = config || {};

    return function(arg){

        // if not an object, turn arg into an object
        if (!_.isObject(arg)){
            arg = {
                message: arg
            }
        }

        // add NODE_ENV
        if (!arg.NODE_ENV){
            arg.NODE_ENV = config.NODE_ENV || process.env.NODE_ENV || 'unknown'
        }

        // add the service
        if (!arg.service){
            arg.service = config.service || 'unknown'
        }

        // add the log type
        if (!arg.type){
            arg.type = 'unknown'
        }

        return fn(arg);
    }
};
