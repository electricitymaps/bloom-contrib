import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default function ResultsTable(results) {
  return (
    <Paper style={{
      width: '100%',
      overflowX: 'auto',
      minHeight: '200px',
      textAlign: 'center',
    }}
    >
      {
        results.data.length === 0 
          ? <p>waiting for data</p> 
          : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  { results.data[0]
                    ? Object.keys(results.data[0]).map((key, index) => (
                      <TableCell key={`headercell-${key}`} align="right">
                        {key}
                      </TableCell>
                    )) : null
                  }   
                </TableRow>
              </TableHead>
              <TableBody>
                {results.data.map(row => (
                  <TableRow key={row.id}>
                    {Object.keys(row).map((key, index) => (
                      <TableCell key={`cell-${row.id}-${key}`} align="right">{row[key]}</TableCell>
                    ))
                    }   
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
      }
    </Paper>
  );
}
