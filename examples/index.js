const tsLogger = require('../index')('graylog', {
  graylogHost: 'localhostq',
  graylogPort: 12201,
});

tsLogger.log('something');
