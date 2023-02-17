import { HTTPEvent, HTTPEventResponse } from '../types/HTTPEvent';

export const fromJsonEventRequest = <T>(httpJsonEvent: HTTPEvent): T => {
  const item: T = JSON.parse(
    httpJsonEvent.isBase64Encoded
      ? Buffer.from(httpJsonEvent.body, 'base64').toString()
      : httpJsonEvent.body,
  );

  return item;
};

export const toJsonEventResponse = (item: any, status: number = 200): HTTPEventResponse => {
  return {
    status,
    body: JSON.stringify(item),
    isBase64Encoded: false,
    headers: {
      'content-type': 'application/json',
    },
  };
};
