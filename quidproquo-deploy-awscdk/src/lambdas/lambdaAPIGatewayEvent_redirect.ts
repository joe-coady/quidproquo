import { APIGatewayEvent, Context } from 'aws-lambda';
import { SubdomainRedirectQPQWebServerConfigSetting } from 'quidproquo-webserver';
import { qpqFunctionMiddleware } from './lambda-utils';

export const apiGatewayEventHandler = async (event: APIGatewayEvent, context: Context) => {
  console.log('event: ', JSON.stringify(event, null, 2));
  console.log('process.env: ', JSON.stringify(process.env, null, 2));

  const redirectConfig: SubdomainRedirectQPQWebServerConfigSetting = JSON.parse(
    process.env.redirectConfig as string,
  );

  // For direct urls ~ Go straight to the url
  let redirectUrl = redirectConfig.redirectUrl;

  // Otherwise it must be a domain redirect
  if (!redirectConfig.redirectUrl.startsWith('http')) {
    const environment: string = JSON.parse(process.env.environment as string);

    const featureEnvironment: string = JSON.parse(
      (process.env.featureEnvironment as string | undefined) || '""',
    );

    let baseDomain = redirectConfig.redirectUrl;
    if (redirectConfig.addEnvironment && environment !== 'production') {
      baseDomain = `${environment}.${baseDomain}`;
    }

    if (redirectConfig.addFeatureEnvironment && featureEnvironment) {
      baseDomain = `${featureEnvironment}.${baseDomain}`;
    }

    redirectUrl = `https://${baseDomain}${event.path}`;
  }

  // Add query parameters if they exist
  const queryParams = event.queryStringParameters;
  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .filter(([, value]) => value !== undefined) // Filter out undefined values
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

export const executeAPIGatewayEvent = qpqFunctionMiddleware(apiGatewayEventHandler);
