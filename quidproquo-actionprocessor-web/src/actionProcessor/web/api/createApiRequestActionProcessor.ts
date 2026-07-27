import { ActionProcessorList, ActionProcessorListResolver, actionResult, Nullable } from 'quidproquo-core';
import { ApiActionType, ApiRequestActionProcessor, preformNetworkRequest } from 'quidproquo-webserver';

export type ApiRequestActionProcessorOptions = {
  // Resolve the base url for a given service. The default ignores the service name
  // and targets api.<currentHost>, the single-backend case that covers most apps.
  resolveServiceBaseUrl?: (service: string) => string;

  // Provide headers to attach to every request, e.g. auth (any scheme), tracing,
  // tenant ids. Merged into (and overriding) the per-call headers. Default: none.
  getHeaders?: () => Nullable<Record<string, string>>;
};

const defaultResolveServiceBaseUrl = (_service: string): string => {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//api.${hostname}${port ? `:${port}` : ''}`;
};

// any/any: the processor serves every ApiRequestAction<T> regardless of body/response
// type, and T is contravariant in the action, so no single unknown-based signature fits.
const getProcessApiRequest = (options?: ApiRequestActionProcessorOptions): ApiRequestActionProcessor<any, any> => {
  return async ({ service, endpoint, method, body, params, headers, responseType }) => {
    const basePath = (options?.resolveServiceBaseUrl ?? defaultResolveServiceBaseUrl)(service);

    const res = await preformNetworkRequest({
      url: endpoint,
      basePath,
      method,
      body,
      params,
      responseType,
      headers: {
        ...headers,
        ...options?.getHeaders?.(),
      },
    });

    return actionResult(res);
  };
};

export const createApiRequestActionProcessor =
  (options?: ApiRequestActionProcessorOptions): ActionProcessorListResolver =>
  async (): Promise<ActionProcessorList> => ({
    [ApiActionType.Request]: getProcessApiRequest(options),
  });

// Zero-config default registered in the standard web processors.
export const getApiRequestActionProcessor: ActionProcessorListResolver = createApiRequestActionProcessor();
