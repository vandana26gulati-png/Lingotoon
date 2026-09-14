import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import VideoCard from './VideoCard';
import NewVideoModal from './NewVideoModal';
import { Plus, Search, Sparkles } from 'lucide-react';

export default function VideoGrid() {
  const { videos } = useVideo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const videoList = Object.values(videos);

  const filtered = videoList.filter(v => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.logline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || v.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="view-container">
      <div className="page-head">
        <div>
          <h1>All Videos</h1>
          <p>
            Every episode in production, each in its own dedicated project folder with storyboards, prompts, generation timeline, characters, and live platform performance.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New Video Project
        </button>
      </div>

      <div className="field-row" style={{ marginBottom: '22px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search
            className="w-4 h-4 text-muted"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
          <input
            type="text"
            placeholder="Search projects, loglines, creators..."
            style={{ paddingLeft: '36px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ width: '160px' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="video-grid">
        {filtered.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}

        <div className="add-card" onClick={() => setIsModalOpen(true)}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--panel-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--line)'
            }}
          >
            <Plus className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div style={{ color: 'var(--text-bright)', marginBottom: '4px' }}>
              Create New Episode Folder
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
              Initializes empty storyboard, prompt compiler & timeline
            </div>
          </div>
        </div>
      </div>

      <NewVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
