import { Settings as SettingsIcon, X } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    autoClearPasswords: boolean;
    showKeyboardShortcuts: boolean;
    showCharacterCount: boolean;
  };
  onSettingsChange: (key: string, value: boolean) => void;
}

export function Settings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: SettingsProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div className="fixed inset-x-4 top-20 sm:right-4 sm:left-auto sm:w-96 bg-card border border-border rounded-lg shadow-lg z-50 animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Preferences */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Preferences</Label>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm group-hover:text-foreground transition-colors">
                  Auto-clear passwords after action
                </span>
                <input
                  type="checkbox"
                  checked={settings.autoClearPasswords}
                  onChange={(e) =>
                    onSettingsChange('autoClearPasswords', e.target.checked)
                  }
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm group-hover:text-foreground transition-colors">
                  Show keyboard shortcuts
                </span>
                <input
                  type="checkbox"
                  checked={settings.showKeyboardShortcuts}
                  onChange={(e) =>
                    onSettingsChange('showKeyboardShortcuts', e.target.checked)
                  }
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm group-hover:text-foreground transition-colors">
                  Show character count
                </span>
                <input
                  type="checkbox"
                  checked={settings.showCharacterCount}
                  onChange={(e) =>
                    onSettingsChange('showCharacterCount', e.target.checked)
                  }
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          {settings.showKeyboardShortcuts && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <Label className="text-xs font-medium">Keyboard Shortcuts</Label>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Encrypt/Decrypt</span>
                  <kbd className="px-1.5 py-0.5 bg-background border rounded text-foreground font-mono">
                    ⌘+Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Clear fields</span>
                  <kbd className="px-1.5 py-0.5 bg-background border rounded text-foreground font-mono">
                    ⌘+K
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
