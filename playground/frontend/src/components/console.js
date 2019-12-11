import React, { 
  useState, 
  useEffect,
} from 'react';
import { 
  Hook, Unhook, Console as ConsoleLib, Decode,
} from 'console-feed';

import { Grid, Paper, makeStyles } from '@material-ui/core';

import ConsoleHeader from './consoleheader';

const useStyles = makeStyles(theme => ({
  wrapper: {},
  header: {
    padding: theme.spacing(2),
  },
}));

/**
 * Sets up a hook to capture all console method calls
 * Don't use console.log calls within this component (and its children), since it will trigger an infinite loop!
 */
export default function Console() {
  const classes = useStyles();

  const [logs, setLogs] = useState([]);
  const [searchValue, setSearchValue] = useState();
  // See the constants for console methods defined in consoleHeader.js. If leaving empty, it will display all log entries
  const [filters, setFilters] = useState(['error']);
  const [direction, setDirection] = useState('descending');

  useEffect(() => {
    // eslint-disable-next-line arrow-parens
    Hook(window.console, log => {
      setLogs(oldLogs => [...oldLogs, Decode(log)]);
    });

    return () => window && Unhook(window.console);
  }, []);

  function handleClearConsole() {
    setLogs([]);
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
            updateDirection={setDirection}
            onClearConsole={handleClearConsole}
          />
        </Grid>
        <Grid item style={{ backgroundColor: 'grey', margin: '0px' }} xs={12}>
          <ConsoleLib
            logs={direction === 'descending' ? [...logs.reverse()] : [...logs]}
            variant="light" // TODO(df): If the whole playground would accept a theme, would be nice if this could be current viewers theme dependent.
            searchKeywords={searchValue}
            filter={filters}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
