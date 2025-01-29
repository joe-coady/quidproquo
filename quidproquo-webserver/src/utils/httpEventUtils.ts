import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { SeoEventResponse } from '../types';
import { HTTPEvent, HTTPEventResponse } from '../types/HTTPEvent';

export const rawFromJsonEventRequest = (httpJsonEvent: HTTPEvent): string | undefined => {
  const json = httpJsonEvent.isBase64Encoded && httpJsonEvent.body ? Buffer.from(httpJsonEvent.body, 'base64').toString() : httpJsonEvent.body;

  return json;
};

// TODO: Make a generator version of this
//       so we can throw errors with generators
export const fromJsonEventRequest = <T>(httpJsonEvent: HTTPEvent): T => {
  const json = rawFromJsonEventRequest(httpJsonEvent);

  if (!json) {
    throw new Error('Unable to parse undefined json body from event.');
  }

  // Parse the json out here...
  try {
    const item: T = JSON.parse(json);
    return item;
  } catch {
    throw new Error('Unable to parse incoming json body from event.');
  }
};

export function* askFromJsonEventRequest<T>(httpJsonEvent: HTTPEvent): AskResponse<T> {
  const json = rawFromJsonEventRequest(httpJsonEvent);

  if (!json) {
    return yield* askThrowError(ErrorTypeEnum.BadRequest, 'Unable to parse undefined json from event.');
  }

  // Parse the json out here...
  try {
    const item: T = JSON.parse(json);
    return item;
  } catch {
    return yield* askThrowError(ErrorTypeEnum.BadRequest, 'Unable to parse incoming json from event.');
  }
}

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

export const toTextResponse = (text: string, status: number = 200): HTTPEventResponse => {
  return {
    status,
    body: text,
    isBase64Encoded: false,
    headers: {
      'content-type': 'text/plain',
    },
  };
};

export const toMovedPermanentlyRedirectResponse = (location: string): HTTPEventResponse => {
  return {
    status: 301,
    isBase64Encoded: false,
    headers: {
      Location: location,
    },
  };
};

export const toMovedTemporarilyRedirectResponse = (location: string): HTTPEventResponse => {
  return {
    status: 302,
    isBase64Encoded: false,
    headers: {
      Location: location,
    },
  };
};

export const toCdnResponse = (status: number = 200): SeoEventResponse => {
  return {
    status,
    fallbackToCDN: true,
  };
};
