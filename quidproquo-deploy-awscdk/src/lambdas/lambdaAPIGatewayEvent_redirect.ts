import { APIGatewayEvent, Context } from 'aws-lambda';
import { SubdomainRedirectQPQWebServerConfigSetting } from 'quidproquo-webserver';

export const executeAPIGatewayEvent = async (event: APIGatewayEvent, context: Context) => {
  const redirectConfig: SubdomainRedirectQPQWebServerConfigSetting = JSON.parse(
    process.env.redirectConfig as string,
  );

  // For direct urls ~ Go straight to the url
  let redirectUrl = redirectConfig.redirectUrl;

  // Otherwise it must be a domain redirect
  if (!redirectConfig.redirectUrl.startsWith('http')) {
    const environment: SubdomainRedirectQPQWebServerConfigSetting = JSON.parse(
      process.env.environment as string,
    );
    const featureEnvironment: SubdomainRedirectQPQWebServerConfigSetting = JSON.parse(
      process.env.featureEnvironment as string,
    );

    let baseDomain = redirectConfig.redirectUrl;
    if (redirectConfig.addEnvironment) {
      baseDomain = `${environment}.${baseDomain}`;
    }
    if (redirectConfig.addFeatureEnvironment && featureEnvironment) {
      baseDomain = `${featureEnvironment}.${baseDomain}`;
    }

    redirectUrl = `https://${baseDomain}${event.path}`;
  }

  return {
    statusCode: 301,
    body: '',
    headers: {
      Location: redirectUrl,
    },
  };
};
