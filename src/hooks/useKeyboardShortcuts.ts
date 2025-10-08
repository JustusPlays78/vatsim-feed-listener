import { useEffect } from 'react';

export function useKeyboardShortcuts(callbacks: {
  onSubmit?: () => void;
  onClear?: () => void;
  onFocusSearch?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter: Submit form
      if (e.ctrlKey && e.key === 'Enter' && callbacks.onSubmit) {
        e.preventDefault();
        callbacks.onSubmit();
      }

      // ESC: Clear results
      if (e.key === 'Escape' && callbacks.onClear) {
        callbacks.onClear();
      }

      // /: Focus search field (if not in input)
      if (
        e.key === '/' &&
        callbacks.onFocusSearch &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        callbacks.onFocusSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
}
