import React from 'react';
import socketIOClient from "socket.io-client";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Grid,
} from '@material-ui/core';
import RunIcon from '@material-ui/icons/DoubleArrow';

import ResultsTable from './components/resultstable';

const deSerializeError = obj => Object.assign(new Error(), { stack: undefined }, obj);

const socket = socketIOClient('http://localhost:3333');

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      response: false,
      connection: 'disconnected',
      integrations: [],
      selectedIntegration: '',
      username: '',
      password: '',
      results: [],
    };
  }

  componentDidMount() {
    const { selectedIntegration, username, password } = this.state;

    const run = () => {
      if (!socket.connected) { return; }
      if (!selectedIntegration) { return; }
  
      console.log(`Running ${selectedIntegration.value}..`);
      socket.emit('run', {
        sourceIdentifier: selectedIntegration,
        username: username,
        password: password,
      });
    }

    socket.on('connect', () => {
      console.log('(re)connected');
      this.setState({ connection: 'connected ✔︎' })
      run();
    });

    socket.on('integrations', integrations => this.setState({ integrations }));
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

  handleChange = event => {
    this.setState({
      selectedIntegration: event.target.value
    });
    socket.emit('run', {
      sourceIdentifier: this.state.selectedIntegration,
      username: this.state.username,
      password: this.state.password,
    });
  }

  handleRun = () => {
    socket.emit('run', {
      sourceIdentifier: this.state.selectedIntegration,
      username: this.state.username,
      password: this.state.password,
    });
  }

  render() {

    const { connection, integrations, selectedIntegration } = this.state;
      return (
        <div className="App">
          <header className="App-header">
              <h2>Tomorrow App Playground</h2>
              <p>status: <span id="connection-state">{connection}</span></p>
          </header>
          <div className="main-content-container">
          <Grid container spacing={4}>
            <Grid item xs={3}>
              <h3>How to test an integration</h3>
                <p>
                  1/ Select an integration<br />
                  2/ Fill out username/password if needed<br />
                  3/ Open Chrome console to see results (any change in any field will trigger a re-run)<br />
                </p>

                <FormControl
                  style={{width: '100%'}}
                >
                  <InputLabel htmlFor="age-simple">Integration</InputLabel>
                  <Select
                    value={selectedIntegration}
                    name="Integration"
                    displayEmpty
                    onChange={this.handleChange}
                  >
                    {integrations.map(integration => (
                      <MenuItem key={integration} value={integration}>{integration}</MenuItem> 
                    ))}
                  </Select>
                  <TextField
                    label="Username"
                    type="username"
                    autoComplete="current-password"
                    margin="normal"
                    onChange={event => this.setState({
                      username: event.target.value
                    })}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    onChange={event => this.setState({
                      password: event.target.value
                    })}
                  />
                  <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.handleRun}
                  style={{marginTop: '16px'}}
                  >
                  Run
                  <RunIcon/>
                </Button>
                </FormControl>
                
              </Grid>
              <Grid item xs={9}>
                <ResultsTable data={this.state.results}/>
              </Grid>
          </Grid>
          </div>
        </div>
      );
    }
  }

export default App;
