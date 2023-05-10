export const getOnRowClick =
  (setSelectedLogCorrelation: (correlation: string) => void) =>
  ({ row: logStory }: any) => {
    setSelectedLogCorrelation(logStory.correlation);
  };
