import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import Modal from '../common/Modal';
import { FolderPlus, Plus, Search, Trash2, Sparkles } from 'lucide-react';

export default function AssetsTab({ video }) {
  const { addAsset, deleteAsset } = useVideo();

  const [selectedType, setSelectedType] = useState('All');
  const [searchTag, setSearchTag] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [tag, setTag] = useState('Theme');
  const [thumb, setThumb] = useState('');

  const assets = video.assets || [];

  const filteredAssets = assets.filter((a) => {
    const matchType = selectedType === 'All' || a.tag.toLowerCase() === selectedType.toLowerCase();
    const matchSearch =
      a.name.toLowerCase().includes(searchTag.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchTag.toLowerCase()) ||
      a.tag.toLowerCase().includes(searchTag.toLowerCase());
    return matchType && matchSearch;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAsset(video.id, {
      name: name.trim(),
      desc: desc.trim() || 'Visual asset for episode production',
      tag,
      thumb: thumb.trim() || `${name.trim()} mood visual`
    });

    setIsModalOpen(false);
    setName('');
    setDesc('');
    setThumb('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0, maxWidth: '65ch' }}>
          Moodboards, background art themes, prop concepts, and soundscapes assigned specifically to this episode folder.
        </p>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          Upload Asset
        </button>
      </div>

      <div className="field-row" style={{ marginBottom: '20px' }}>
        <div style={{ width: '160px' }}>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Theme">Theme / Moodboard</option>
            <option value="Character">Character Art</option>
            <option value="Concept">Concept / Prop</option>
          </select>
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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
            style={{ paddingLeft: '36px' }}
            placeholder="Search assets, tags, concepts..."
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
          />
        </div>
      </div>

      <div className="grid">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="card">
            <div className="thumb">
              <Sparkles className="w-5 h-5 text-purple-400 mb-1" />
              <span style={{ fontWeight: 600 }}>{asset.thumb}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h3 style={{ margin: 0 }}>{asset.name}</h3>
              <button
                className="btn-icon"
                style={{ padding: '4px', border: 'none', background: 'none' }}
                onClick={() => deleteAsset(video.id, asset.id)}
                title="Remove asset"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>

            <p>{asset.desc}</p>

            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <span
                className="tag"
                style={{
                  background: 'var(--panel-2)',
                  color: 'var(--iris)',
                  border: '1px solid var(--line)'
                }}
              >
                {asset.tag}
              </span>
            </div>
          </div>
        ))}

        <div className="add-card" onClick={() => setIsModalOpen(true)}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--panel-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--line)'
            }}
          >
            <FolderPlus className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div style={{ color: 'var(--text-bright)', marginBottom: '4px' }}>
              Upload Asset
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Add to episode repository
            </div>
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Asset to Episode Folder">
        <form onSubmit={handleAdd}>
          <div className="modal-body">
            <div className="field-row">
              <div className="field" style={{ flex: 1 }}>
                <label>Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber Glow Light Reference"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field" style={{ width: '150px' }}>
                <label>Asset Type</label>
                <select value={tag} onChange={(e) => setTag(e.target.value)}>
                  <option value="Theme">Theme / Mood</option>
                  <option value="Character">Character</option>
                  <option value="Concept">Concept / Prop</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Description & Palette Notes</label>
              <textarea
                rows={3}
                placeholder="Visual details, HEX color codes, lighting cues..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Visual / Art Label</label>
              <input
                type="text"
                placeholder="e.g. Amber lantern lighting swatch"
                value={thumb}
                onChange={(e) => setThumb(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Asset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
