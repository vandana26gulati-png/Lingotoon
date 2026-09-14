import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import { CAMERA_OPTIONS } from '../../data/initialData';
import ImageUploadBox from '../common/ImageUploadBox';
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Download,
  Layers,
  ArrowRight,
  Clock,
  MessageSquare,
  Table as TableIcon
} from 'lucide-react';
import AVProductionTable from './AVProductionTable';

export default function ScriptTab({ video }) {
  const {
    updateShot,
    addShot,
    deleteShot,
    setActiveTab,
    addToast
  } = useVideo();

  const [viewMode, setViewMode] = useState('scenes'); // 'scenes' | 'screenplay'
  const shots = video.shots || [];

  // Generate continuous screenplay text from current shots
  const generateScreenplayText = () => {
    return shots
      .map((s, i) => {
        const sceneNum = `SCENE ${i + 1} - ${s.camera.toUpperCase()} (${s.duration || '3s'})`;
        const characters = s.chars ? `CHARACTERS: ${s.chars.toUpperCase()}` : '';
        const action = s.desc || '';
        const dialogue = s.dialogue
          ? `\n${(s.chars || 'CHARACTER').split(',')[0].trim().toUpperCase()}\n"${s.dialogue}"`
          : '';
        return `${sceneNum}\n${characters ? characters + '\n' : ''}${action}${dialogue}\n`;
      })
      .join('\n----------------------------------------\n\n');
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generateScreenplayText());
    addToast('Full screenplay copied to clipboard!', 'info');
  };

  const handleDownloadScript = () => {
    const text = generateScreenplayText();
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${video.title.replace(/[^a-z0-9]/gi, '_')}_screenplay.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
    addToast('Downloaded screenplay file!', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-bright)' }}>
            Script & Screenplay (Live Synced)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0', maxWidth: '65ch' }}>
            ⚡ <b>Single Source of Truth:</b> Any changes made here to dialogue, scene action, images, camera, or timing automatically update the <b>Storyboard</b> and <b>Timeline</b> in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: 'var(--panel-2)', padding: '4px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '4px', border: '1px solid var(--line)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'scenes' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '4px 12px', border: 'none' }}
              onClick={() => setViewMode('scenes')}
            >
              Scene Cards
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '4px 12px', border: 'none' }}
              onClick={() => setViewMode('table')}
              title="Two-Column AV Production Table (Scene #, Visual, Voice Over)"
            >
              <TableIcon className="w-3.5 h-3.5 mr-1" />
              AV Production Table
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'screenplay' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '4px 12px', border: 'none' }}
              onClick={() => setViewMode('screenplay')}
            >
              Full Screenplay View
            </button>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={handleCopyScript} title="Copy entire script">
            <Copy className="w-3.5 h-3.5" />
            Copy Script
          </button>

          <button className="btn btn-ghost btn-sm" onClick={handleDownloadScript} title="Download script text file">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <AVProductionTable video={video} contextTab="script" />
      ) : viewMode === 'scenes' ? (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shots.map((shot, idx) => (
              <div
                key={shot.id || idx}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: 'var(--grape)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        padding: '3px 10px',
                        borderRadius: '20px'
                      }}
                    >
                      SCENE / SHOT {idx + 1}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--toon-cyan)', fontWeight: 700 }}>
                      ⚡ Synced with Storyboard & Timeline
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      className="link-btn"
                      style={{ fontSize: '12px' }}
                      onClick={() => setActiveTab('storyboard')}
                    >
                      View on Storyboard <ArrowRight className="w-3 h-3 inline" />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ padding: '4px', border: 'none', background: 'none' }}
                      onClick={() => deleteShot(video.id, idx)}
                      title="Delete scene"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Visual Frame Image right alongside the scene action paragraph */}
                <div className="shot-body-columns">
                  <div className="shot-frame-col">
                    <ImageUploadBox
                      value={shot.pic}
                      onChange={(newPic) => updateShot(video.id, idx, { pic: newPic })}
                      label={`Scene ${idx + 1} Reference`}
                      placeholder="Attach image to scene"
                    />
                  </div>

                  <div className="shot-paras-col">
                    <div className="field">
                      <label style={{ fontWeight: 700 }}>Action & Visual Scene Description</label>
                      <textarea
                        rows={3}
                        value={shot.desc}
                        placeholder="Describe what is happening visually in the scene..."
                        onChange={(e) => updateShot(video.id, idx, { desc: e.target.value })}
                      />
                    </div>

                    <div className="field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        Dialogue / Voiceover Line
                      </label>
                      <textarea
                        rows={2}
                        value={shot.dialogue || ''}
                        placeholder='e.g. "Wait! Did you see where that light went?"'
                        onChange={(e) => updateShot(video.id, idx, { dialogue: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="field-row" style={{ marginTop: '10px' }}>
                  <div className="field" style={{ flex: 1, minWidth: '150px' }}>
                    <label>Characters</label>
                    <input
                      type="text"
                      value={shot.chars || ''}
                      placeholder="e.g. Mira, Spirit"
                      onChange={(e) => updateShot(video.id, idx, { chars: e.target.value })}
                    />
                  </div>

                  <div className="field" style={{ width: '160px' }}>
                    <label>Camera Shot Type</label>
                    <select
                      value={shot.camera}
                      onChange={(e) => updateShot(video.id, idx, { camera: e.target.value })}
                    >
                      {CAMERA_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field" style={{ width: '90px' }}>
                    <label>Duration</label>
                    <input
                      type="text"
                      value={shot.duration || '3s'}
                      onChange={(e) => updateShot(video.id, idx, { duration: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => addShot(video.id)}>
              <Plus className="w-4 h-4" />
              Add Next Scene / Shot
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontWeight: 700, color: 'var(--grape)', fontSize: '15px' }}>
              Screenplay Format — {video.title} ({video.epLabel})
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Total Scenes: <b>{shots.length}</b>
            </span>
          </div>

          <pre
            style={{
              background: '#faf8fe',
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-bright)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              maxHeight: '600px',
              overflowY: 'auto'
            }}
          >
            {generateScreenplayText() || 'No script scenes added yet. Click "Scene Cards" or "Add Next Scene" to begin writing!'}
          </pre>
        </div>
      )}
    </div>
  );
}
