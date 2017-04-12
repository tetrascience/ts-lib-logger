
"use strict";
const chai = require('chai');
const expect = chai.expect;


var decorate = require('../util/decorate.js');



describe('logger', function () {

    it('should be able to decorate a function correctly',function(done){
        let fn = function(arg){
            return arg;
        };

        let newFn = decorate(fn,{});
        const UNKNOWN = 'unknown';

        // pass in string
        expect(newFn('test')).to.have.property('service');
        expect(newFn('test')).to.have.property('message');
        expect(newFn('test').message).to.equal('test');
        expect(newFn('test')).to.have.property('NODE_ENV');
        expect(newFn('test')['service']).to.equal(UNKNOWN);

        // pass in error
        expect(newFn(new Error('test'))).to.have.property('service');
        expect(newFn(new Error('test'))).to.have.property('NODE_ENV');
        expect(newFn(new Error('test'))['service']).to.equal(UNKNOWN);

        // pass in generic object
        expect(newFn({hey:'yo'})).to.have.property('service');
        expect(newFn({hey:'yo'})['NODE_ENV']).to.equal(UNKNOWN);
        expect(newFn({hey:'yo'})).to.not.have.property('message');
        expect(newFn({hey:'yo'})).to.have.property('NODE_ENV');

        done()
    });

});