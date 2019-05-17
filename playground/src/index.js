// Import all integrations that should/can be tested
import * as electricityContribSources from '../../integrations/electricity'; // eslint-disable-line
import * as transportationContribSources from '../../integrations/transportation'; // eslint-disable-line
const sourceInstances = {
  ...electricityContribSources,
  ...transportationContribSources,
};

// Polyfill to mimic react-native environment
global.fetch = require('node-fetch');

const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

app.use('/vendor', express.static(path.join(__dirname, 'vendor')));

const serializeError = e => ({
  name: e.name,
  message: e.message,
  stack: e.stack,
  code: e.code,
});

io.on('connection', (socket) => {
  console.log('client connected');

  socket.emit('integrations', Object.keys(sourceInstances));

  socket.on('run', async (data) => {
    console.log(`running ${data.sourceIdentifier}..`);
    const sourceInstance = sourceInstances[data.sourceIdentifier];
    const log = [];
    const pushLog = (level, obj) => log.push({
      key: log.length.toString(),
      datetime: new Date(),
      level,
      obj: (obj instanceof Error) ? serializeError(obj) : obj,
    });
    const logger = {
      logDebug: obj => pushLog('debug', obj),
      logWarning: obj => pushLog('warning', obj),
      logError: obj => pushLog('error', obj),
    };
    const requestWebView = () => { throw Error('NotImplemented'); };
    const requestLogin = () => ({ username: data.username, password: data.password });
    try {
      pushLog('debug', 'starting connect()');
      const initState = await sourceInstance.connect(requestLogin, requestWebView, logger);
      pushLog('debug', `initial state: ${JSON.stringify(initState)}`);
      pushLog('debug', 'collect()');
      const results = await sourceInstance.collect(initState, logger);
      pushLog('debug', `obtained ${(results.activities || []).length} activities`);
      pushLog('debug', `new state: ${JSON.stringify(results.state)}`);
      pushLog('debug', 'done');
      socket.emit('runLogs', log);
      socket.emit('runResults', results);
    } catch (e) {
      // console.error(e)
      logger.logError(e);
      socket.emit('runLogs', log);
      socket.emit('runError', serializeError(e));
    }
    console.log('..done');
  });
});

app.get('/', (req, res) => { res.sendFile('index.html', { root: __dirname }); });

server.listen(3000, () => {
  console.log('Listening on *:3000');
});
