# ts-lib-logger

ts-lib-logger module integrates Graylog and console log. 
Based on the chosen transport, the logger will be sending logs to different destinations. 
You can read more about the [transports](#transports) and [features](#features) in the following sections. 

## Installation
```
npm install tetrascience/ts-lib-logger#docker --save

// if for production
npm install tetrascience/ts-lib-logger#docker --production
```

## Usage

### Overview
Pass in  the transport and a config object to the loggerFactory (require('ts-lib-logger')), such as

```
const TRANSPORT = 'graylog';
const config = {
    service: 'ts-microservice-1',
    NODE_ENV: 'customer-A'
};
const logger = require('ts-lib-logger')(TRANSPORT, config);

// error 
let err = new Error('something is wrong');
err.type = logger.types.SERVICE_CRASH;
logger.error(err);

// primitive type
logger.info(1);
logger.debug('Number of retry attempt: 17');

// obj
logger.info({
    key1: 'value1',
    key2: 'value2'
});
logger.info({
    message: 'something interesting',
    body: 'more detailed description'
});
```

You can pass in various types of things to log (object, error object, string, number), 
the logger makes sure that what you passed in is decorated with the proper meta data based from the config, 
transformed and adapted properly for the transport. 

Here are the transports we support
* [graylog](#transport-graylog)
* [console](#transport-console)

Beyond the transports, ts-logger also supports the following logging features
* [throttle](#feature-throttle)
* [debug mode]((#feature-debug-mode))
* [decoration](#feature-decoration)
* [type](#feature-type)


### Transports
#### Transport: `graylog`
```javascript
const logger = require('ts-lib-logger')('graylog', {
   graylogHost: 'http://localhost',
   graylogPort: '12201'
});
logger.info('something to log');
logger.debug({
    key1: 'value1',
    message: 'concise debug log',
    body: 'more detailed debug log'
})
logger.error(new Error('something bad'));
```
* Add the high level log to `message` and more detailed description to `body`. 
* If you pass in an error object, `error.message` will become the `message` and `error.stack` will become the `body`.
* If you pass a non-object (something like number or string), it will be converted into an object and the 
original input will be the `message` field. 
  
#### Transport: `console`
```javascript
const logger = require('ts-lib-logger')('console')
logger.info({
    key1: 'value1'
})
```
* If an object is passed in, require('util').inspect will be invoked (with default settings) 
to get a string representation of the object.
Read about util.inspect [here](https://nodejs.org/api/util.html#util_util_inspect_object_options).
* If you pass a non-object (something like number or string), it will be converted into an object and the 
original input will be the `message` field. 

#### Transport: `file`
This transport is NOT actively maintained, thus please do *NOT* use.


### Features

#### Feature: `throttle`
When your log happens very fast, it's helpful to throttle the logger. 
[Lodash's default throttling behavior](https://lodash.com/docs/4.17.4#throttle) is used here.  
A waiting time of 1 second by default is used. 
Be aware that since throttling is applied, some logs will not be printed out. 

> **Limitation**: in the current implementation, if you call `logger.throttle.<method>` multiple times
in the same process, but with different arguments, all the logs will be throttled together, leading 
to the possibility that some of the inputs will not be printed out.

```javascript
const logger = require('ts-lib-logger')('console');
logger.throttle.error(new Error('something wrong'));
logger.throttle.debug('a debug log');
```
You can adjust the throttle wait time by passing `throttle_wait` into the config object for the logger factory. For example:
```javascript
// print the log at most every 2 seconds
const logger = require('ts-lib-logger')('console',{throttle_wait: 2000);
logger.throttle.error(new Error('something wrong'));
logger.throttle.debug('a debug log');
```

#### Feature: `debug mode`
In debug mode, console transport will also be used *in addition to* the chosen transport, if it was not console transport. 
The debug mode can be set using `config.debug_mode`
```javascript
const logger = require('ts-lib-logger')('graylog', {
   graylogHost: 'http://localhost',
   graylogPort: '12201',
   debug_mode: true              // enable the debug mode using the config
});
logger.info('something to log'); // this will go to console as well

```
#### Feature: `decoration`
Input to the logger will always be converted into an object. 
If the original input is an string or number, it will become the `message` field of the object. 

The following fields in the config object will also be attached to that object: 
* `service`, which is used to tag the name of the service, such as *tspower*, *tsfeed* or etc,
* `NODE_ENV`, which is used to tag the application environment, such as *docker*, *customerA* and etc. 

#### Feature: `type`
It's highly recommended that you compile a list of well defined log types, such as *device-heartbeat*, *service-restart* and etc. 
It will help you to understand the distribution of your logs and quickly identify the logs of interest in your search. 
Refer to this [example](https://github.com/tetrascience/tsboss/blob/docker/utils/logger.js) from *tspower* service. All your log types can 
be accessed via `logger.types`. The logger will automatically attach `type = commonTypes.UNKNOWN` 
to the input if there is no log type. 

The logger provides a list of the common log types for you to use and you can access them using `logger.commonTypes`. 
These are the common types of logs in the context of distributed system and microservice. 
```javascript
const commonTypes = {
    WORKER_CRASH: 'worker-crash',
    WORKER_START: 'worker-start',
    QUEUE_STALLED: 'queue-stalled',
    SERVICE_CRASH: 'service-crash',
    SERVICE_START: 'service-start',
    QUEUE_ANALYSIS_FAILED: 'queue-analysis-failed',
    UNKNOWN: 'unknown'
};
```

You can take advantage of the common types like the following example and add extra types using `logger.extendTypes`. Be aware that
do NOT use hyphen in the key of the extra type object. 
```javascript
const tsLogger = require('ts-lib-logger');
const logger = tsLogger('graylog', config);
const extraTypes = {
    SERVICE_SPECIFIC_BAHAVIOR_1: 'service-specific-behavior-1',
    SERVICE_SPECIFIC_BAHAVIOR_2: 'service-specific-behavior-2'
};
// add your own log types
logger.extendTypes(extraTypes); 

// use one of the common log types
logger.info({
    type: logger.types.WORKER_CRASH,
    process_id: '897214'
});

// use the newly added type
let err = new Error('service specific error');
err.type = logger.types.SERVICE_SPECIFIC_BAHAVIOR_1;
logger.error(err);
```

## Test
```bash
npm install -g mocha
npm test
```

## Reference
More documentation can be found at
* https://tetrascience.atlassian.net/wiki/display/TSD/ts-logger
* https://tetrascience.atlassian.net/wiki/display/TSD/Log+Levels

## Todo: 
* sanitize the user input for the config obj
* let user config the throttling using config. 
* what if the log input is an array
* add logger.extendTypes as a function
* use the debug node module for debug log
* be more expilicit that this is a factory pattern
* Eliminate the limitation of the throttling, maybe use the following
```javascript
let tLogger = require('ts-lib-logger').getThrottledFunction('warn');
tLogger.warn('a');
tLogger.warn('b');

let tLogger1 = new logger.throttled('warn');
tLogger1.warn('a')

```
