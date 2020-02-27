import React from 'react';

import {
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import Icon from './icon';


// As defined here: https://github.com/tmrowco/northapp-contrib/blob/master/playground/server/index.js#L77-L81
export const logLevels = new Set([
  'error',
  'warn',
  'debug',
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
          <Icon type="arrow-down" />
        ) : (
          <Icon type="arrow-up" />
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
        <Icon type="clear" />
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
        {[...logLevels].map(m => (
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
