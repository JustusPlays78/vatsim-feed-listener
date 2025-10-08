import { useState, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Bug, Zap, FileText, Settings, Trash2 } from 'lucide-react';
import changelogData from '../data/changelog.json';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
    removed?: string[];
    technical?: string[];
  };
}

const CHANGELOG_DATA: ChangelogEntry[] = changelogData;

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<string>('1.0.0');

  const selectedEntry = useMemo(
    () => CHANGELOG_DATA.find((entry) => entry.version === selectedVersion),
    [selectedVersion]
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Zap className="w-4 h-4" />;
      case 'changed':
        return <Settings className="w-4 h-4" />;
      case 'fixed':
        return <Bug className="w-4 h-4" />;
      case 'removed':
        return <Trash2 className="w-4 h-4" />;
      case 'technical':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'success';
      case 'changed':
        return 'info';
      case 'fixed':
        return 'warning';
      case 'removed':
        return 'danger';
      case 'technical':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📋 Changelog" size="xl">
      <div className="space-y-6">
        {/* Version Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {CHANGELOG_DATA.map((entry) => (
            <button
              key={entry.version}
              onClick={() => setSelectedVersion(entry.version)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                selectedVersion === entry.version
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              v{entry.version}
            </button>
          ))}
        </div>

        {/* Changelog Content - Optimized */}
        {selectedEntry && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Version {selectedEntry.version}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Released on{' '}
                  {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Badge variant="primary" size="lg">
                {selectedEntry.version === '1.0.0' ? 'Latest' : 'Previous'}
              </Badge>
            </div>

            {/* Changes */}
            <div className="space-y-6 max-h-96 overflow-y-auto overscroll-contain">
              {Object.entries(selectedEntry.changes).map(([type, items]) => {
                if (!items || items.length === 0) return null;

                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={getColor(type) as any} size="sm">
                        <span className="flex items-center gap-1">
                          {getIcon(type)}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <ul className="space-y-2 ml-4">
                      {items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-gray-400 dark:text-gray-500 mt-1">
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
