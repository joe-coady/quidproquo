import { EventActionType, QpqRuntimeType, StoryResult } from 'quidproquo-core';

import { SeoEvent } from '../../../../types';

export const seoORGenericTextExtractor = (storyResult: StoryResult<any>): string[] => {
  if (storyResult.runtimeType === QpqRuntimeType.EVENT_SEO_OR) {
    const transformEventParams = storyResult.history.find((h) => h.act.type === EventActionType.TransformEventParams);

    const result = transformEventParams?.res as [SeoEvent] | undefined;
    return [result?.[0].path || ''];
  }

  return [''];
};
