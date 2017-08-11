"use strict";

const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');


describe('index', function () {

  beforeEach(function (done) {
    mockery.enable({useCleanCache: true});
    mockery.warnOnUnregistered(false);
    done();
  });

  afterEach(function (done) {
    mockery.resetCache();
    mockery.deregisterAll();
    done();
  });

  it('should be able to configure the throttle wait', function (done) {
    const logger = require('../')();
    expect(logger.config).to.have.property('throttle_wait');
    const logger2 = require('../')('console', {throttle_wait: 50});
    expect(logger2.config.throttle_wait).to.be.equal(50);
    expect(require('../').bind(null, 'console', {throttle_wait: -5})).to.throw(Error);
    done();
  });

  it('should be able to list common log types supported', function (done) {
    const logger = require('../')();
    const types = logger.listTypes();
    expect(typeof types).to.be.equal('object');
    expect(Object.keys(types).length).to.be.above(1);
    done();
  });

  it('should be able to extend the log types', function (done) {
    const logger = require('../')();
    const types = logger.listTypes();
    const originalNumKeys = Object.keys(types).length;
    logger.extendTypes({
      SOME_KEY_KEY: 'random-key-key'
    });
    const newTypes = logger.listTypes();
    const numKeys = Object.keys(newTypes).length;
    expect(numKeys - originalNumKeys).to.equal(1);
    done();
  });

  it('Should be able to decorate the base logger', function (done) {

    let decorateCount = 0;

    let decorateMock = function (fn) {
      decorateCount++;
      return fn;
    };

    let graylogMock = function () {
      return {
        info: function (arg) {
          logCount++;
          return arg;
        },
        debug: function (arg) {
          return arg;
        }
      }
    };

    mockery.registerMock('./util/decorate.js', decorateMock);
    mockery.registerMock('./lib/graylog-logger', graylogMock);

    let logger = require('../index.js')('graylog', {
      graylogHost: 'localhost',
    });

    expect(decorateCount).to.equal(2);
    done();
  });

  it('Should be able to invoke the proper function in the transport', function (done) {

    let logCount = 0;
    let graylogMock = function () {
      return {
        info: function (arg) {
          logCount++;
          return arg;
        },
        debug: function (arg) {
          logCount++;
          return arg;
        }
      }
    };

    mockery.registerMock('./lib/graylog-logger', graylogMock);

    let logger = require('../index.js')('graylog', {
      graylogHost: 'localhost',
    });
    logger.info('test');
    logger.debug('test');
    expect(logCount).to.equal(2);
    done();
  });

  it('Should be log to console in debug mode ', function (done) {

    let consoleCount = 0;

    let decorateMock = function (fn) {
      return fn;
    };

    let graylogMock = function () {
      return {
        info: () => {
        },
        debug: () => {
        }
      }
    };

    let consoleMock = function () {
      return {
        info: () => {
          consoleCount++;
        },
        debug: () => {
          consoleCount++;
        }
      }
    };


    mockery.registerMock('./util/decorate.js', decorateMock);
    mockery.registerMock('./lib/graylog-logger', graylogMock);
    mockery.registerMock('./lib/console-logger', consoleMock);


    const logger = require('../index.js')('graylog', {
      graylogHost: 'localhost'
    });
    const logger2 = require('../index.js')('graylog', {
      debug_mode: true,
      graylogHost: 'localhost',
    });
    logger.info('test');
    logger.debug('test');
    expect(consoleCount).to.equal(0);
    logger2.info('test');
    logger2.debug('test');
    expect(consoleCount).to.equal(2);
    done();
  });

  it('should be able to throttle the logging when transport is console', function (done) {
    let consoleCount = 0;

    const consoleMock = function () {
      return {
        info: () => {
          consoleCount++;
        }
      }
    };

    mockery.registerMock('./lib/console-logger', consoleMock);

    let logger = require('../')('console');

    let tick = setInterval(() => {
      logger.throttle.info(Math.random());
    }, 10);

    setTimeout(() => {
      clearInterval(tick);
    }, 800);

    setTimeout(() => {
      expect(consoleCount).to.be.equal(1);
      done();
    }, 1500);
  });

  it('should be able to throttle the logging when transport is graylog', function (done) {
    let consoleCount = 0;

    let graylogMock = function () {
      return {
        info: () => {
          consoleCount++;
        }
      }
    };

    mockery.registerMock('./lib/graylog-logger', graylogMock);
    let logger = require('../')('graylog', {
      graylogHost: 'localhost',
    });

    let tick = setInterval(() => {
      logger.throttle.info(Math.random());
    }, 10);

    setTimeout(() => {
      clearInterval(tick);
    }, 800);

    setTimeout(() => {
      expect(consoleCount).to.be.equal(1);
      done();
    }, 1500);
  });

});