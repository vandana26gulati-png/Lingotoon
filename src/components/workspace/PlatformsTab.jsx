import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { Share2, Plus, ExternalLink, Trash2, Star } from 'lucide-react';

export default function PlatformsTab({ video }) {
  const { addPlatformUpload, deletePlatformUpload } = useVideo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platformName, setPlatformName] = useState('YouTube Shorts');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('live');
  const [rating, setRating] = useState('4.8');
  const [reviews, setReviews] = useState('150');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');

  const platforms = video.platforms || [];

  const handleAdd = (e) => {
    e.preventDefault();
    addPlatformUpload(video.id, {
      name: platformName,
      date: uploadDate,
      status,
      rating,
      reviews,
      note,
      link: link.trim() || '#'
    });

    setIsModalOpen(false);
    setNote('');
    setLink('');
  };

  const renderStars = (val) => {
    if (val === null || val === undefined) return '—';
    const num = Math.round(Number(val));
    return (
      <span className="stars" title={`${val} / 5.0`}>
        {'★'.repeat(num)}{'☆'.repeat(Math.max(0, 5 - num))} {Number(val).toFixed(1)}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0, maxWidth: '65ch' }}>
          Where this video episode has been published, audience retention ratings, comments sentiment, and cross-platform performance.
        </p>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          Log New Upload
        </button>
      </div>

      {platforms.length === 0 ? (
        <div className="empty-state">
          <Share2 className="w-8 h-8 text-purple-400 mb-2" />
          <div>Not published to any platform yet.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th>Audience Rating</th>
                <th>Review Count</th>
                <th>Performance Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>
                    {p.name}
                  </td>
                  <td>{p.date}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>{renderStars(p.rating)}</td>
                  <td>{p.reviews ? `${p.reviews.toLocaleString()} reviews` : '—'}</td>
                  <td style={{ maxWidth: '240px', fontSize: '12.5px', color: 'var(--muted-light)' }}>
                    {p.note}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {p.link && p.link !== '#' && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="link-btn"
                        style={{ marginRight: '10px' }}
                      >
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        Open
                      </a>
                    )}
                    <button
                      className="btn-icon"
                      style={{ padding: '4px', border: 'none', background: 'none' }}
                      onClick={() => deletePlatformUpload(video.id, p.id)}
                      title="Remove record"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Video Distribution Upload">
        <form onSubmit={handleAdd}>
          <div className="modal-body">
            <div className="field-row">
              <div className="field" style={{ flex: 1 }}>
                <label>Platform Name</label>
                <select value={platformName} onChange={(e) => setPlatformName(e.target.value)}>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                  <option value="Internal Screening">Internal Screening</option>
                </select>
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="live">Live</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft / Unlisted</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field" style={{ flex: 1 }}>
                <label>Upload Date</label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                />
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label>Audience Rating (0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label>Reviews / Comments</label>
                <input
                  type="number"
                  min="0"
                  value={reviews}
                  onChange={(e) => setReviews(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Live URL / Link</label>
              <input
                type="text"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Performance Observations & Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Strong retention past 0:15, high share rate."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Upload
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
