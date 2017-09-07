/* eslint-disable strict */

'use strict';

const MAJOR = parseInt(process.version.split('.')[0][1], 10);
if (MAJOR >= 6) {
  module.exports = require('./lib');
} else {
  module.exports = require('./es5');
}