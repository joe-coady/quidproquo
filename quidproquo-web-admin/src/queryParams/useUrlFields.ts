import { LogLevelEnum, LogLevelEnumLookup } from 'quidproquo-core';
import { askSyncParams, sharedQueryParamsRuntime, useFieldBinding, useQpqRuntime } from 'quidproquo-web-react';

import { useCallback } from 'react';

import { AutoCompleteOption } from '../LogViewer/hooks';
import {
  correlationQueryParamComputed,
  deepQueryParamComputed,
  endDateQueryParamComputed,
  errorQueryParamComputed,
  infoQueryParamComputed,
  logLevelQueryParamComputed,
  msgQueryParamComputed,
  runtimeTypeQueryParamComputed,
  serviceQueryParamComputed,
  startDateQueryParamComputed,
  tabQueryParamComputed,
  userQueryParamComputed,
} from './searchQueryParams';

export const useUrlFields = () => {
  const [api, state] = useQpqRuntime(sharedQueryParamsRuntime, askSyncParams);

  const [runtimeType, handleRuntimeTypeOnChange] = useFieldBinding(runtimeTypeQueryParamComputed, (value: string) => {
    api.setParam('runtimeType', [value]);
  });

  const [service, handleServiceOnChange] = useFieldBinding(
    serviceQueryParamComputed,
    (value: string) => {
      api.setParam('service', [value]);
    },
    (event: any, value: AutoCompleteOption): string => value?.value || '',
  );

  const [startDate, handleStartDateChange] = useFieldBinding(
    startDateQueryParamComputed,
    (value: Date | null) => {
      api.setParam('startIsoDateTime', value ? [value.toISOString()] : []);
    },
    (date): Date => date,
  );

  const [endDate, handleEndDateChange] = useFieldBinding(
    endDateQueryParamComputed,
    (value: Date | null) => {
      api.setParam('endIsoDateTime', value ? [value.toISOString()] : []);
    },
    (date): Date => date,
  );

  const [user, handleUserOnChange] = useFieldBinding(userQueryParamComputed, (value: string) => {
    api.setParam('user', [value]);
  });

  const [info, handleInfoOnChange] = useFieldBinding(infoQueryParamComputed, (value: string) => {
    api.setParam('info', [value]);
  });

  const [msg, handleMsgOnChange] = useFieldBinding(msgQueryParamComputed, (value: string) => {
    api.setParam('msg', [value]);
  });

  const [error, handleErrorOnChange] = useFieldBinding(errorQueryParamComputed, (value: string) => {
    api.setParam('error', [value]);
  });

  const [deep, handleDeepOnChange] = useFieldBinding(deepQueryParamComputed, (value: string) => {
    api.setParam('deep', [value]);
  });

  const [logLevel, handleLogLevelOnChange] = useFieldBinding(logLevelQueryParamComputed, (value: LogLevelEnumLookup) => {
    api.setParam('logLevel', [`${value}`]);
  });

  const [tab, handleTabOnChange] = useFieldBinding(
    tabQueryParamComputed,
    (value: number) => {
      api.setParam('tab', [`${value}`]);
    },
    (event: any, value: number): number => value,
  );

  const [correlation, handleCorrelationOnChange] = useFieldBinding(correlationQueryParamComputed, (value: string) => {
    api.setParam('correlation', [value]);
  });
  const clearCorrelation = useCallback(() => api.setParam('correlation', []), [api]);
  const setCorrelation = useCallback((correlation: string) => api.setParam('correlation', [correlation]), [api]);

  const updateStartAndEndTimeSpan = useCallback(
    (minutes: number) => {
      const now = new Date();
      const startDate = new Date(now.getTime() - minutes * 60000);
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60000);

      api.setParam('startIsoDateTime', [startDate.toISOString()]);
      api.setParam('endIsoDateTime', [endDate.toISOString()]);
    },
    [api],
  );

  return {
    state,
    api,
    runtimeType,
    handleRuntimeTypeOnChange,
    service,
    handleServiceOnChange,
    startDate,
    handleStartDateChange,
    endDate,
    handleEndDateChange,
    user,
    handleUserOnChange,
    info,
    handleInfoOnChange,
    msg,
    handleMsgOnChange,
    deep,
    handleDeepOnChange,
    error,
    handleErrorOnChange,
    tab,
    handleTabOnChange,
    logLevel,
    handleLogLevelOnChange,

    correlation,
    clearCorrelation,
    setCorrelation,
    //handleCorrelationOnChange,

    updateStartAndEndTimeSpan,
  };
};
