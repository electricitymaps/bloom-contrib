import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import React from 'react';
import socketIOClient from 'socket.io-client';

import Console from './components/console';
import Icon from './components/icon';
import ResultsTable from './components/resultstable';

const deSerializeError = (obj) => Object.assign(new Error(), { stack: undefined }, obj);

const socket = socketIOClient(window.location.origin);

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      connection: 'disconnected',
      integrations: [],
      selectedIntegration: null,
      username: null,
      password: null,
      token: null,
      results: [],
      logs: [],
    };
  }

  run = () => {
    const { selectedIntegration, username, password, token } = this.state;
    console.warn('selectedIntegration', selectedIntegration);

    if (!socket.connected) {
      return;
    }
    if (!selectedIntegration) {
      return;
    }

    console.log(`Running ${selectedIntegration}..`);
    socket.emit('run', {
      sourceIdentifier: selectedIntegration,
      username,
      password,
      token,
    });
  };

  componentDidMount() {
    socket.on('connect', () => {
      console.log('(re)connected');
      this.setState({ connection: 'connected ✔︎' });
      this.run();
    });

    socket.on('integrations', (integrations) => this.setState({ integrations }));
    socket.on('reconnecting', () => this.setState({ connection: 'reconnecting ⌛️' }));
    socket.on('runError', () => this.setState({ connection: 'error 💥' }));
    socket.on('runLogs', (logs) => {
      console.clear();
      console.log('############### EXECUTION LOGS ###############');
      logs.forEach((log) => {
        switch (log.level) {
          case 'warning':
            console.warn(log.obj);
            break;
          case 'error':
            console.error(deSerializeError(log.obj));
            break;
          default:
            console.log(log.obj);
        }
      });
      this.setState((prevState) => ({
        logs: [...prevState.logs, ...logs],
      }));
      console.log('############### END EXECUTION LOGS ###############');
    });
    socket.on('runResults', (results) => {
      // console.log('state:', results.state);
      console.table(results.activities);
      this.setState({
        connection: 'success ✔︎',
        results: results.activities,
      });
    });
    socket.on('openUrl', (url) => window.open(url));
  }

  handleChange = (event) => {
    this.setState({
      selectedIntegration: event.target.value,
      logs: [],
    });
  };

  handleClearLogs = () => {
    this.setState({
      logs: [],
    });
  };

  render() {
    const { connection, integrations, selectedIntegration, results, logs } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h2>Integration Playground</h2>
          <p>
            status: <span id="connection-state">{connection}</span>
          </p>
        </header>
        <div className="main-content-container">
          <Grid container spacing={4}>
            <Grid item xs={3}>
              <h3>How to test an integration</h3>
              <p>
                1/ Select an integration
                <br />
                2/ Fill out username/password if needed and press Run
                <br />
                3/ Open Chrome console to see results (any change in any field will trigger a
                re-run)
                <br />
              </p>
              <FormControl style={{ width: '100%' }}>
                <InputLabel htmlFor="age-simple">Integration</InputLabel>
                <Select
                  value={selectedIntegration || ''}
                  name="Integration"
                  displayEmpty
                  onChange={this.handleChange}
                >
                  {integrations.sort().map((integration) => (
                    <MenuItem key={integration} value={integration}>
                      {integration}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  label="Username"
                  type="username"
                  autoComplete="current-username"
                  margin="normal"
                  onChange={(event) =>
                    this.setState({
                      username: event.target.value,
                    })
                  }
                />
                <TextField
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  onChange={(event) =>
                    this.setState({
                      password: event.target.value,
                    })
                  }
                />
                <TextField
                  label="Token"
                  type="token"
                  autoComplete="current-token"
                  margin="normal"
                  onChange={(event) =>
                    this.setState({
                      token: event.target.value,
                    })
                  }
                />

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.run}
                  style={{ marginTop: '16px' }}
                >
                  Run <Icon type="double-arrow" />
                </Button>
              </FormControl>
            </Grid>
            <Grid item xs={9}>
              <ResultsTable data={results} />
            </Grid>
            <Grid item xs={12}>
              <Console logs={logs} onClearLogs={this.handleClearLogs} />
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default App;
