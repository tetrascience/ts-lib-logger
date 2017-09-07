const tsLogger = require('../lib/index')('graylog', {
  graylogHost: 'localhostq',
  graylogPort: 12201,
});

tsLogger.log('something');
