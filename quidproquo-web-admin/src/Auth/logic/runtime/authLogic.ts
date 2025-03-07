import { askAuthUISetPassword, askAuthUISetUsername } from '../authActionCreator';
import { askAuthLogin } from './askAuthLogin';
import { askAuthMain } from './askAuthMain';

export const authLogic = {
  askAuthLogin,
  askAuthMain,

  askAuthUISetUsername,
  askAuthUISetPassword,
};
