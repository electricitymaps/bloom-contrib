import React, { useState, useEffect } from "react";
import { Hook, Unhook, Console as ConsoleLib, Decode } from "console-feed";

import { Grid, Paper, makeStyles } from "@material-ui/core";

import ConsoleHeader from "./ConsoleHeader";

const useStyles = makeStyles(theme => ({
  wrapper: {},
  header: {
    padding: theme.spacing(2)
  }
}));

export default function Console({}) {
  const classes = useStyles();

  const [logs, setLogs] = useState([]);
  const [searchValue, setSearchValue] = useState();
  // See the values for console methods defined in consoleHeader.js
  const [filters, setFilters] = useState(["error"]);
  const [direction, setDirection] = useState("descending");

  useEffect(() => {
    window &&
      Hook(window.console, log => {
        setLogs(logs => [...logs, Decode(log)]);
      });

    return () => window && Unhook(window.console);
  }, []);

  if (!logs.length) return null;

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
          />
        </Grid>
        <Grid item style={{ backgroundColor: "grey", margin: "0px" }} xs={12}>
          <ConsoleLib
            logs={direction === "descending" ? [...logs.reverse()] : logs}
            variant="light" // TODO(df): If the whole playground would accept a theme, would be nice if this could be current viewers theme dependent.
            searchKeywords={searchValue}
            filter={filters}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
