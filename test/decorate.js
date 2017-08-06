
"use strict";
const chai = require('chai');
const expect = chai.expect;


var decorate = require('../util/decorate.js');



describe('logger', function () {

    it('should be able to decorate a function correctly',function(done){
        let fn = function(arg){
            return arg;
        };

        const env = 'some env';
        let newFn = decorate(fn,{
            env,
        });

        // pass in string
        expect(newFn('test')).to.have.property('service_name');
        expect(newFn('test')).to.have.property('message');
        expect(newFn('test').message).to.equal('test');
        expect(newFn('test')).to.have.property('env');
        expect(newFn('test').env).to.equal(env);

        // pass in error
        expect(newFn(new Error('test'))).to.have.property('service_name');
        expect(newFn(new Error('test'))).to.have.property('env');
        expect(newFn(new Error('test')).env).to.equal(env);

        // pass in generic object
        expect(newFn({hey:'yo'})).to.have.property('service_name');
        expect(newFn({hey:'yo'}).env).to.equal(env);
        expect(newFn({hey:'yo'})).to.not.have.property('message');
        expect(newFn({hey:'yo'})).to.have.property('env');

        done()
    });

});