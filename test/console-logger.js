"use strict";

const chai = require('chai');
const expect = chai.expect;
require('mocha-sinon');

describe('console-logger', function () {

    it('should be able to log to console',function(done){
        let logger = require('../')('console');
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
        logger.info('some thing to notice');
        done();
    });



});

describe ('console-logger log method-with-defaults', function(){
    beforeEach(function () {
        this.sinon.spy(console, 'log');
    });

    it('should be able to log to console with level and timestamp info',function(done){
        let logger = require('../')('console');
        const timeStamp = "2018-03-21T22:27:03.085Z";
        logger.log("message", 1, timeStamp);
        const loggedMessage = console.log.getCall(0).args[0];
        expect(loggedMessage).to.contain("message");
        expect(loggedMessage).to.contain(timeStamp);
        console.log(loggedMessage);

        logger.info(1);
        logger.info('some thing to notice');
        done();
    });
});