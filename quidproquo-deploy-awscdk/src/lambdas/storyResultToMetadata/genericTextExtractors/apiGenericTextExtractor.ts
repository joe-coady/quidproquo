import { StoryResult } from 'quidproquo-core';
import { HTTPEvent } from 'quidproquo-webserver';

export const apiGenericTextExtractor = (storyResult: StoryResult<any>): string => {
  if (storyResult.runtimeType === 'API') {
    const transformEventParams = storyResult.history.find(
      (h) => h.act.type === '@quidproquo-core/event/TransformEventParams',
    );

    const result = transformEventParams?.res as [HTTPEvent] | undefined;
    return result?.[0].path || '';
  }

  return '';
};
