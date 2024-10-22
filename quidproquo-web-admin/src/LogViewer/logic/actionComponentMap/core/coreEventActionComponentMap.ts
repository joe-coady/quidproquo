const coreEventActionComponentMap: Record<string, string[]> = {
  ['@quidproquo-core/event/TransformEventParams']: ['askEventTransformEventParams', 'eventParams'],
  ['@quidproquo-core/event/TransformResponseResult']: ['askEventTransformResponseResult', 'response', 'transformedEventParams'],
  ['@quidproquo-core/event/AutoRespond']: ['askEventAutoRespond', 'transformedEventParams', 'matchResult'],
  ['@quidproquo-core/event/MatchStory']: ['askEventMatchStory', 'transformedEventParams'],
};

export default coreEventActionComponentMap;
