import TruncatedText from './TruncatedText'; // Adjust the path as needed
import { useLogEvents } from './hooks';

import { Table, TableBody, TableCell, TableContainer, TableRow, Box } from '@mui/material';

interface LogDetailsProps {
  log: any;
}

export const LogDetails = ({ log }: LogDetailsProps) => {
  const events = useLogEvents(log);

  return (
    <Box sx={{ width: 1 }}>
      <TableContainer sx={{ overflowX: 'hidden' }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableBody>
            {events.map((e, i) => (
              <TableRow key={`${i}`}>
                <TableCell
                  sx={{
                    width: '200px',
                    paddingRight: '30px',
                    textAlign: 'right',
                    verticalAlign: 'top',
                    whiteSpace: 'break-spaces',
                  }}
                >
                  <div>
                    {new Date(e.dateTime).toLocaleTimeString('en-AU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div>{new Date(e.dateTime).toLocaleDateString('en-AU')}</div>
                  <div>{`${e.timeMs || 0} ms`}</div>
                </TableCell>
                <TableCell
                  sx={{
                    paddingLeft: '60px',
                    verticalAlign: 'top',
                    whiteSpace: 'break-spaces',
                    maxWidth: 'calc(100% - 200px - 30px - 60px)',
                  }}
                >
                  <TruncatedText
                    title={e.title as string}
                    subText={(e.subText || '') as string}
                    maxLength={128}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
