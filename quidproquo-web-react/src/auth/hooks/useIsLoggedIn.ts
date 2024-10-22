import { useContext } from 'react';
import { authContext } from '../authContext';

export const useIsLoggedIn = () => {
  const authState = useContext(authContext);

  return !!authState.authenticationInfo?.accessToken;
};
