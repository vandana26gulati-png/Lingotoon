import React from 'react';
import { useVideo } from '../../context/VideoContext';
import { HardDrive, CheckCircle2, Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { formatDriveFolderUrl } from '../../utils/googleDrive';

export default function CloudSyncStatus() {
  const { cloudStatus, lastSyncedTime, forceCloudSync } = useVideo();
  const folderId = localStorage.getItem('lingotoon_studio_gdrive_folder') || '';

  const getStatusContent = () => {
    switch (cloudStatus) {
      case 'saving':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />,
          label: 'Saving to Drive...',
          bg: '#fbf9fe',
          border: '#e9d5ff',
          color: '#6d28d9',
          title: 'Saving changes directly to your Google Drive host'
        };
      case 'syncing':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />,
          label: 'Syncing with Drive...',
          bg: '#fbf9fe',
          border: '#e9d5ff',
          color: '#6d28d9',
          title: 'Loading latest project data from Google Drive'
        };
      case 'synced':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Saved to Studio Drive',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          color: '#065f46',
          title: `All changes saved to Google Drive${lastSyncedTime ? ` (${lastSyncedTime})` : ''}`
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Saved locally (Drive retry)',
          bg: '#fffbeb',
          border: '#fde68a',
          color: '#92400e',
          title: 'Changes are saved safely on your device. Will auto-retry syncing to Drive.'
        };
      default:
        return {
          icon: <HardDrive className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Local Storage Active',
          bg: '#f8f6fc',
          border: '#e2d9f3',
          color: '#4c1d95',
          title: 'Link Google Drive in settings to enable live cloud auto-save'
        };
    }
  };

  const status = getStatusContent();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div
        className="cloud-sync-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: status.bg,
          border: `1px solid ${status.border}`,
          color: status.color,
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onClick={forceCloudSync}
        title={`${status.title} — Click to force sync`}
      >
        {status.icon}
        <span>{status.label}</span>
      </div>

      {folderId && (
        <a
          href={formatDriveFolderUrl(folderId)}
          target="_blank"
          rel="noopener noreferrer"
          className="quick-icon-btn"
          style={{ width: '26px', height: '26px', padding: 0 }}
          title="Open Google Drive Storage Folder ↗"
        >
          <ExternalLink className="w-3 h-3 text-purple-600" />
        </a>
      )}
    </div>
  );
}
