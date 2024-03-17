export const useTruncatedText = (text: string) => {
  const canTruncate = text.split('\n').length > 3;
  const truncatedText = text.split('\n').slice(0, 3).join('\n') + '...';

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return { canTruncate, truncatedText, handleCopy };
};
