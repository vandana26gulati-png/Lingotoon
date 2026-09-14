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
  RotateCcw,
  Film,
  LayoutGrid,
  Columns
} from 'lucide-react';

export default function StoryboardTab({ video }) {
  const {
    addShot,
    updateShot,
    setShotStatus,
    moveShot,
    duplicateShot,
    deleteShot,
    saveNewVersion,
    updateVideoDetails
  } = useVideo();

  const [activeRejectIndex, setActiveRejectIndex] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  const [layoutMode, setLayoutMode] = useState('front'); // 'front' (image on front/top) | 'split' (side-by-side)
  const [showFrontCover, setShowFrontCover] = useState(Boolean(video.storyboardCover || video.coverImage));

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [versionFrontImage, setVersionFrontImage] = useState(video.storyboardCover || video.shots?.[0]?.pic || null);

  const handleOpenReject = (idx) => {
    setActiveRejectIndex(activeRejectIndex === idx ? null : idx);
    setRejectReason(video.shots[idx]?.recReason || REJECTION_REASONS[0]);
    setRejectNotes(video.shots[idx]?.rec || '');
  };

  const handleConfirmReject = (idx) => {
    setShotStatus(video.id, idx, 'rejected', rejectReason, rejectNotes);
    setActiveRejectIndex(null);
  };

  const handleOpenVersionModal = () => {
    setVersionFrontImage(video.storyboardCover || video.shots?.[0]?.pic || null);
    setIsVersionModalOpen(true);
  };

  const handleSaveVersion = (e) => {
    e.preventDefault();
    saveNewVersion(video.id, versionNotes, versionFrontImage);
    setIsVersionModalOpen(false);
    setVersionNotes('');
  };

  return (
    <div>
      {/* Storyboard Front Cover & Sequence Slate */}
      <div className="storyboard-front-cover-card">
        <div className="storyboard-front-cover-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film className="w-4 h-4 text-purple-600" />
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-bright)' }}>
              Storyboard Sequence Front Cover
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              (Front slate image establishing this entire storyboard sequence)
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '11px', padding: '3px 10px' }}
            onClick={() => setShowFrontCover(!showFrontCover)}
          >
            {showFrontCover ? 'Collapse Front Cover' : '+ Add / View Front Cover'}
          </button>
        </div>

        {showFrontCover && (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '10px' }}>
            <div style={{ flex: '0 0 280px', maxWidth: '320px', width: '100%' }}>
              <ImageUploadBox
                value={video.storyboardCover || video.coverImage}
                onChange={(newCover) => updateVideoDetails(video.id, { storyboardCover: newCover })}
                label="Storyboard Front Cover Art"
                placeholder="Upload front cover image for this storyboard"
              />
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <span className="tag" style={{ background: 'var(--panel-2)', color: 'var(--grape)', border: '1px solid var(--line)', marginBottom: '8px', display: 'inline-block' }}>
                Sequence Slate
              </span>
              <h3 style={{ fontSize: '18px', margin: '0 0 6px 0', color: 'var(--text-bright)' }}>
                {video.title} ({video.epLabel})
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                {video.logline || 'Sequence storyboard sequence and visual beat breakdown.'}
              </p>
              <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                <span>🎬 Total Board Shots: <b>{video.shots.length}</b></span>
                <span>👤 Sequence Director: <b>{video.createdBy}</b></span>
                <span>📅 Created: <b>{video.createdDate}</b></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Storyboard Controls & Layout Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--text-bright)' }}>
            Storyboard Shots & Keyframes
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '12.5px', margin: '2px 0 0 0', maxWidth: '65ch' }}>
            Each storyboard panel carries its <b>Front Image / Keyframe</b>, visual action paragraph, dialogue line, and camera angle.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Layout Mode Selector */}
          <div style={{ background: 'var(--panel-2)', padding: '3px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '3px', border: '1px solid var(--line)' }}>
            <button
              type="button"
              className={`btn btn-sm ${layoutMode === 'front' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', border: 'none' }}
              onClick={() => setLayoutMode('front')}
              title="Display image prominently on front / top of each storyboard"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />
              Front Image on Top
            </button>
            <button
              type="button"
              className={`btn btn-sm ${layoutMode === 'split' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', border: 'none' }}
              onClick={() => setLayoutMode('split')}
              title="Display image on front-left side of each storyboard"
            >
              <Columns className="w-3.5 h-3.5 mr-1" />
              Side-by-Side
            </button>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => addShot(video.id)}>
            <Plus className="w-3.5 h-3.5" />
            Add Shot
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenVersionModal}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-pill ${statusClass}`}>{statusText}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--grape)' }}>
                      Storyboard Panel #{idx + 1}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--toon-cyan)', fontWeight: 700 }}>
                    ⚡ Synced with Script & Timeline
                  </span>
                </div>

                {layoutMode === 'front' ? (
                  /* Option A: Image right ON FRONT / top of each storyboard */
                  <div>
                    <div className="shot-front-hero-wrap">
                      <ImageUploadBox
                        value={shot.pic}
                        onChange={(newPic) => updateShot(video.id, idx, { pic: newPic })}
                        label={`Storyboard #${idx + 1} Front Image / Keyframe`}
                        placeholder="Click to upload image on front of this storyboard"
                      />
                    </div>

                    <div className="field-row" style={{ marginTop: '12px' }}>
                      <div className="field" style={{ flex: 1, minWidth: '240px' }}>
                        <label style={{ fontWeight: 700 }}>Action & Visual Paragraph</label>
                        <textarea
                          rows={2}
                          value={shot.desc}
                          placeholder="Describe the action and key visual details happening in this shot..."
                          onChange={(e) => updateShot(video.id, idx, { desc: e.target.value })}
                        />
                      </div>

                      <div className="field" style={{ flex: 1, minWidth: '240px' }}>
                        <label style={{ fontWeight: 700 }}>Dialogue / Voiceover Line</label>
                        <textarea
                          rows={2}
                          value={shot.dialogue || ''}
                          placeholder='e.g. "Look, the lantern is moving!"'
                          onChange={(e) => updateShot(video.id, idx, { dialogue: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Option B: Image on front-left column */
                  <div className="shot-body-columns">
                    <div className="shot-frame-col">
                      <ImageUploadBox
                        value={shot.pic}
                        onChange={(newPic) => updateShot(video.id, idx, { pic: newPic })}
                        label={`Storyboard #${idx + 1} Front Frame`}
                        placeholder="Upload image on front"
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
                )}

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

            <div className="field">
              <label>Front Keyframe / Version Cover Image</label>
              <ImageUploadBox
                value={versionFrontImage}
                onChange={setVersionFrontImage}
                label="Version Front Keyframe Image"
                placeholder="Upload or choose front image for this storyboard version"
                compact={true}
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
