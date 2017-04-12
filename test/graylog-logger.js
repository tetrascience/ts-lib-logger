"use strict";

const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');


describe('graylog-logger',function(){

    beforeEach(function(done){
        mockery.enable({ useCleanCache: true });
        mockery.warnOnUnregistered(false);
        done();
    });

    afterEach(function(done){
        mockery.resetCache();
        mockery.deregisterAll();
        done();
    });


    it('Should be able to transform the content passed in', function(done){

        const graygelfMock = function(){
            return {
                raw : function(arg) { return arg; }
            }
        };


        mockery.registerMock('graygelf',graygelfMock);

        let logger = require('../lib/graylog-logger.js')({});

        expect(logger.warn({hey: 'yo'})).to.have.property('short_message');
        expect(logger.warn({hey: 'yo'})['short_message']).to.equal('_');
        expect(logger.warn({hey: 'yo'})).to.have.property('_hey');

        expect(logger.warn(new Error('test'))).to.have.property('short_message');
        expect(logger.warn(new Error('test'))).to.not.have.property('_message');
        expect(logger.warn(new Error('test'))['short_message']).to.equal('test');

        expect(logger.warn({message: '1', body: '2'})).to.have.property('full_message');
        expect(logger.warn({message: '1', body: '2'})['full_message']).to.equal('2');

        expect(logger.warn('random')).to.have.property('short_message');
        done();

    });

    it('Should contain all the log levels', function(done){
        let logger = require('../lib/graylog-logger.js')({});
        expect(Object.keys(logger).length).to.equal(9); // 8 level, there is an alias called 'log -> info'
        done();
    });

});