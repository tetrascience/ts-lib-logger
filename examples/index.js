const tsLogger = require('../index')('graylog', {
  graylogHost: 'localhostq',
  graylogPort: 12201,
});

tsLogger.log('something');

// const dgram = require('dgram');
//
// const server = dgram.createSocket('udp4');
//
// try {
//   server.send('something', 12201, 'heyhey', function(err){
//     console.log('in the call back');
//     console.error(err);
//   });
// } catch (err) {
//   console.log('something here');
//   console.error(err);
// }

