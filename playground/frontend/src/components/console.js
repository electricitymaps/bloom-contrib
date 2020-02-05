import React, { 
  useState, 
} from 'react';
import { 
  Console as ConsoleLib,
} from 'console-feed';

import { Grid, Paper, makeStyles } from '@material-ui/core';

import ConsoleHeader from './consoleheader';

/**
 * Maps log levels to console API methods
 * @param {*} logLevel 
 */
function mapLevelToMethods(logLevel) {
  switch (logLevel) {
    case 'debug':
      return 'log';
    default:
      return logLevel;
  }
}

/**
 * Converts server side logs (as defined: https://github.com/tmrowco/northapp-contrib/blob/master/playground/server/index.js#L71-L76) to internal console feed format
 * @param {*} logs 
 */
function transformToConsoleFeedFormat(logs) {
  return logs.map(l => ({ method: mapLevelToMethods(l.level), data: [l.obj] }));
}

const useStyles = makeStyles(theme => ({
  wrapper: {},
  header: {
    padding: theme.spacing(2),
  },
}));

export default function Console({ logs, onClearLogs }) {
  const classes = useStyles();

  const [searchValue, setSearchValue] = useState();
  // See the constants for console methods defined in consoleHeader.js. If leaving empty, it will display all log entries
  const [filters, setFilters] = useState([]);
  const [direction, setDirection] = useState('ascending');

  function handleClearConsole() {
    onClearLogs();
  }


  function handleDirectionChange() {
    setDirection(oldDirection => (oldDirection === 'descending' ? 'ascending' : 'descending'));
  }

  return (
    <Paper className={classes.wrapper}>
      <Grid container item direction="row" xs={12} spacing={0}>
        <Grid item container xs={12} className={classes.header}>
          <ConsoleHeader
            searchValue={searchValue}
            updateSearchValue={setSearchValue}
            filters={filters}
            updateFilters={setFilters}
            direction={direction}
            updateDirection={handleDirectionChange}
            onClearConsole={handleClearConsole}
          />
        </Grid>
        <Grid item style={{ backgroundColor: 'grey', margin: '0px' }} xs={12}>
          <ConsoleLib
            logs={direction === 'descending' ? transformToConsoleFeedFormat(logs).reverse() : transformToConsoleFeedFormat(logs)}
            variant="light" // TODO(df): If the whole playground would accept a theme, would be nice if this could be current viewers theme dependent.
            searchKeywords={searchValue}
            filter={filters.map(f => mapLevelToMethods(f))}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
