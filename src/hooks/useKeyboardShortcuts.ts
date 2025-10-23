import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onEncrypt?: () => void;
  onDecrypt?: () => void;
  onClear?: () => void;
  onCopy?: () => void;
}

export function useKeyboardShortcuts(
  activeTab: string,
  handlers: KeyboardShortcutHandlers,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + Enter to encrypt/decrypt
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        if (activeTab === 'encrypt' && handlers.onEncrypt) {
          handlers.onEncrypt();
        } else if (activeTab === 'decrypt' && handlers.onDecrypt) {
          handlers.onDecrypt();
        }
      }

      // Cmd/Ctrl + K to clear
      if (isMod && e.key === 'k') {
        e.preventDefault();
        handlers.onClear?.();
      }

      // Cmd/Ctrl + Shift + C to copy result
      if (isMod && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handlers.onCopy?.();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [activeTab, handlers, enabled]);
}
