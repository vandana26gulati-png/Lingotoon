import React from 'react';
import { useVideo } from '../../context/VideoContext';
import StatusBadge from '../common/StatusBadge';
import { Film, User, Layers, Share2, Sparkles } from 'lucide-react';

export default function VideoCard({ video }) {
  const { openVideo } = useVideo();

  const livePlatforms = (video.platforms || []).filter(p => p.status === 'live').length;
  const versionCount = video.versions?.length || 0;
  const shotCount = video.shots?.length || 0;

  return (
    <div className="video-card" onClick={() => openVideo(video.id)}>
      <div className="card-thumb">
        <Sparkles className="w-5 h-5 text-purple-400 mb-1" style={{ opacity: 0.8 }} />
        <span style={{ fontWeight: 600, maxWidth: '90%' }}>{video.cover}</span>
      </div>

      <div className="ep-label">{video.epLabel}</div>
      <h3>{video.title}</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <StatusBadge status={video.status} />
      </div>

      <p className="logline">{video.logline}</p>

      <div className="video-stats">
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <User className="w-3.5 h-3.5" />
          <span>By <b>{video.createdBy}</b></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Layers className="w-3.5 h-3.5" />
          <span><b>{versionCount}</b> versions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Film className="w-3.5 h-3.5" />
          <span><b>{shotCount}</b> shots</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Share2 className="w-3.5 h-3.5" />
          <span><b>{livePlatforms}</b> live</span>
        </div>
      </div>
    </div>
  );
}
