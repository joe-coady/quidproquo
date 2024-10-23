import { CartesianGrid, Legend,Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Typography } from '@mui/material';

import { useRequestsByService } from '../hooks/useRequestsByService';
import { SearchParams } from '../types';

interface RequestsByServiceProps {
  logs: any[];
  searchParams: SearchParams;
}

export const RequestsByService = ({ logs, searchParams }: RequestsByServiceProps) => {
  const data = useRequestsByService(logs, searchParams);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Requests by Service
      </Typography>
      <LineChart width={1200} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        {Object.keys(data[0] || {})
          .filter((key) => key !== 'time')
          .map((service) => (
            <Line key={service} type="monotone" dataKey={service} stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
          ))}
      </LineChart>
    </>
  );
};
