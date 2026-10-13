export const validChatBody = (body) => {
  return (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    typeof body.query === 'string' &&
    body.query.trim().length > 0 &&
    body.query.length <= 32000 &&
    typeof body.api_key === 'string' &&
    body.api_key.trim().length > 0 &&
    body.api_key.length <= 4096 &&
    Array.isArray(body.history) &&
    body.history.length <= 40 &&
    body.history.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        ['user', 'assistant'].includes(item.role) &&
        typeof item.message === 'string' &&
        item.message.length <= 64000
    )
  );
};
