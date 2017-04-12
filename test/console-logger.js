"use strict";


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