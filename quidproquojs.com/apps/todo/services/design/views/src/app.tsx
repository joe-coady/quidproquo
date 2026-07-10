import { memo } from 'react';

import { WelcomeScreen } from './components/WelcomeScreen/WelcomeScreen';

const AppComponent = () => <WelcomeScreen />;

export const App = memo(AppComponent);
