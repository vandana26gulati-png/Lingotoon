import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import StatusBadge from '../common/StatusBadge';
import EditVideoModal from './EditVideoModal';
import { ArrowLeft, Edit3, Image, Sparkles } from 'lucide-react';

export default function WorkspaceHeader({ video }) {
  const { setTopView } = useVideo();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div>
      <div className="back-link" onClick={() => setTopView('videos')}>
        <ArrowLeft className="w-4 h-4" />
        Back to All Videos
      </div>

      <div className="video-header">
        <div className="video-cover">
          <Sparkles className="w-5 h-5 mb-1 text-purple-300" />
          <span style={{ fontWeight: 600 }}>{video.cover}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div className="ep-label" style={{ fontSize: '12px', color: 'var(--iris)', fontWeight: 700 }}>
              {video.epLabel}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditOpen(true)}
              style={{ fontSize: '11.5px' }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Details
            </button>
          </div>

          <h1 style={{ fontSize: '26px', margin: '4px 0 8px 0', color: 'var(--text-bright)' }}>
            {video.title}
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: '13.5px', maxWidth: '64ch', lineHeight: 1.5 }}>
            {video.logline}
          </p>

          <div className="meta-row">
            <div>Owner: <b>{video.createdBy}</b></div>
            <div>Created: <b>{video.createdDate}</b></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Status: <StatusBadge status={video.status} />
            </div>
          </div>
        </div>
      </div>

      <EditVideoModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        video={video}
      />
    </div>
  );
}
