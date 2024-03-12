import { HTTPEvent, HTTPEventResponse } from '../types/HTTPEvent';

export const rawFromJsonEventRequest = (httpJsonEvent: HTTPEvent): string => {
  const json = httpJsonEvent.isBase64Encoded
    ? Buffer.from(httpJsonEvent.body, 'base64').toString()
    : httpJsonEvent.body;

  return json;
};

export const fromJsonEventRequest = <T>(httpJsonEvent: HTTPEvent): T => {
  const item: T = JSON.parse(rawFromJsonEventRequest(httpJsonEvent));
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

export const toHtmlResponse = (html: string, status: number = 200): HTTPEventResponse => {
  return {
    status,
    body: html,
    isBase64Encoded: false,
    headers: {
      'content-type': 'text/html',
    },
  };
};
