import React from 'react';
import { useVideo } from '../../context/VideoContext';
import { Film, Coins, Sparkles, RotateCcw, Download, Layers } from 'lucide-react';

export default function Sidebar() {
  const { topView, setTopView, resetToDemoData, exportDataAsJSON, videos } = useVideo();

  const totalVideos = Object.keys(videos).length;

  return (
    <aside className="sidebar">
      <div className="brand-wrapper">
        <div className="brand-title">
          <Layers className="w-5 h-5 text-purple-400" />
          Lingo<span>toon</span>
        </div>
        <div className="team-badge">
          <span className="team-badge-dot"></span>
          Internal · Video Production
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
    </aside>
  );
}
