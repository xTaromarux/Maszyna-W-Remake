const copyWithTextArea = (text: string): boolean => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);

  try {
    textArea.select();
    return document.execCommand('copy');
  } finally {
    textArea.remove();
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Browser permissions may block the Clipboard API; try the fallback below.
    }
  }

  return copyWithTextArea(text);
};
