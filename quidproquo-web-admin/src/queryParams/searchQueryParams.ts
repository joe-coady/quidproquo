import { QpqRuntimeType } from 'quidproquo-core';
import { createQpqRuntimeComputed, sharedQueryParamsRuntime } from 'quidproquo-web-react';

export const infoFilterQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state) => state.infoFilter || '');

export const runtimeTypeQueryParamComputed = createQpqRuntimeComputed(
  sharedQueryParamsRuntime,
  (state) => state.runtimeType || QpqRuntimeType.EXECUTE_STORY,
);
