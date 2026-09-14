import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import { CAMERA_OPTIONS, REJECTION_REASONS } from '../../data/initialData';
import Modal from '../common/Modal';
import ImageUploadBox from '../common/ImageUploadBox';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Save,
  RotateCcw
} from 'lucide-react';

export default function StoryboardTab({ video }) {
  const {
    addShot,
    updateShot,
    setShotStatus,
    moveShot,
    duplicateShot,
    deleteShot,
    saveNewVersion
  } = useVideo();

  const [activeRejectIndex, setActiveRejectIndex] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');

  const handleOpenReject = (idx) => {
    setActiveRejectIndex(activeRejectIndex === idx ? null : idx);
    setRejectReason(video.shots[idx]?.recReason || REJECTION_REASONS[0]);
    setRejectNotes(video.shots[idx]?.rec || '');
  };

  const handleConfirmReject = (idx) => {
    setShotStatus(video.id, idx, 'rejected', rejectReason, rejectNotes);
    setActiveRejectIndex(null);
  };

  const handleSaveVersion = (e) => {
    e.preventDefault();
    saveNewVersion(video.id, versionNotes);
    setIsVersionModalOpen(false);
    setVersionNotes('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0, maxWidth: '65ch' }}>
          This is the current working version. Upload image frames alongside each paragraph, edit camera angles, and approve or request revision.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => addShot(video.id)}>
            <Plus className="w-3.5 h-3.5" />
            Add Shot
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsVersionModalOpen(true)}>
            <Save className="w-3.5 h-3.5" />
            Save as New Version
          </button>
        </div>
      </div>

      <div className="board">
        {video.shots.map((shot, idx) => {
          const statusClass =
            shot.status === 'approved'
              ? 'status-approved'
              : shot.status === 'rejected'
              ? 'status-rejected'
              : 'status-draft';

          const statusText =
            shot.status === 'approved'
              ? 'Approved'
              : shot.status === 'rejected'
              ? 'Needs changes'
              : 'Draft';

          const isRejectBoxOpen = activeRejectIndex === idx || shot.status === 'rejected';

          return (
            <div key={shot.id || idx} className="shot-card">
              <div className="shot-num">{idx + 1}</div>

              <div className="shot-main-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`status-pill ${statusClass}`}>{statusText}</span>
                  <span style={{ fontSize: '11px', color: 'var(--toon-cyan)', fontWeight: 700 }}>
                    ⚡ Synced with Script & Timeline
                  </span>
                </div>

                {/* Visual Frame Image right alongside the paragraph description */}
                <div className="shot-body-columns">
                  <div className="shot-frame-col">
                    <ImageUploadBox
                      value={shot.pic}
                      onChange={(newPic) => updateShot(video.id, idx, { pic: newPic })}
                      label={`Shot ${idx + 1} Frame Art`}
                      placeholder="Attach image to this paragraph"
                    />
                  </div>

                  <div className="shot-paras-col">
                    <div className="field">
                      <label style={{ fontWeight: 700 }}>Action & Visual Paragraph</label>
                      <textarea
                        rows={3}
                        value={shot.desc}
                        placeholder="Describe the action and key visual details happening in this shot..."
                        onChange={(e) => updateShot(video.id, idx, { desc: e.target.value })}
                      />
                    </div>

                    <div className="field">
                      <label style={{ fontWeight: 700 }}>Dialogue / Voiceover Line</label>
                      <input
                        type="text"
                        value={shot.dialogue || ''}
                        placeholder='e.g. "Look, the lantern is moving!"'
                        onChange={(e) => updateShot(video.id, idx, { dialogue: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="field-row">
                  <div className="field" style={{ flex: '1 1 140px' }}>
                    <label>Camera Angle</label>
                    <select
                      value={shot.camera}
                      onChange={(e) => updateShot(video.id, idx, { camera: e.target.value })}
                    >
                      {CAMERA_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field" style={{ flex: '2 1 180px' }}>
                    <label>Characters in Shot</label>
                    <input
                      type="text"
                      value={shot.chars}
                      placeholder="e.g. Mira, Bram"
                      onChange={(e) => updateShot(video.id, idx, { chars: e.target.value })}
                    />
                  </div>

                  <div className="field" style={{ width: '80px' }}>
                    <label>Duration</label>
                    <input
                      type="text"
                      value={shot.duration}
                      onChange={(e) => updateShot(video.id, idx, { duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="review-row">
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ background: 'var(--good)', color: '#091c0e' }}
                    onClick={() => setShotStatus(video.id, idx, 'approved')}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleOpenReject(idx)}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Reject / Request Changes
                  </button>
                </div>

                {isRejectBoxOpen && (
                  <div className="rec-box show">
                    <label>Why is this rejected? (Feeds the AI regeneration prompt)</label>
                    <select
                      value={shot.recReason || rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        updateShot(video.id, idx, { recReason: e.target.value });
                      }}
                    >
                      <option value="">Select reason...</option>
                      {REJECTION_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>

                    <textarea
                      placeholder="Add specific instructions for prompt regeneration..."
                      value={shot.rec || rejectNotes}
                      onChange={(e) => {
                        setRejectNotes(e.target.value);
                        updateShot(video.id, idx, { rec: e.target.value });
                      }}
                    />

                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-danger-solid btn-sm"
                        onClick={() => handleConfirmReject(idx)}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Send back for regeneration
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="shot-actions">
                <button
                  className="btn btn-move"
                  disabled={idx === 0}
                  onClick={() => moveShot(video.id, idx, -1)}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  Move up
                </button>

                <button
                  className="btn btn-move"
                  disabled={idx === video.shots.length - 1}
                  onClick={() => moveShot(video.id, idx, 1)}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  Move down
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => duplicateShot(video.id, idx)}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteShot(video.id, idx)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {video.shots.length === 0 && (
        <div className="empty-state">
          <div>No shots in this storyboard yet.</div>
          <button className="btn btn-primary btn-sm" onClick={() => addShot(video.id)}>
            <Plus className="w-3.5 h-3.5" />
            Add First Shot
          </button>
        </div>
      )}

      {/* Save Version Modal */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        title="Archive as New Storyboard Version"
      >
        <form onSubmit={handleSaveVersion}>
          <div className="modal-body">
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              This will create a frozen snapshot of all <b>{video.shots.length} shots</b> currently on the board,
              allowing the team to review, compare, or restore this milestone later.
            </p>
            <div className="field">
              <label>Version Revision Notes</label>
              <textarea
                rows={3}
                required
                value={versionNotes}
                placeholder="e.g. Approved pacing adjustments, revised shot 3 lighting."
                onChange={(e) => setVersionNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setIsVersionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Version
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
