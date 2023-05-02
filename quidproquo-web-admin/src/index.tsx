import { createRoot } from 'react-dom/client';

const App = () => {
  return <div>Hello world</div>;
};

const domNode = document.getElementById('root');
const root = createRoot(domNode!);

root.render(<App />);
