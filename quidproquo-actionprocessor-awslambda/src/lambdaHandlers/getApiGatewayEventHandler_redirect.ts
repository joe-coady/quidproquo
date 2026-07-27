import { SubdomainRedirectQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { APIGatewayEvent, Context } from 'aws-lambda';

/**
 * Standalone 301 handler for subdomain redirects. Reads its config from env vars
 * the CDK redirect construct JSON-encodes onto the function (redirectConfig,
 * environment, featureEnvironment); no qpq runtime involved.
 */
const apiGatewayEventHandler_redirect = async (event: APIGatewayEvent, context: Context) => {
  const redirectConfig: SubdomainRedirectQPQWebServerConfigSetting = JSON.parse(process.env.redirectConfig as string);

  // An absolute url redirects as-is; anything else is a domain redirect that
  // keeps the request path and optionally prefixes environment subdomains.
  let redirectUrl = redirectConfig.redirectUrl;

  if (!redirectConfig.redirectUrl.startsWith('http')) {
    const environment: string = JSON.parse(process.env.environment as string);
    const featureEnvironment: string = JSON.parse((process.env.featureEnvironment as string | undefined) || '""');

    let baseDomain = redirectConfig.redirectUrl;
    if (redirectConfig.addEnvironment && environment !== 'production') {
      baseDomain = `${environment}.${baseDomain}`;
    }

    if (redirectConfig.addFeatureEnvironment && featureEnvironment) {
      baseDomain = `${featureEnvironment}.${baseDomain}`;
    }

    redirectUrl = `https://${baseDomain}${event.path}`;
  }

  const queryParams = event.queryStringParameters;
  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
      .join('&');
    redirectUrl += `?${queryString}`;
  }

  return {
    statusCode: 301,
    body: '',
    headers: {
      Location: redirectUrl,
    },
  };
};

export const getApiGatewayEventHandler_redirect = () => apiGatewayEventHandler_redirect;
