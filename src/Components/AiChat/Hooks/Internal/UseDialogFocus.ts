import { useCallback, useEffect, useRef } from 'react';
import { trapDialogTab } from '../../Helpers/DialogFocus';

/**
 * Keeps focus inside the open dialog and restores the previously focused element on close.
 * Focuses the API-key input when locked, otherwise the message input.
 * Defers input focus until the next frame so React can render the selected input first.
 */
export const useDialogFocus = (visible: boolean, locked: boolean) => {
  const dialog = useRef<HTMLDivElement | null>(null);
  const textInput = useRef<HTMLInputElement | null>(null);
  const apiKeyInput = useRef<HTMLInputElement | null>(null);

  // Event listeners read the latest state without being registered again on every render.
  const latestFocusState = useRef({ visible, locked });
  latestFocusState.current = { visible, locked };
  const focusFrame = useRef<number | null>(null);

  const cancelPendingFocus = useCallback(() => {
    if (focusFrame.current === null) {
      return;
    }

    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = null;
  }, []);

  const focusPrimary = useCallback(() => {
    cancelPendingFocus();
    focusFrame.current = requestAnimationFrame(() => {
      focusFrame.current = null;
      const { visible: isVisible, locked: isLocked } = latestFocusState.current;
      if (!isVisible) {
        return;
      }

      const primaryInput = isLocked ? apiKeyInput.current : textInput.current;
      if (primaryInput && !primaryInput.disabled) {
        primaryInput.focus();
      } else {
        dialog.current?.focus();
      }
    });
  }, [cancelPendingFocus]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const dialogElement = dialog.current;
    if (!dialogElement) {
      return;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleTabKey = (event: KeyboardEvent) => trapDialogTab(event, dialogElement);

    const handleFocusOutside = (event: FocusEvent) => {
      const focusLeftDialog = event.target instanceof Node && !dialogElement.contains(event.target);
      if (focusLeftDialog) {
        focusPrimary();
      }
    };

    document.addEventListener('keydown', handleTabKey, true);
    document.addEventListener('focusin', handleFocusOutside);
    return () => {
      document.removeEventListener('keydown', handleTabKey, true);
      document.removeEventListener('focusin', handleFocusOutside);
      cancelPendingFocus();
      previouslyFocused?.focus();
    };
  }, [visible, focusPrimary, cancelPendingFocus]);

  useEffect(() => {
    if (visible) {
      focusPrimary();
    }
  }, [visible, locked, focusPrimary]);

  return { dialog, textInput, apiKeyInput, focusPrimary };
};
