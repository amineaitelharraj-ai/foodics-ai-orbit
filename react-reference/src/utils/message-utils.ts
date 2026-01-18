export const isStructuredResponse = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  const trimmed = content.trim();
  return trimmed.startsWith('{') && trimmed.includes('"agent":');
};
