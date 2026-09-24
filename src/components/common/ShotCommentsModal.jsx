import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import Modal from './Modal';
import {
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function ShotCommentsModal({
  isOpen,
  onClose,
  videoId,
  shotIndex,
  shot
}) {
  const { addShotComment, deleteShotComment, toggleResolveShotComment, currentUser } = useVideo();
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState(currentUser.name);

  if (!isOpen || !shot) return null;

  const comments = shot.comments || [];
  const sceneNum = shotIndex + 1;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!commentText.trim()) return;

    addShotComment(videoId, shotIndex, {
      text: commentText.trim(),
      author: authorName.trim() || currentUser.name,
      authorRole: currentUser.role,
      avatarColor: currentUser.color
    });

    setCommentText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'recently';
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Comments & Director Notes — Scene #${sceneNum}`}
    >
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh' }}>
        
        {/* Shot Context Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#faf8fe',
            border: '1px solid var(--line)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {shot.image ? (
            <img
              src={shot.image}
              alt={`Scene ${sceneNum}`}
              style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--line)' }}
            />
          ) : (
            <div
              style={{
                width: '60px',
                height: '40px',
                borderRadius: '4px',
                background: '#ede7f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--grape)',
                fontWeight: 800,
                fontSize: '11px'
              }}
            >
              #{sceneNum}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--grape)', color: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                {shot.camera || 'Wide shot'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Duration: <b>{shot.duration || '3s'}</b>
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-bright)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shot.desc || 'No action description set.'}
            </p>
          </div>
        </div>

        {/* Comments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '4px' }}>
          {comments.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                background: '#fbf9fe',
                border: '1px dashed var(--line)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <MessageSquare className="w-6 h-6 text-purple-400" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-bright)' }}>
                No feedback on Scene #{sceneNum} yet
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Be the first to leave a director note, voice acting direction, or animation feedback!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  background: comment.resolved ? '#f9fafb' : '#ffffff',
                  border: `1px solid ${comment.resolved ? '#e5e7eb' : 'var(--line)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  opacity: comment.resolved ? 0.75 : 1,
                  boxShadow: '0 2px 6px rgba(109, 40, 217, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: comment.avatarColor || '#6d28d9',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textTransform: 'uppercase'
                      }}
                    >
                      {(comment.author || 'C').charAt(0)}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-bright)' }}>
                      {comment.author}
                    </span>
                    {comment.authorRole && (
                      <span style={{ fontSize: '10px', background: '#ede7f6', color: 'var(--grape)', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                        {comment.authorRole}
                      </span>
                    )}
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      className="quick-icon-btn"
                      onClick={() => toggleResolveShotComment(videoId, shotIndex, comment.id)}
                      title={comment.resolved ? 'Mark unresolved' : 'Mark resolved'}
                      style={{ color: comment.resolved ? '#059669' : 'var(--text-muted)' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="quick-icon-btn danger"
                      onClick={() => deleteShotComment(videoId, shotIndex, comment.id)}
                      title="Delete comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-bright)', margin: '2px 0 0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {comment.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input Composer */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Commenting as:</span>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name"
                style={{ fontSize: '11px', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: '4px', width: '130px', fontWeight: 700, color: 'var(--grape)' }}
              />
            </div>
            <span>Press <b>Ctrl + Enter</b> to post</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write feedback, pacing notes, or animation instructions..."
              rows={2}
              style={{ flex: 1, fontSize: '12px', padding: '8px 10px', resize: 'vertical' }}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!commentText.trim()}
              style={{ alignSelf: 'flex-end', padding: '8px 14px' }}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Post
            </button>
          </div>
        </form>

      </div>

      <div className="modal-foot">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
