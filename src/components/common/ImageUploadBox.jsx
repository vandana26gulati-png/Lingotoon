import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Maximize2, X, Sparkles, HardDrive, ExternalLink, Loader2, CloudUpload, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import {
  parseGoogleDriveUrl,
  isGoogleDriveUrl,
  formatDriveFolderUrl,
  getOwnerDriveConfig,
  isOwnerDriveConfigured,
  uploadImageToOwnerDrive
} from '../../utils/googleDrive';

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
  const [activeTab, setActiveTab] = useState('gdrive'); // 'gdrive' | 'direct' | 'presets'
  const [urlInput, setUrlInput] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  
  // Cloud Drive Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const driveConfig = getOwnerDriveConfig();
  const isCloudHostActive = isOwnerDriveConfigured() && driveConfig.autoUpload;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (.png, .jpg, .webp, .svg, .gif)');
      return;
    }

    setUploadError(null);
    setUploadSuccess(false);

    // If Owner's Google Drive is configured for auto-upload, send directly to owner's Drive!
    if (isCloudHostActive) {
      try {
        setIsUploading(true);
        setUploadStatusMsg('Uploading to Owner Google Drive (TBs Storage)...');

        const uploadResult = await uploadImageToOwnerDrive(file, file.name);
        onChange(uploadResult.directUrl);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      } catch (err) {
        console.warn('Direct Google Drive upload failed, falling back to local file storage:', err);
        setUploadError(`Drive upload notice: ${err.message || 'Check connection'}. Saved locally instead.`);
        
        // Fallback: Read as local data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          onChange(event.target?.result);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
        setUploadStatusMsg('');
        e.target.value = '';
      }
      return;
    }

    // Default local file reader
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target?.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      const parsed = parseGoogleDriveUrl(urlInput.trim());
      onChange(parsed);
      setUrlInput('');
      setIsUrlModalOpen(false);
    }
  };

  const isFromDrive = Boolean(value && isGoogleDriveUrl(value));

  const isImageValid = Boolean(
    value &&
    (value.startsWith('data:image/') ||
     value.startsWith('http://') ||
     value.startsWith('https://') ||
     value.startsWith('/') ||
     isFromDrive ||
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

      {/* Cloud Uploading In-Progress State */}
      {isUploading && (
        <div
          style={{
            minHeight: compact ? '80px' : '110px',
            background: 'linear-gradient(135deg, #fbf9ff 0%, #f3eeff 100%)',
            border: '1.5px dashed var(--grape)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--grape)', fontWeight: 700, fontSize: '12.5px' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{uploadStatusMsg}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Writing directly to your studio's Google Drive cloud host...
          </span>
        </div>
      )}

      {/* Upload notice message */}
      {uploadError && !isUploading && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {!isUploading && isImageValid ? (
        <div className="img-preview-card">
          <div className="img-frame-container" onClick={() => setIsZoomOpen(true)}>
            <img src={value} alt="Visual frame reference" className="img-frame-content" />
            <div className="img-frame-overlay">
              <span className="img-overlay-action">
                <Maximize2 className="w-3.5 h-3.5" /> View full
              </span>
            </div>
            {isFromDrive && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: 'rgba(21, 13, 38, 0.78)',
                  color: '#ffd859',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
              >
                <HardDrive className="w-3 h-3" />
                <span>Google Drive Host</span>
              </div>
            )}
          </div>

          <div className="img-card-actions">
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => fileInputRef.current?.click()}
                title={isCloudHostActive ? "Upload new image to Owner's Drive" : "Replace with file from computer"}
              >
                {isCloudHostActive ? <CloudUpload className="w-3 h-3 mr-1 text-purple-600" /> : <Upload className="w-3 h-3 mr-1" />}
                {isCloudHostActive ? 'Upload to Drive' : 'Replace'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => {
                  setActiveTab('gdrive');
                  setIsUrlModalOpen(true);
                }}
                title="Paste Google Drive link or web URL"
              >
                <LinkIcon className="w-3 h-3 mr-1 text-purple-600" /> Link
              </button>
            </div>

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
      ) : (!isUploading && (
        <div className="img-empty-dropzone">
          <div className="img-empty-icon-wrap">
            {isCloudHostActive ? (
              <CloudUpload className="w-4 h-4 text-purple-600" />
            ) : (
              <ImageIcon className="w-4 h-4 text-purple-500" />
            )}
          </div>
          <div className="img-empty-text">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '12px' }}>
                {label}
              </span>
              {isCloudHostActive && (
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                  title="Direct uploads are automatically stored in your Google Drive with TBs of storage"
                >
                  ☁️ Drive Host Active
                </span>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {isCloudHostActive ? 'Uploads save straight to Studio Google Drive' : placeholder}
            </span>
          </div>
          <div className="img-empty-buttons">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {isCloudHostActive ? (
                <>
                  <CloudUpload className="w-3 h-3 text-yellow-300" />
                  Upload to Drive
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3" />
                  Upload Image
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px' }}
              onClick={() => {
                setActiveTab('gdrive');
                setIsUrlModalOpen(true);
              }}
            >
              <HardDrive className="w-3 h-3 text-purple-600" />
              Drive Link
            </button>
          </div>
        </div>
      ))}

      {/* Cloud & URL Link Modal */}
      <Modal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        title="Add Image via Google Drive or Web Link"
      >
        <form onSubmit={handleSaveUrl}>
          <div className="modal-body">
            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'gdrive' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11.5px', padding: '4px 12px' }}
                onClick={() => setActiveTab('gdrive')}
              >
                <HardDrive className="w-3 h-3 mr-1" /> Google Drive Link
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'direct' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11.5px', padding: '4px 12px' }}
                onClick={() => setActiveTab('direct')}
              >
                <LinkIcon className="w-3 h-3 mr-1" /> Web URL
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'presets' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '11.5px', padding: '4px 12px' }}
                onClick={() => setActiveTab('presets')}
              >
                <Sparkles className="w-3 h-3 mr-1" /> Studio Presets
              </button>
            </div>

            {activeTab === 'gdrive' && (
              <div>
                <div className="field">
                  <label>Paste Google Drive Image Share Link</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ background: '#faf8fe', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--line-light)', marginTop: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  💡 <b>Quick Tip:</b> In Google Drive, right click your image &gt; <b>Share &gt; Copy Link</b> (make sure it is set to "Anyone with link can view"). Paste it here and Lingotoon will automatically host & render it in high-res!
                </div>

                {driveConfig.folderId && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={formatDriveFolderUrl(driveConfig.folderId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                      Open Studio Google Drive Assets Folder ↗
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'direct' && (
              <div className="field">
                <label>Direct Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {activeTab === 'presets' && (
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Select a preset studio asset:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '11.5px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => {
                        onChange(preset.url);
                        setIsUrlModalOpen(false);
                      }}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setIsUrlModalOpen(false)}>
              Cancel
            </button>
            {activeTab !== 'presets' && (
              <button type="submit" className="btn btn-primary" disabled={!urlInput.trim()}>
                Attach Image
              </button>
            )}
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
              {isFromDrive && (
                <span style={{ color: '#ffd859', fontSize: '11px', fontWeight: 600 }}>
                  ☁️ Hosted on Studio Google Drive (TBs Storage)
                </span>
              )}
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
