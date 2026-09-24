import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import StatusBadge from '../common/StatusBadge';
import EditVideoModal from './EditVideoModal';
import GoogleDriveModal from '../common/GoogleDriveModal';
import CloudSyncStatus from '../common/CloudSyncStatus';
import CollaboratorPresence from '../common/CollaboratorPresence';
import { ArrowLeft, Edit3, Sparkles, HardDrive, ExternalLink } from 'lucide-react';
import { formatDriveFolderUrl, isGoogleDriveUrl } from '../../utils/googleDrive';

export default function WorkspaceHeader({ video }) {
  const { setTopView } = useVideo();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);

  const studioDriveFolder = localStorage.getItem('lingotoon_studio_gdrive_folder') || '';

  const coverSrc = video.coverImage || video.cover;
  const isImage = Boolean(
    coverSrc &&
    typeof coverSrc === 'string' &&
    (coverSrc.startsWith('data:image/') ||
     coverSrc.startsWith('http://') ||
     coverSrc.startsWith('https://') ||
     coverSrc.startsWith('/') ||
     isGoogleDriveUrl(coverSrc) ||
     /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(coverSrc))
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="back-link" onClick={() => setTopView('videos')}>
            <ArrowLeft className="w-4 h-4" />
            Back to All Videos
          </div>
          <CloudSyncStatus />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <CollaboratorPresence />
          {studioDriveFolder ? (
            <a
              href={formatDriveFolderUrl(studioDriveFolder)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', color: 'var(--grape)', borderColor: 'var(--line-light)' }}
              title="Open Google Drive assets folder for this project"
            >
              <HardDrive className="w-3.5 h-3.5 text-yellow-500" />
              Open Studio Drive ↗
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px' }}
              onClick={() => setIsDriveOpen(true)}
            >
              <HardDrive className="w-3.5 h-3.5 text-purple-600" />
              Link Google Drive
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsEditOpen(true)}
            style={{ fontSize: '11px' }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Details
          </button>
        </div>
      </div>

      <div className="video-header" style={{ border: '1px solid var(--line)', background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <div className="video-cover" style={{ overflow: 'hidden', position: 'relative', borderRadius: 'var(--radius-md)' }}>
          {isImage ? (
            <img
              src={coverSrc}
              alt={video.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <>
              <Sparkles className="w-5 h-5 mb-1 text-purple-400" />
              <span style={{ fontWeight: 600, fontSize: '11px', textAlign: 'center', padding: '0 8px' }}>{video.cover}</span>
            </>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ep-label" style={{ fontSize: '12px', color: 'var(--iris)', fontWeight: 700, marginBottom: '2px' }}>
            {video.epLabel}
          </div>

          <h1 style={{ fontSize: '24px', margin: '2px 0 6px 0', color: 'var(--text-bright)' }}>
            {video.title}
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: '13px', maxWidth: '64ch', lineHeight: 1.5, margin: '0 0 12px 0' }}>
            {video.logline}
          </p>

          <div className="meta-row" style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>Lead: <b>{video.createdBy}</b></div>
            <div>Created: <b>{video.createdDate}</b></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Status: <StatusBadge status={video.status} />
            </div>
          </div>
        </div>
      </div>

      <EditVideoModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        video={video}
      />

      <GoogleDriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
      />
    </div>
  );
}
