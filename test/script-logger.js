"use strict";

const chai = require('chai');
const expect = chai.expect;
require('mocha-sinon');


describe('script-logger', function () {

    beforeEach(function () {
        this.sinon.spy(console, 'error');
    });

    it('should be able to log to console in script style', function (done) {
        let logger = require('../')('script');
        logger.info({
            key: {
                key: {
                    key: {
                        key1: 1,
                        key2: 2,
                        key3: 3
                    }
                }
            }
        });
        logger.info(1);

        const logMsg = logger.info('some thing to notice');

        done();
    });

    it('should be able to log to console in script style with metadata', function (done) {
        let logger = require('../')('script');

        const logMsg = logger.info('some thing to notice');
        const loggedJson = console.error.getCall(0).args[0];
        //console.log(loggedJson);

        // parse the JSON and inspect.
        const result = JSON.parse(loggedJson);
        expect(console.error.calledOnce).to.be.true;
        expect(result).to.have.a.property("message");
        expect(result).to.have.a.property("level");
        expect(result).to.have.a.property("timestamp");
        expect(result.message).to.equal("some thing to notice");

        done();
    });


});