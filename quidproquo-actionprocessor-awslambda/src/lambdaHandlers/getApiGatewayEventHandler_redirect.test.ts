import { APIGatewayEvent, Context } from 'aws-lambda';
import { afterEach, describe, expect, it } from 'vitest';

import { getApiGatewayEventHandler_redirect } from './getApiGatewayEventHandler_redirect';

const runHandler = (event: Partial<APIGatewayEvent>) => getApiGatewayEventHandler_redirect()(event as APIGatewayEvent, {} as Context);

describe('getApiGatewayEventHandler_redirect', () => {
  afterEach(() => {
    delete process.env.redirectConfig;
    delete process.env.environment;
    delete process.env.featureEnvironment;
  });

  it('redirects straight to an absolute url', async () => {
    process.env.redirectConfig = JSON.stringify({ redirectUrl: 'https://example.com/go' });

    const response = await runHandler({ path: '/ignored', queryStringParameters: null });

    expect(response.statusCode).toBe(301);
    expect(response.headers?.Location).toBe('https://example.com/go');
  });

  it('builds a domain redirect preserving the request path', async () => {
    process.env.redirectConfig = JSON.stringify({ redirectUrl: 'example.com' });
    process.env.environment = JSON.stringify('production');

    const response = await runHandler({ path: '/page', queryStringParameters: null });

    expect(response.headers?.Location).toBe('https://example.com/page');
  });

  it('prefixes the environment for non-production domain redirects', async () => {
    process.env.redirectConfig = JSON.stringify({ redirectUrl: 'example.com', addEnvironment: true });
    process.env.environment = JSON.stringify('staging');

    const response = await runHandler({ path: '/page', queryStringParameters: null });

    expect(response.headers?.Location).toBe('https://staging.example.com/page');
  });

  it('prefixes the feature environment when configured', async () => {
    process.env.redirectConfig = JSON.stringify({ redirectUrl: 'example.com', addFeatureEnvironment: true });
    process.env.environment = JSON.stringify('production');
    process.env.featureEnvironment = JSON.stringify('beta');

    const response = await runHandler({ path: '/page', queryStringParameters: null });

    expect(response.headers?.Location).toBe('https://beta.example.com/page');
  });

  it('appends query string parameters to the redirect url', async () => {
    process.env.redirectConfig = JSON.stringify({ redirectUrl: 'https://example.com' });

    const response = await runHandler({ path: '/', queryStringParameters: { a: '1', b: 'two' } });

    expect(response.headers?.Location).toBe('https://example.com?a=1&b=two');
  });
});
