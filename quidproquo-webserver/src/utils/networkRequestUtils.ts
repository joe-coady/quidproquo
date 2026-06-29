import {
  getExtensionForMimeType,
  getMimeTypeFromContentType,
  HTTPMethod,
  HTTPNetworkResponse,
  NetworkRequestActionPayload,
  QPQBinaryData,
} from 'quidproquo-core';

// Outgoing requests abort after this many milliseconds.
const REQUEST_TIMEOUT_MS = 25000;

// fetch cannot issue these methods - mirror the previous "not implemented" behaviour.
const unsupportedMethods: HTTPMethod[] = ['CONNECT'];

// Methods that must not carry a request body.
const bodylessMethods: HTTPMethod[] = ['GET', 'HEAD'];

// Matches axios' isAbsoluteURL: protocol (http:) or protocol-relative (//host).
const isAbsoluteUrl = (url: string): boolean => /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);

// Join basePath + url like axios' combineURLs (path concatenation), NOT URL
// resolution. `new URL('/v1/x', 'http://host/api/svc')` drops the base path
// because a leading-slash url is root-absolute; we want '.../api/svc/v1/x'.
const combineUrls = (basePath: string, url: string): string =>
  url ? `${basePath.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}` : basePath;

const buildRequestUrl = (payload: NetworkRequestActionPayload<any>): string => {
  const fullUrl =
    payload.basePath && !isAbsoluteUrl(payload.url) ? combineUrls(payload.basePath, payload.url) : payload.url;

  const url = new URL(fullUrl);

  Object.entries(payload.params || {}).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
};

const hasHeader = (headers: Record<string, string>, name: string): boolean =>
  Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());

const buildRequestInit = (payload: NetworkRequestActionPayload<any>, signal: AbortSignal): RequestInit => {
  const headers: Record<string, string> = { ...(payload.headers || {}) };

  let body: string | undefined;
  if (payload.body !== undefined && !bodylessMethods.includes(payload.method)) {
    if (typeof payload.body === 'string') {
      body = payload.body;
    } else {
      body = JSON.stringify(payload.body);

      if (!hasHeader(headers, 'content-type')) {
        headers['Content-Type'] = 'application/json';
      }
    }
  }

  return { method: payload.method, headers, body, signal };
};

const parseResponseData = async (payload: NetworkRequestActionPayload<any>, response: Response): Promise<any> => {
  if (payload.responseType === 'binary') {
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') || 'application/octet-stream';

    const contentDisposition = response.headers.get('content-disposition') || '';
    const filename = contentDisposition.match(/filename="([^"]+)"/)?.[1] || `file.${getExtensionForMimeType(getMimeTypeFromContentType(mimeType))}`;

    return {
      base64Data: buffer.toString('base64'),
      mimetype: mimeType,
      filename,
    } as QPQBinaryData;
  }

  const text = await response.text();

  if (payload.responseType === 'text') {
    return text;
  }

  // json
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const headersToRecord = (headers: Headers): Record<string, string> => {
  const record: Record<string, string> = {};

  headers.forEach((value, key) => {
    record[key] = value;
  });

  return record;
};

export const executeNetworkRequest = async <R>(payload: NetworkRequestActionPayload<any>): Promise<HTTPNetworkResponse<R>> => {
  if (unsupportedMethods.includes(payload.method)) {
    throw new Error(`Request method not implemented [${payload.method}]`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildRequestUrl(payload), buildRequestInit(payload, controller.signal));

    return {
      headers: headersToRecord(response.headers),
      status: response.status,
      statusText: response.statusText,
      data: await parseResponseData(payload, response),
    };
  } finally {
    clearTimeout(timeout);
  }
};
