import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import Modal from '../common/Modal';
import { Lock, Unlock, Plus, Trash2, User, Sparkles } from 'lucide-react';

export default function CharactersTab({ video }) {
  const { addCharacter, toggleCharacterLock, deleteCharacter } = useVideo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [tag, setTag] = useState('Locked');
  const [thumb, setThumb] = useState('');

  const characters = video.characters || [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCharacter(video.id, {
      name: name.trim(),
      desc: desc.trim() || 'Character reference details',
      tag,
      thumb: thumb.trim() || `${name.trim()} reference sheet`
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
          Lock a character's look before it is rendered in any AI video shot.
          Locked characters carry their visual reference tags and outfit traits into generated prompts automatically.
        </p>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          Add Character
        </button>
      </div>

      <div className="grid">
        {characters.map((char) => {
          const isLocked = char.tag === 'Locked';

          return (
            <div key={char.id} className="card">
              <div className="thumb">
                <Sparkles className="w-5 h-5 text-purple-400 mb-1" />
                <span style={{ fontWeight: 600 }}>{char.thumb}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ margin: 0 }}>{char.name}</h3>
                <button
                  className="btn-icon"
                  style={{ padding: '4px', border: 'none', background: 'none' }}
                  onClick={() => deleteCharacter(video.id, char.id)}
                  title="Remove character"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>

              <p>{char.desc}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
                <span
                  className="tag"
                  style={{
                    background: isLocked ? 'var(--good-bg)' : 'var(--warn-bg)',
                    color: isLocked ? 'var(--good)' : 'var(--warn)',
                    border: `1px solid ${isLocked ? 'var(--good-border)' : 'var(--warn-border)'}`
                  }}
                >
                  {isLocked ? 'Locked Reference' : 'Draft Concept'}
                </span>

                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={() => toggleCharacterLock(video.id, char.id)}
                  title={isLocked ? 'Unlock character' : 'Lock character'}
                >
                  {isLocked ? (
                    <>
                      <Unlock className="w-3 h-3 mr-1 inline" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1 inline" />
                      Lock Look
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

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
            <User className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div style={{ color: 'var(--text-bright)', marginBottom: '4px' }}>
              Add New Character
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Lock look & sheet reference
            </div>
          </div>
        </div>
      </div>

      {/* Add Character Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Story Character">
        <form onSubmit={handleAdd}>
          <div className="modal-body">
            <div className="field-row">
              <div className="field" style={{ flex: 1 }}>
                <label>Character Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field" style={{ width: '130px' }}>
                <label>Status Tag</label>
                <select value={tag} onChange={(e) => setTag(e.target.value)}>
                  <option value="Locked">Locked</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Visual Description & Outfit Traits</label>
              <textarea
                rows={3}
                placeholder="e.g. Young forest guide, teal cloak, silver braid, amber eyes, cinematic fantasy style"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Reference Sheet / Art Concept Label</label>
              <input
                type="text"
                placeholder="e.g. Mira — 3 views (front, 3/4, profile)"
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
              Save Character
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
