import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import GoogleDriveModal from '../common/GoogleDriveModal';
import CloudSyncStatus from '../common/CloudSyncStatus';
import CollaboratorPresence from '../common/CollaboratorPresence';
import { Film, Coins, Sparkles, RotateCcw, Download, Layers, HardDrive } from 'lucide-react';

export default function Sidebar() {
  const { topView, setTopView, resetToDemoData, exportDataAsJSON, videos } = useVideo();
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  const totalVideos = Object.keys(videos).length;

  return (
    <aside className="sidebar">
      <div className="brand-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '16px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src="/lingotoon-logo.png"
            alt="Lingotoon"
            style={{ width: '150px', height: 'auto', borderRadius: '10px', marginBottom: '8px', filter: 'drop-shadow(0 4px 12px rgba(109, 40, 217, 0.15))' }}
          />
          <img
            src="/bird-mascot.png"
            alt="Mascot"
            title="Lingotoon Flying Mascot"
            style={{
              position: 'absolute',
              bottom: '6px',
              right: '-8px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2.5px solid #ffd859',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              objectFit: 'cover'
            }}
          />
        </div>
        <div className="team-badge" style={{ justifyContent: 'center', marginBottom: '10px' }}>
          <span className="team-badge-dot"></span>
          Internal · Video Production
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', width: '100%' }}>
          <CollaboratorPresence />
          <CloudSyncStatus />
        </div>
      </div>

      <nav className="nav-section">
        <div
          className={`nav-item ${topView === 'videos' ? 'active' : ''}`}
          onClick={() => setTopView('videos')}
        >
          <Film className="w-4 h-4" />
          <span>All Videos</span>
          <span className="badge-count" style={{ marginLeft: 'auto' }}>{totalVideos}</span>
        </div>

        <div
          className={`nav-item ${topView === 'credits' ? 'active' : ''}`}
          onClick={() => setTopView('credits')}
        >
          <Coins className="w-4 h-4" />
          <span>Credits & Tools</span>
        </div>
      </nav>

      <div style={{ padding: '12px 6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', fontSize: '11px', justifyContent: 'flex-start', color: '#ffd859' }}
          onClick={() => setIsDriveModalOpen(true)}
          title="Google Drive cloud storage & sync"
        >
          <HardDrive className="w-3.5 h-3.5 text-yellow-300" />
          Google Drive Hub
        </button>

        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', fontSize: '11px', justifyContent: 'flex-start' }}
          onClick={exportDataAsJSON}
          title="Download full project JSON"
        >
          <Download className="w-3.5 h-3.5" />
          Export Data JSON
        </button>

        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', fontSize: '11px', justifyContent: 'flex-start', color: 'var(--muted)' }}
          onClick={resetToDemoData}
          title="Reset to default prototype records"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      <div className="sidebar-footer">
        <p>Each video is its own folder — storyboards, prompts, generation history and platform reviews all live inside it.</p>
      </div>

      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
    </aside>
  );
}
