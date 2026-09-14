import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Maximize2, X, Sparkles } from 'lucide-react';
import Modal from './Modal';

const PRESET_IMAGES = [
  { name: 'Lingotoon Mascot Bird', url: '/bird-mascot.png' },
  { name: 'Studio Logo Artwork', url: '/lingotoon-logo.png' }
];

export default function ImageUploadBox({
  value,
  onChange,
  label = 'Visual Frame Reference',
  placeholder = 'Add reference sketch or shot visual',
  compact = false
}) {
  const fileInputRef = useRef(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (.png, .jpg, .webp, .svg, .gif)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target?.result);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setIsUrlModalOpen(false);
    }
  };

  const isImageValid = Boolean(
    value &&
    (value.startsWith('data:image/') ||
     value.startsWith('http://') ||
     value.startsWith('https://') ||
     value.startsWith('/') ||
     value.endsWith('.png') ||
     value.endsWith('.jpg') ||
     value.endsWith('.jpeg') ||
     value.endsWith('.webp'))
  );

  return (
    <div className={`img-upload-box-wrapper ${compact ? 'compact' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {isImageValid ? (
        <div className="img-preview-card">
          <div className="img-frame-container" onClick={() => setIsZoomOpen(true)}>
            <img src={value} alt="Visual frame reference" className="img-frame-content" />
            <div className="img-frame-overlay">
              <span className="img-overlay-action">
                <Maximize2 className="w-3.5 h-3.5" /> View full
              </span>
            </div>
          </div>

          <div className="img-card-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => fileInputRef.current?.click()}
              title="Replace with another file from computer"
            >
              <Upload className="w-3 h-3 mr-1" /> Replace File
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => setIsUrlModalOpen(true)}
              title="Change using URL or preset"
            >
              <LinkIcon className="w-3 h-3 mr-1" /> URL
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => onChange(null)}
              title="Remove image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="img-empty-dropzone">
          <div className="img-empty-icon-wrap">
            <ImageIcon className="w-5 h-5 text-purple-500" />
          </div>
          <div className="img-empty-text">
            <span style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '12px' }}>
              {label}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {placeholder}
            </span>
          </div>
          <div className="img-empty-buttons">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3 h-3" />
              Upload Image
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => setIsUrlModalOpen(true)}
            >
              <LinkIcon className="w-3 h-3" />
              URL / Presets
            </button>
          </div>
        </div>
      )}

      {/* URL or Presets Modal */}
      <Modal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        title="Add Image Reference via URL or Preset"
      >
        <form onSubmit={handleSaveUrl}>
          <div className="modal-body">
            <div className="field">
              <label>Direct Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or /bird-mascot.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Quick Lingotoon Presets:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11.5px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      onChange(preset.url);
                      setIsUrlModalOpen(false);
                    }}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setIsUrlModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!urlInput.trim()}>
              Save URL
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal */}
      {isZoomOpen && isImageValid && (
        <div className="lightbox-backdrop" onClick={() => setIsZoomOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setIsZoomOpen(false)}
              title="Close full view"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={value} alt="Full frame view" className="lightbox-image" />
            <div className="lightbox-caption">
              <span>{label}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '11px' }}
                onClick={() => setIsZoomOpen(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
