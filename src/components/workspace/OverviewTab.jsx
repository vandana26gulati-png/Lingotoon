import React, { useState } from 'react';
import EditVideoModal from './EditVideoModal';
import { Clock, Film, Layers, Share2, Sparkles, User, Coins } from 'lucide-react';

export default function OverviewTab({ video }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const latestVersion = video.versions?.[0];
  const totalCost = (video.queue || []).reduce((s, q) => s + (q.cost || 0), 0);
  const liveCount = (video.platforms || []).filter(p => p.status === 'live').length;
  const recentTimeline = (video.timeline || []).slice(0, 4);

  return (
    <div>
      <div className="stat-row">
        <div className="stat">
          <div className="num">{video.versions?.length || 0}</div>
          <div className="lbl">Storyboard versions</div>
        </div>

        <div className="stat">
          <div className="num">{video.shots?.length || 0}</div>
          <div className="lbl">Shots in current board</div>
        </div>

        <div className="stat">
          <div className="num" style={{ fontSize: '20px', paddingTop: '4px' }}>
            {latestVersion ? latestVersion.uploadedBy : '—'}
          </div>
          <div className="lbl">Latest storyboard by</div>
        </div>

        <div className="stat">
          <div className="num" style={{ fontSize: '20px', paddingTop: '4px' }}>
            {latestVersion?.approvedBy || '—'}
          </div>
          <div className="lbl">Latest approved by</div>
        </div>

        <div className="stat">
          <div className="num">{liveCount}</div>
          <div className="lbl">Platforms live</div>
        </div>

        <div className="stat">
          <div className="num">{totalCost} <span style={{ fontSize: '14px', color: 'var(--iris)' }}>cr</span></div>
          <div className="lbl">Credits spent so far</div>
        </div>
      </div>

      <div className="field-row" style={{ marginTop: '10px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setIsEditModalOpen(true)}
        >
          Edit video details & cover
        </button>
      </div>

      <div style={{ marginTop: '28px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock className="w-4 h-4 text-purple-400" />
          Recent Activity
        </h3>

        {recentTimeline.length === 0 ? (
          <div className="empty-state">No activity logged yet for this project folder.</div>
        ) : (
          <div className="timeline">
            {recentTimeline.map((item, idx) => (
              <div className="tl-item" key={item.id || idx}>
                <div className="tl-time">{item.date}</div>
                <div className="tl-dot"></div>
                <div className="tl-content">
                  <div className="tl-title">{item.title}</div>
                  <div className="tl-who">{item.who}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditVideoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        video={video}
      />
    </div>
  );
}
