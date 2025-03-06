import { EventActionType } from 'quidproquo-core';

const coreEventActionComponentMap: Record<string, string[]> = {
  [EventActionType.TransformEventParams]: ['askEventTransformEventParams', 'eventParams'],
  [EventActionType.TransformResponseResult]: ['askEventTransformResponseResult', 'qpqEventRecordResponses', 'eventParams'],
  [EventActionType.AutoRespond]: ['askEventAutoRespond', 'qpqEventRecord', 'matchResult'],
  [EventActionType.MatchStory]: ['askEventMatchStory', 'qpqEventRecord', 'eventParams'],
  [EventActionType.GetRecords]: ['askEventGetRecords', 'eventParams'],
};

export default coreEventActionComponentMap;
