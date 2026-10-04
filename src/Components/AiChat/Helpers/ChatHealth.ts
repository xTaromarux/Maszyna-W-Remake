import type { HealthResponse } from '@/Types/Chat';

async function requestHealth(url: string, action: 'check' | 'wake', signal: AbortSignal): Promise<HealthResponse> {
  signal.throwIfAborted();

  const querySeparator = url.includes('?') ? '&' : '?';
  const requestUrl = `${url}${querySeparator}${action}=1`;
  const response = await fetch(requestUrl, { signal });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  let body;

  try {
    body = await response.json();
  } catch (error) {
    // Prefer the cancellation reason if the deadline expired while reading JSON.
    signal.throwIfAborted();
    throw error;
  }

  signal.throwIfAborted();

  const isResponseObject = body !== null && typeof body === 'object' && !Array.isArray(body);
  if (!isResponseObject) {
    throw new Error('Invalid health response');
  }

  return body as HealthResponse;
}

/** Keep all checks and body reads within the caller's abort deadline. */
export async function checkChatHealth(url: string, signal: AbortSignal, onWaking: () => void): Promise<void> {
  const initialHealth = await requestHealth(url, 'check', signal);
  const needsWakeUp = initialHealth.upstream_ok === false;

  // Some health endpoints omit upstream_ok; only an explicit false triggers a wake-up.
  if (!needsWakeUp) {
    return;
  }

  onWaking();
  await requestHealth(url, 'wake', signal);

  // A successful wake request does not guarantee that the model is ready yet.
  const healthAfterWakeUp = await requestHealth(url, 'check', signal);
  if (healthAfterWakeUp.upstream_ok === false) {
    throw new Error('Model is not ready');
  }
}
