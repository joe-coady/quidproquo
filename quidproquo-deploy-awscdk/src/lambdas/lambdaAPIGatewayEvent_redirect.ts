import { APIGatewayEvent, Context } from 'aws-lambda';
import { SubdomainRedirectQPQWebServerConfigSetting } from 'quidproquo-webserver';

export const executeAPIGatewayEvent = async (event: APIGatewayEvent, context: Context) => {
  const redirectConfig: SubdomainRedirectQPQWebServerConfigSetting = JSON.parse(
    process.env.redirectConfig as string,
  );

  // For direct urls ~ Go straight to the url
  if (redirectConfig.redirectUrl.startsWith('http')) {
    return {
      statusCode: 301,
      body: '',
      headers: {
        Location: redirectConfig.redirectUrl,
      },
    };
  }

  // Otherwise it must be a domain redirect
  const environment: SubdomainRedirectQPQWebServerConfigSetting = JSON.parse(
    process.env.environment as string,
  );
  const baseDomain = redirectConfig.addFeatureEnvironment
    ? `${environment}.${redirectConfig.redirectUrl}`
    : redirectConfig.redirectUrl;

  const fullUrl = `https://${baseDomain}${event.path}`;

  return {
    statusCode: 301,
    body: '',
    headers: {
      Location: fullUrl,
    },
  };
};
