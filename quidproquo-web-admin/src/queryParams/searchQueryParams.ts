import { QpqRuntimeType } from 'quidproquo-core';
import { createQpqRuntimeComputed, sharedQueryParamsRuntime } from 'quidproquo-web-react';

export const infoFilterQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state) => state.infoFilter || '');

export const runtimeTypeQueryParamComputed = createQpqRuntimeComputed(
  sharedQueryParamsRuntime,
  (state): string => state.runtimeType?.[0] || QpqRuntimeType.EXECUTE_STORY,
);

export const userQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): string => state.user?.[0] || '');
export const infoQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): string => state.info?.[0] || '');
export const errorQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): string => state.error?.[0] || '');
export const deepQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): string => state.deep?.[0] || '');
export const correlationQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): string => state.correlation?.[0] || '');
export const tabQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): number => parseInt(state.tab?.[0] || '0'));

export const serviceQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): string => state.service?.[0] || '');

export const startDateQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): Date => {
  const dateStr = state.startIsoDateTime?.[0];
  return dateStr ? new Date(dateStr) : new Date();
});

export const endDateQueryParamComputed = createQpqRuntimeComputed(sharedQueryParamsRuntime, (state): Date => {
  const dateStr = state.endIsoDateTime?.[0];
  return dateStr ? new Date(dateStr) : new Date();
});
