import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import { CAMERA_OPTIONS, REJECTION_REASONS } from '../../data/initialData';
import Modal from '../common/Modal';
import ImageUploadBox from '../common/ImageUploadBox';
import GoogleDriveModal from '../common/GoogleDriveModal';
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
  List,
  HardDrive,
  Clock,
  User,
  Check
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

  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' (cinema card gallery) | 'sequence' (linear list)
  const [showFrontCover, setShowFrontCover] = useState(Boolean(video.storyboardCover || video.coverImage));
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [versionFrontImage, setVersionFrontImage] = useState(video.storyboardCover || video.shots?.[0]?.pic || null);

  const studioDriveFolder = localStorage.getItem('lingotoon_studio_gdrive_folder');

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
      {/* Sequence Slate / Front Cover */}
      <div className="storyboard-front-cover-card">
        <div className="storyboard-front-cover-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film className="w-4 h-4 text-purple-600" />
            <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-bright)' }}>
              Storyboard Sequence Front Slate
            </span>
            {studioDriveFolder && (
              <span style={{ fontSize: '11px', color: '#15803d', background: '#e8f7ee', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check className="w-3 h-3" /> Drive Connected
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11.5px', padding: '3px 10px' }}
              onClick={() => setIsDriveModalOpen(true)}
              title="Configure Google Drive folder & database sync"
            >
              <HardDrive className="w-3.5 h-3.5 text-purple-600" />
              Google Drive Cloud
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '3px 10px' }}
              onClick={() => setShowFrontCover(!showFrontCover)}
            >
              {showFrontCover ? 'Hide Slate' : '+ View Front Slate'}
            </button>
          </div>
        </div>

        {showFrontCover && (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '8px' }}>
            <div style={{ flex: '0 0 260px', maxWidth: '300px', width: '100%' }}>
              <ImageUploadBox
                value={video.storyboardCover || video.coverImage}
                onChange={(newCover) => updateVideoDetails(video.id, { storyboardCover: newCover })}
                label="Front Sequence Cover Art"
                placeholder="Upload or link front cover from Google Drive"
                compact={true}
              />
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: 'var(--text-bright)' }}>
                {video.title} ({video.epLabel})
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.45 }}>
                {video.logline || 'Sequence storyboard and visual beat breakdown.'}
              </p>
              <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                <span>🎬 <b>{video.shots.length}</b> total shots</span>
                <span>👤 Director: <b>{video.createdBy}</b></span>
                <span>📅 Date: <b>{video.createdDate}</b></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Minimal Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-bright)' }}>
              Storyboard Sequence
            </h2>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--grape)', background: 'var(--panel-2)', padding: '2px 8px', borderRadius: '12px' }}>
              {video.shots.length} panels
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: '2px 0 0 0' }}>
            Visual-first cinema panels with front keyframes, synced action paragraphs, and AI camera blocking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Layout Mode Switcher */}
          <div style={{ background: 'var(--panel-2)', padding: '3px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '3px', border: '1px solid var(--line)' }}>
            <button
              type="button"
              className={`btn btn-sm ${layoutMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', border: 'none' }}
              onClick={() => setLayoutMode('grid')}
              title="Modern Cinema Grid Gallery"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1" />
              Cinema Grid
            </button>
            <button
              type="button"
              className={`btn btn-sm ${layoutMode === 'sequence' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', border: 'none' }}
              onClick={() => setLayoutMode('sequence')}
              title="Linear Sequence Flow"
            >
              <List className="w-3.5 h-3.5 mr-1" />
              Sequence Flow
            </button>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => addShot(video.id)}>
            <Plus className="w-3.5 h-3.5" />
            Add Shot
          </button>

          <button className="btn btn-primary btn-sm" onClick={handleOpenVersionModal}>
            <Save className="w-3.5 h-3.5" />
            Save Version
          </button>
        </div>
      </div>

      {/* Main Board Presentation */}
      {layoutMode === 'grid' ? (
        /* ================= 1. CINEMA GRID GALLERY ================= */
        <div className="cinema-grid">
          {video.shots.map((shot, idx) => {
            const statusColor =
              shot.status === 'approved'
                ? 'var(--good)'
                : shot.status === 'rejected'
                ? 'var(--bad)'
                : 'var(--text-dim)';

            const statusBg =
              shot.status === 'approved'
                ? 'var(--good-bg)'
                : shot.status === 'rejected'
                ? 'var(--bad-bg)'
                : 'var(--panel-2)';

            const isRejectBoxOpen = activeRejectIndex === idx || shot.status === 'rejected';

            return (
              <div key={shot.id || idx} className="cinema-card">
                {/* Cinema Card Header */}
                <div className="cinema-card-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: 'var(--grape)' }}>
                      #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: statusColor,
                        background: statusBg,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      {shot.status === 'approved' ? 'Approved' : shot.status === 'rejected' ? 'Revision' : 'Draft'}
                    </span>
                  </div>

                  {/* Discreet Hover/Top Quick Actions */}
                  <div className="shot-quick-actions">
                    <button
                      type="button"
                      className="quick-icon-btn"
                      disabled={idx === 0}
                      onClick={() => moveShot(video.id, idx, -1)}
                      title="Move left/up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      className="quick-icon-btn"
                      disabled={idx === video.shots.length - 1}
                      onClick={() => moveShot(video.id, idx, 1)}
                      title="Move right/down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      className="quick-icon-btn"
                      onClick={() => duplicateShot(video.id, idx)}
                      title="Duplicate panel"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      className="quick-icon-btn danger"
                      onClick={() => deleteShot(video.id, idx)}
                      title="Delete shot"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 16:9 Front Keyframe Image */}
                <div style={{ padding: '12px 14px 0 14px' }}>
                  <ImageUploadBox
                    value={shot.pic}
                    onChange={(newPic) => updateShot(video.id, idx, { pic: newPic })}
                    label={`Shot ${idx + 1} Front Frame`}
                    placeholder="Drop image or paste Google Drive link"
                    compact={true}
                  />
                </div>

                {/* Content Body */}
                <div className="cinema-card-body">
                  <div className="field">
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Action Description
                    </label>
                    <textarea
                      rows={2}
                      value={shot.desc}
                      placeholder="Describe camera movement and character action..."
                      onChange={(e) => updateShot(video.id, idx, { desc: e.target.value })}
                      style={{ fontSize: '12.5px', lineHeight: 1.45 }}
                    />
                  </div>

                  <div className="field">
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Dialogue / VO Line
                    </label>
                    <input
                      type="text"
                      value={shot.dialogue || ''}
                      placeholder='e.g. "Look, the lantern is moving!"'
                      onChange={(e) => updateShot(video.id, idx, { dialogue: e.target.value })}
                      style={{ fontSize: '12.5px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
                    <div style={{ flex: 1 }}>
                      <select
                        value={shot.camera}
                        onChange={(e) => updateShot(video.id, idx, { camera: e.target.value })}
                        style={{ fontSize: '11.5px', padding: '4px 8px' }}
                      >
                        {CAMERA_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ width: '70px' }}>
                      <input
                        type="text"
                        value={shot.duration || '3s'}
                        onChange={(e) => updateShot(video.id, idx, { duration: e.target.value })}
                        style={{ fontSize: '11.5px', padding: '4px 8px', textAlign: 'center' }}
                      />
                    </div>
                  </div>

                  {/* Review Bar */}
                  <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontSize: '11.5px', padding: '5px 8px', background: 'var(--good)', color: '#091c0e' }}
                      onClick={() => setShotStatus(video.id, idx, 'approved')}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, fontSize: '11.5px', padding: '5px 8px' }}
                      onClick={() => handleOpenReject(idx)}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Revision
                    </button>
                  </div>

                  {isRejectBoxOpen && (
                    <div className="rec-box">
                      <select
                        value={shot.recReason || rejectReason}
                        onChange={(e) => {
                          setRejectReason(e.target.value);
                          updateShot(video.id, idx, { recReason: e.target.value });
                        }}
                        style={{ fontSize: '11.5px', marginBottom: '6px' }}
                      >
                        <option value="">Reason for revision...</option>
                        {REJECTION_REASONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <textarea
                        rows={2}
                        placeholder="Instructions for prompt regeneration..."
                        value={shot.rec || rejectNotes}
                        onChange={(e) => {
                          setRejectNotes(e.target.value);
                          updateShot(video.id, idx, { rec: e.target.value });
                        }}
                        style={{ fontSize: '11.5px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger-solid btn-sm"
                        style={{ marginTop: '6px', fontSize: '11px', width: '100%' }}
                        onClick={() => handleConfirmReject(idx)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> Send for re-prompt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= 2. SEQUENCE LIST FLOW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {video.shots.map((shot, idx) => {
            const isRejectBoxOpen = activeRejectIndex === idx || shot.status === 'rejected';

            return (
              <div key={shot.id || idx} className="shot-card-minimal">
                <div className="shot-header-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--grape)' }}>
                      #{idx + 1}
                    </span>
                    <span className="tag" style={{ background: 'var(--panel-2)', color: 'var(--text-bright)' }}>
                      {shot.camera}
                    </span>
                    <span className="tag" style={{ background: 'var(--panel-2)', color: 'var(--text-muted)' }}>
                      {shot.duration || '3s'}
                    </span>
                    {shot.status === 'approved' && (
                      <span className="tag" style={{ background: 'var(--good-bg)', color: 'var(--good)' }}>Approved</span>
                    )}
                    {shot.status === 'rejected' && (
                      <span className="tag" style={{ background: 'var(--bad-bg)', color: 'var(--bad)' }}>Needs revision</span>
                    )}
                  </div>

                  <div className="shot-quick-actions">
                    <button
                      type="button"
                      className="quick-icon-btn"
                      disabled={idx === 0}
                      onClick={() => moveShot(video.id, idx, -1)}
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="quick-icon-btn"
                      disabled={idx === video.shots.length - 1}
                      onClick={() => moveShot(video.id, idx, 1)}
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="quick-icon-btn"
                      onClick={() => duplicateShot(video.id, idx)}
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="quick-icon-btn danger"
                      onClick={() => deleteShot(video.id, idx)}
                      title="Delete shot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="shot-body-columns">
                  <div className="shot-frame-col" style={{ flex: '0 0 240px' }}>
                    <ImageUploadBox
                      value={shot.pic}
                      onChange={(newPic) => updateShot(video.id, idx, { pic: newPic })}
                      label={`Shot ${idx + 1} Front Frame`}
                      placeholder="Upload or link Drive image"
                      compact={true}
                    />
                  </div>

                  <div className="shot-paras-col">
                    <div className="field">
                      <label style={{ fontWeight: 700 }}>Action Description</label>
                      <textarea
                        rows={2}
                        value={shot.desc}
                        placeholder="Visual action..."
                        onChange={(e) => updateShot(video.id, idx, { desc: e.target.value })}
                      />
                    </div>

                    <div className="field">
                      <label style={{ fontWeight: 700 }}>Dialogue / Voiceover</label>
                      <input
                        type="text"
                        value={shot.dialogue || ''}
                        placeholder='Dialogue line...'
                        onChange={(e) => updateShot(video.id, idx, { dialogue: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '11px', background: 'var(--good)', color: '#091c0e' }}
                        onClick={() => setShotStatus(video.id, idx, 'approved')}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '11px' }}
                        onClick={() => handleOpenReject(idx)}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Request Changes
                      </button>
                    </div>

                    {isRejectBoxOpen && (
                      <div className="rec-box">
                        <select
                          value={shot.recReason || rejectReason}
                          onChange={(e) => {
                            setRejectReason(e.target.value);
                            updateShot(video.id, idx, { recReason: e.target.value });
                          }}
                          style={{ fontSize: '12px', marginBottom: '6px' }}
                        >
                          <option value="">Select reason...</option>
                          {REJECTION_REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <textarea
                          rows={2}
                          placeholder="Revision instructions..."
                          value={shot.rec || rejectNotes}
                          onChange={(e) => {
                            setRejectNotes(e.target.value);
                            updateShot(video.id, idx, { rec: e.target.value });
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger-solid btn-sm"
                          style={{ marginTop: '6px', fontSize: '11px' }}
                          onClick={() => handleConfirmReject(idx)}
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Send back
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Google Drive Cloud Hub Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
    </div>
  );
}
