import React from 'react';
import { useVideo } from '../../context/VideoContext';
import StatusBadge from '../common/StatusBadge';
import { Play, RotateCw, Check, Copy, ExternalLink, Clock, Sparkles } from 'lucide-react';

export default function TimelineTab({ video }) {
  const { retryJob, completeJob, addToast } = useVideo();

  const queue = video.queue || [];
  const timeline = video.timeline || [];

  const handleCopyPath = (path) => {
    navigator.clipboard.writeText(path);
    addToast('Destination path copied!', 'info');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles className="w-4 h-4 text-purple-400" />
          Active Generation Queue
        </h3>
        <span style={{ fontSize: '11.5px', color: 'var(--toon-cyan)', fontWeight: 700 }}>
          ⚡ Synced: Changes in Script or Storyboard update here automatically
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: '28px' }}>
          No video rendering jobs queued yet.
        </div>
      ) : (
        <div className="table-wrap" style={{ marginBottom: '32px' }}>
          <table>
            <thead>
              <tr>
                <th>Shot Title</th>
                <th>AI Model</th>
                <th>Status</th>
                <th>Storage Path</th>
                <th>Updated</th>
                <th>Cost</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((job) => (
                <tr key={job.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>
                    {job.shot}
                  </td>
                  <td>{job.tool}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--muted-light)', fontFamily: 'var(--font-mono)' }}>
                    {job.uploadedTo}
                  </td>
                  <td style={{ fontSize: '12px' }}>{job.updated}</td>
                  <td style={{ fontWeight: 600, color: 'var(--lilac)' }}>
                    {job.cost ? `${job.cost} cr` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {job.status === 'complete' && (
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="link-btn"
                          onClick={() => handleCopyPath(job.uploadedTo)}
                          title="Copy file path"
                        >
                          <Copy className="w-3 h-3 inline mr-1" />
                          Copy Link
                        </button>
                      </div>
                    )}

                    {job.status === 'failed' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--bad)', borderColor: 'var(--bad-border)' }}
                        onClick={() => retryJob(video.id, job.id)}
                      >
                        <RotateCw className="w-3 h-3 inline mr-1" />
                        Retry
                      </button>
                    )}

                    {job.status === 'generating' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--good)' }}
                        onClick={() => completeJob(video.id, job.id)}
                        title="Simulate immediate completion"
                      >
                        <Check className="w-3 h-3 inline mr-1" />
                        Complete Now
                      </button>
                    )}

                    {job.status === 'pending' && (
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Queued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 style={{ fontSize: '16px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock className="w-4 h-4 text-purple-400" />
        Full Project Timeline & Production Log
      </h3>

      {timeline.length === 0 ? (
        <div className="empty-state">No timeline milestones logged yet.</div>
      ) : (
        <div className="timeline">
          {timeline.map((item, idx) => (
            <div key={item.id || idx} className="tl-item">
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
  );
}
