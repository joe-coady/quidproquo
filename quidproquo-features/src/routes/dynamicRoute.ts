import { askCatch, AskResponse, askThrowError, ErrorTypeEnum, HTTPMethod } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils, RouteOptions } from 'quidproquo-webserver';

export type ExtractRouteParams<S extends string> = string extends S
  ? Record<string, string>
  : S extends `${infer _Start}{${infer Param}}${infer Rest}`
    ? { [K in Param | keyof ExtractRouteParams<Rest>]: string }
    : Record<never, never>;

type DynamicRouteErrorCode = number;
type DynamicRouteErrorCodeWithMessage = { code: number; message: string };

export type DynamicRouteKnownErrors = {
  [key: string]: DynamicRouteErrorCode | DynamicRouteErrorCodeWithMessage;
};

export const isDynamicRouteErrorCode = (value: DynamicRouteErrorCode | DynamicRouteErrorCodeWithMessage): value is DynamicRouteErrorCode =>
  typeof value === 'number';

export const dynamicRoute = <S extends string>(
  settings: [HTTPMethod, S] | [HTTPMethod, S, number] | [HTTPMethod, S, number, RouteOptions],
  runtime: (event: HTTPEvent, params: ExtractRouteParams<S>) => AskResponse<HTTPEventResponse>,
  knownErrors?: DynamicRouteKnownErrors,
) => {
  const [method, path, version, options] = settings;

  const wrapper = function* wrapper(event: HTTPEvent, params: ExtractRouteParams<S>) {
    const res = yield* askCatch(runtime(event, params));

    if (!res.success) {
      const allKnownErrors: DynamicRouteKnownErrors = {
        ...(knownErrors || {}),

        // Every endpoint maps validation failures to a 422 response
        [ErrorTypeEnum.Invalid]: 422,
      };

      if (allKnownErrors[res.error.errorType]) {
        const errorInfo = allKnownErrors[res.error.errorType];
        if (isDynamicRouteErrorCode(errorInfo)) {
          return qpqWebServerUtils.toJsonEventResponse(
            {
              error: ErrorTypeEnum.GenericError,
              errorText: res.error.errorText,
            },
            errorInfo,
          );
        }

        return qpqWebServerUtils.toJsonEventResponse(
          {
            error: ErrorTypeEnum.GenericError,
            errorText: errorInfo.message,
          },
          errorInfo.code,
        );
      }

      yield* askThrowError(res.error.errorType, res.error.errorText);
    }

    return res.result;
  };

  wrapper.dynamicRoute = { method, path, options, version: version || 1 };

  return wrapper;
};
