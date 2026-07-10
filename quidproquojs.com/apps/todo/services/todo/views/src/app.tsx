import { memo } from 'react';

import { TodoList } from './components/TodoList/TodoList';

const AppComponent = () => <TodoList />;

export const App = memo(AppComponent);
