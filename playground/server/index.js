// Polyfill to mimic react-native environment
global.fetch = require('node-fetch');

// Import all integrations that should/can be tested
import * as electricityContribSources from '../../integrations/electricity'; // eslint-disable-line
import * as purchaseContribSources from '../../integrations/purchase'; // eslint-disable-line
import * as transportationContribSources from '../../integrations/transportation'; // eslint-disable-line

const sourceImplementations = {
  ...electricityContribSources,
  ...purchaseContribSources,
  ...transportationContribSources,
};

const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server, { pingInterval: 5000 });

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config.js');

app.use(express.static('./public'));

app.use('/vendor', express.static(path.join(__dirname, 'vendor')));

const devServerEnabled = true;

if (devServerEnabled) {
  // reload=true:Enable auto reloading when changing JS files or content
  // timeout=1000:Time from disconnecting from server to reconnecting
  config.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000');

  // Add HMR plugin
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  const compiler = webpack(config);

  // Enable "webpack-dev-middleware"
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }));

  // Enable "webpack-hot-middleware"
  app.use(webpackHotMiddleware(compiler));
}

const serializeError = e => ({
  name: e.name,
  message: e.message,
  stack: e.stack,
  code: e.code,
});

const oauthCallbackUrl = 'http://localhost:3000/oauth_callback';
let resolveWebView = null;

io.on('connection', (socket) => {
  console.log('client connected');

  socket.emit('integrations', Object.keys(sourceImplementations));

  socket.on('run', async (data) => {
    console.log(`running ${data.sourceIdentifier}..`);
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

    const sourceImplementation = sourceImplementations[data.sourceIdentifier];
    if (!sourceImplementation) {
      logger.logError(new Error(`Unknown integration "${data.sourceIdentifier}"`));
    }

    const requestLogin = () => ({ username: data.username, password: data.password });
    const requestWebView = (url, callbackUrl) => {
      return new Promise((resolve, reject) => {
        if (callbackUrl !== oauthCallbackUrl) {
          reject(new Error(`Invalid OAuth callback url ${callbackUrl}. Should be ${oauthCallbackUrl}`));
        } else {
          resolveWebView = resolve;
          socket.emit('openUrl', url);
        }
      });
    };
    try {
      pushLog('debug', '## start connect()');
      const initState = await sourceImplementation.connect(requestLogin, requestWebView, logger);
      pushLog('debug', '## end connect()');
      pushLog('debug', `## initial state: ${JSON.stringify(initState)}`);
      pushLog('debug', '## start collect()');
      const results = await sourceImplementation.collect(initState, logger);
      pushLog('debug', `## obtained ${(results.activities || []).length} activities`);
      pushLog('debug', `## new state: ${JSON.stringify(results.state)}`);
      pushLog('debug', '## end collect()');
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


app.get('/oauth_callback', (req, res) => {
  // Fulfill promise and make sure client closes the window
  resolveWebView(req.query);
  res.send('<script type="text/javascript">window.close()</script>');
});
app.use(express.static('./public'));

server.listen(3000, () => {
  console.log('Listening on *:3000');
});
