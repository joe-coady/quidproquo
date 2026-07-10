import { memo } from 'react';
import { WelcomeScreen } from '@todo/design-service-views/WelcomeScreen';

const AppComponent = () => <WelcomeScreen />;

export const App = memo(AppComponent);
