import React, { useState } from 'react';
import Modal from './Modal';
import { useVideo } from '../../context/VideoContext';
import { formatDriveFolderUrl, getDriveDirectDownloadUrl } from '../../utils/googleDrive';
import { ExternalLink, HardDrive, Download, UploadCloud, Check, Copy, HelpCircle, Save } from 'lucide-react';

export default function GoogleDriveModal({ isOpen, onClose }) {
  const { videos, exportDataAsJSON, addToast } = useVideo();

  const [driveFolderUrl, setDriveFolderUrl] = useState(() => {
    return localStorage.getItem('lingotoon_studio_gdrive_folder') || '';
  });

  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSaveDriveFolder = (e) => {
    e.preventDefault();
    localStorage.setItem('lingotoon_studio_gdrive_folder', driveFolderUrl.trim());
    addToast('Google Drive Assets Folder saved!', 'success');
  };

  const handleOpenFolder = () => {
    const url = formatDriveFolderUrl(driveFolderUrl);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyFolder = () => {
    if (!driveFolderUrl) return;
    navigator.clipboard.writeText(driveFolderUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Google Drive link copied to clipboard!', 'info');
  };

  const handleImportFromDrive = async (e) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setIsImporting(true);
    try {
      const downloadUrl = getDriveDirectDownloadUrl(importUrl.trim());
      if (!downloadUrl) {
        throw new Error('Invalid Google Drive file link.');
      }

      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch file (HTTP ${res.status}). Make sure the file is shared with "Anyone with link can view".`);
      }

      const parsedData = await res.json();
      if (parsedData && typeof parsedData === 'object') {
        localStorage.setItem('lingotoon_studio_clean_v3', JSON.stringify(parsedData));
        addToast('Successfully synced database from Google Drive! Reloading...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        throw new Error('File did not contain valid Lingotoon database JSON.');
      }
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Could not import from Google Drive.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Google Drive Cloud Storage & Database Sync">
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Studio Assets Folder Link */}
        <div style={{ background: 'var(--panel-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-bright)' }}>
              <HardDrive className="w-4 h-4 text-purple-600" />
              <span>Studio Assets Google Drive Folder</span>
            </div>
            {driveFolderUrl && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={handleCopyFolder}
                >
                  {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11px', padding: '3px 10px' }}
                  onClick={handleOpenFolder}
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Folder ↗
                </button>
              </div>
            )}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
            Link your team's shared Google Drive folder where all image files, drawings, background art, and video clips are stored.
          </p>

          <form onSubmit={handleSaveDriveFolder} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveFolderUrl}
              onChange={(e) => setDriveFolderUrl(e.target.value)}
              style={{ flex: 1, fontSize: '12.5px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
              <Save className="w-3.5 h-3.5" /> Save Link
            </button>
          </form>
        </div>

        {/* Section 2: Hosting & Syncing Database on Google Drive */}
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-bright)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UploadCloud className="w-4 h-4 text-purple-600" />
            <span>Host & Share Database on Google Drive</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.45 }}>
            To share the entire studio state (all projects, shots, characters, prompt histories) across devices or team members via Google Drive:
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={exportDataAsJSON}
              style={{ fontSize: '12px' }}
            >
              <Download className="w-3.5 h-3.5" />
              1. Download Database JSON
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleOpenFolder}
              disabled={!driveFolderUrl}
              style={{ fontSize: '12px' }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              2. Upload to your Drive Folder
            </button>
          </div>

          <form onSubmit={handleImportFromDrive}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)', display: 'block', marginBottom: '4px' }}>
              Sync Database from a Google Drive File Link:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                style={{ flex: 1, fontSize: '12px' }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!importUrl.trim() || isImporting}
                style={{ whiteSpace: 'nowrap' }}
              >
                {isImporting ? 'Syncing...' : 'Sync Data'}
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Quick 3-Step Guide */}
        <div style={{ background: '#faf8fe', border: '1px dashed var(--line-light)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--grape)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Use Google Drive as Your Image Host:</span>
          </div>
          <ol style={{ fontSize: '11.5px', color: 'var(--text-muted)', paddingLeft: '18px', lineHeight: 1.6 }}>
            <li>Right click any image in your Google Drive folder and choose <b>Share &gt; Copy link</b>.</li>
            <li>Make sure General access is set to <b>"Anyone with the link can view"</b>.</li>
            <li>Paste that link into any shot, character, or asset in this studio — Lingotoon automatically displays it in high-res!</li>
          </ol>
        </div>
      </div>

      <div className="modal-foot">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
