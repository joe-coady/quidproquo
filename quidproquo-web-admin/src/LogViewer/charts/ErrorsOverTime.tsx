import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Typography } from '@mui/material';
import { useErrorsOverTime } from '../hooks/useErrorsOverTime';
import { SearchParams } from '../types';

interface ErrorsOverTimeProps {
logs: any[];
searchParams: SearchParams;
}

export const ErrorsOverTime = ({ logs, searchParams }: ErrorsOverTimeProps) => {
const data = useErrorsOverTime(logs, searchParams);

return (
<>
<Typography variant="h5" gutterBottom>
Errors Over Time
</Typography>
<LineChart width={1200} height={300} data={data}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="time" />
<YAxis />
<Tooltip />
<Legend />
<Line type="monotone" dataKey="errors" stroke="#8884d8" activeDot={{ r: 8 }} />
</LineChart>
</>
);
};