import { CloudFrontRequestEvent, Context } from 'aws-lambda';

export const getViewerRequestEventExecutor = () => {
  return async (event: CloudFrontRequestEvent, context: Context) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    const customUserAgentHeaderName = 'x-qpq-is-bot';
    const userAgent = headers['user-agent'][0]?.value || 'unknown';

    let isBot = userAgent.match(/bot|crawl|spider|slurp|facebot|facebookexternalhit/i);

    return {
      ...request,
      headers: {
        ...request.headers,
        [customUserAgentHeaderName]: [
          {
            key: customUserAgentHeaderName,
            value: isBot ? 'true' : 'false',
          },
        ],
      },
    };
  };
};

// Default executor
export const executeEventViewerRequest = getViewerRequestEventExecutor();
