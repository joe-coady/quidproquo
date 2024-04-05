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

  let isBot = userAgent.match(/bot|crawl|spider|slurp|facebot|facebookexternalhit/i);

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
