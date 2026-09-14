import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useVideo } from '../../context/VideoContext';
import { Trash2, Save } from 'lucide-react';

export default function EditVideoModal({ isOpen, onClose, video }) {
  const { updateVideoDetails, deleteVideo } = useVideo();

  const [title, setTitle] = useState(video.title);
  const [epLabel, setEpLabel] = useState(video.epLabel);
  const [logline, setLogline] = useState(video.logline);
  const [status, setStatus] = useState(video.status);
  const [createdBy, setCreatedBy] = useState(video.createdBy);
  const [cover, setCover] = useState(video.cover);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateVideoDetails(video.id, {
      title,
      epLabel,
      logline,
      status,
      createdBy,
      cover
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete "${video.title}"?`)) {
      deleteVideo(video.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Video Project Details">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="field-row">
            <div className="field" style={{ flex: '0 0 130px' }}>
              <label>Episode Label</label>
              <input
                type="text"
                value={epLabel}
                onChange={(e) => setEpLabel(e.target.value)}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Logline / Synopsis</label>
            <textarea
              rows={3}
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field" style={{ flex: 1 }}>
              <label>Production Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="in-progress">In Progress</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Owner / Director</label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Cover Art Reference</label>
            <input
              type="text"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Project
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
