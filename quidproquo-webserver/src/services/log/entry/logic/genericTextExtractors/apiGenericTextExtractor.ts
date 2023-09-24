import { EventActionType, QpqRuntimeType, StoryResult } from 'quidproquo-core';
import { HTTPEvent } from '../../../../../types';

export const apiGenericTextExtractor = (storyResult: StoryResult<any>): string => {
  if (storyResult.runtimeType === QpqRuntimeType.API) {
    const transformEventParams = storyResult.history.find(
      (h) => h.act.type === EventActionType.TransformEventParams,
    );

    const result = transformEventParams?.res as [HTTPEvent] | undefined;
    return result?.[0].path || '';
  }

  return '';
};
