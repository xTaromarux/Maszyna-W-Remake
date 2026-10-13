export const normalizeUpstream = (rawUrl, spaceSlug) => {
  let url = rawUrl?.trim() || '';
  if (!url && spaceSlug) {
    const [owner, space] = spaceSlug.split('/');
    if (!owner || !space) {
      throw new Error('HF_SPACE must use owner/space format');
    }
    url = `https://${`${owner}-${space}`.replace(/_/g, '-')}.hf.space/chat`;
  }
  const match = url.match(/^https?:\/\/huggingface\.co\/spaces\/([^/]+)\/([^/]+)(?:\/.*)?$/i);
  if (match) {
    url = `https://${`${match[1]}-${match[2]}`.replace(/_/g, '-')}.hf.space/chat`;
  }
  if (url && !/\/chat\/?$/.test(url)) {
    url = url.replace(/\/+$/, '') + '/chat';
  }
  if (url && !['http:', 'https:'].includes(new URL(url).protocol)) {
    throw new Error('HF_TARGET_URL must use HTTP or HTTPS');
  }
  return url;
};

/** Keeps the deadline active until the complete response body has been read. */
export const fetchTextWithTimeout = async (fetchImpl, url, options, timeoutMs, parentSignal) => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  parentSignal?.addEventListener('abort', abort, { once: true });
  if (parentSignal?.aborted) {
    controller.abort();
  }
  const timeout = setTimeout(abort, timeoutMs);
  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
    parentSignal?.removeEventListener('abort', abort);
  }
};
