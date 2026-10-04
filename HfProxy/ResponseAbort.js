/** Cancels upstream work when the client disconnects before the response has ended. */
export const createResponseAbort = (response) => {
  const controller = new AbortController();
  const abort = () => {
    if (!response.writableEnded) {
      controller.abort();
    }
  };
  response.once('close', abort);

  return {
    signal: controller.signal,
    dispose: () => {
      response.removeListener('close', abort);
    },
  };
};
