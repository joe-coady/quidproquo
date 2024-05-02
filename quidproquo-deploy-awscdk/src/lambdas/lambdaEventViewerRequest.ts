import { CloudFrontRequestEvent, Context } from 'aws-lambda';
import { qpqHeaderIsBot } from 'quidproquo-webserver';

export const viewerRequestEventHandler = async (
  event: CloudFrontRequestEvent,
  context: Context,
) => {
  console.log(JSON.stringify(event));

  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const userAgent = headers['user-agent'][0]?.value || 'unknown';

  // let isBot = userAgent.match(/bot|crawl|spider|slurp|facebot|facebookexternalhit/i);

  // Bot testing for integrating Prerender ~ you then do what you want inside the app business logic
  // For more info: https://docs.prerender.io/docs/apache-2
  let isBot = userAgent.match(
    /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp|redditbot|applebot|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify|bitrix link preview|xing-contenttabreceiver|google-inspectiontool|chrome-lighthouse|telegrambot/i,
  );

  return {
    ...request,
    headers: {
      ...request.headers,
      [qpqHeaderIsBot]: [
        {
          key: qpqHeaderIsBot,
          value: isBot ? 'true' : 'false',
        },
      ],
    },
  };
};

// Default executor
export const executeEventViewerRequest = viewerRequestEventHandler;
