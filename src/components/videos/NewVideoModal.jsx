import React, { useState } from 'react';
import Modal from '../common/Modal';
import ImageUploadBox from '../common/ImageUploadBox';
import { useVideo } from '../../context/VideoContext';
import { PlusCircle, Sparkles } from 'lucide-react';

const COVER_PRESETS = [
  "Mystic forest illuminated by floating cyan embers",
  "Sun-drenched fantasy bazaar with towering spice spires",
  "Moonlit cascading crystal waterfalls and starlit skies",
  "Ancient observatory clocktower ticking in the clouds",
  "Bioluminescent deep-sea reef sanctuary"
];

export default function NewVideoModal({ isOpen, onClose }) {
  const { createVideo } = useVideo();

  const [title, setTitle] = useState('');
  const [epLabel, setEpLabel] = useState('');
  const [logline, setLogline] = useState('');
  const [createdBy, setCreatedBy] = useState('Aria K.');
  const [cover, setCover] = useState(COVER_PRESETS[0]);
  const [coverImage, setCoverImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createVideo({
      title: title.trim(),
      epLabel: epLabel.trim() || 'Episode',
      logline: logline.trim(),
      createdBy: createdBy.trim() || 'You',
      cover: coverImage || cover.trim(),
      coverImage: coverImage || null
    });

    onClose();
    setTitle('');
    setLogline('');
    setCoverImage(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Video Project">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="field-row">
            <div className="field" style={{ flex: '0 0 140px' }}>
              <label>Episode Label</label>
              <input
                type="text"
                value={epLabel}
                placeholder="e.g. Episode 4"
                onChange={(e) => setEpLabel(e.target.value)}
              />
            </div>
            <div className="field" style={{ flex: 1, minWidth: '220px' }}>
              <label>Project Title *</label>
              <input
                type="text"
                required
                value={title}
                placeholder="e.g. The Whispering Caverns"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Logline / Story Premise</label>
            <textarea
              rows={3}
              value={logline}
              placeholder="What is this episode about? What is the core narrative hook?"
              onChange={(e) => setLogline(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field" style={{ flex: 1 }}>
              <label>Lead Producer / Owner</label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Cover Concept Art / Visual Prompt</label>
            <input
              type="text"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="Visual description for thumbnail"
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {COVER_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCover(p)}
                  className="link-btn"
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'var(--panel-2)',
                    color: cover === p ? 'var(--lilac)' : 'var(--muted)'
                  }}
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Theme {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Cover Thumbnail Image File (Optional)</label>
            <ImageUploadBox
              value={coverImage}
              onChange={setCoverImage}
              label="Project Cover Artwork"
              placeholder="Upload thumbnail or poster art"
              compact={true}
            />
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <PlusCircle className="w-4 h-4" />
            Create Project Folder
          </button>
        </div>
      </form>
    </Modal>
  );
}
