import React from 'react';

import {
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ClearIcon from '@material-ui/icons/Clear';

// Same as defined here in TS type: https://github.com/samdenty/console-feed#log-methods
const consoleMethods = new Set([
  'log',
  'warn',
  'error',
  'info',
  'debug',
  'command',
  'result',
]);

export default function ConsoleHeader({
  searchValue,
  updateSearchValue,
  filters,
  updateFilters,
  direction,
  updateDirection,
  onClearConsole,
}) {
  const handleFilterChange = (event) => {
    event.persist();
    const value = event && event.currentTarget && event.currentTarget.value;

    const updatedFilters = filters.includes(value)
      ? filters.filter(f => f !== value)
      : [...filters, value];
    updateFilters(updatedFilters);
  };

  const oppositeDirection = direction === 'descending' ? 'ascending' : 'descending';

  const filterButton = (
    <Tooltip
      title={`Sort output ${oppositeDirection}`}
      aria-label={`sort-output-${oppositeDirection}`}
    >
      <IconButton
        aria-label={`sort-${oppositeDirection}`}
        onClick={() =>
          updateDirection()
        }
      >
        {direction === 'descending' ? (
          <ArrowDownwardIcon />
        ) : (
          <ArrowUpwardIcon />
        )}
      </IconButton>
    </Tooltip>
  );

  const clearButton = (
    <Tooltip
      title="Clear console output"
      aria-label="clear-console-output"
    >
      <IconButton
        aria-label={`sort-${oppositeDirection}`}
        onClick={onClearConsole}
      >
        <ClearIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      <Grid item container direction="row" xs={12} sm={6}>
        {filterButton}
        <form noValidate autoComplete="off">
          <TextField
            id="console-search-value"
            label="Search console"
            variant="outlined"
            size="small"
            onChange={event => updateSearchValue(event.currentTarget.value)}
          >
            {searchValue}
          </TextField>
        </form>
      </Grid>
      <Grid item container xs={12} sm={6} justify="flex-end">
        {[...consoleMethods].map(m => (
          <FormControlLabel
            key={m}
            control={(
              <Checkbox
                value={m}
                checked={filters.includes(m)}
                onChange={handleFilterChange}
              />
              )
            }
            label={m}
            labelPlacement="bottom"
          />
        ))}
        {clearButton}
      </Grid>
    </>
  );
}
