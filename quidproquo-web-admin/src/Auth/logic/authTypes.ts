import { Effect } from 'quidproquo-core';

export type AuthState = {
  username: string;
  password: string;
  isLoggedIn: boolean;
};

export enum AuthEffect {
  SetUsername = 'auth/SetUsername',
  SetPassword = 'auth/SetPassword',
}

export type AuthSetUsernameEffect = Effect<AuthEffect.SetUsername, string>;
export type AuthSetPasswordEffect = Effect<AuthEffect.SetPassword, string>;

export type AuthEffects = AuthSetUsernameEffect | AuthSetPasswordEffect;

export type AuthLoginPayload = {
  username: string;
  password: string;
};
