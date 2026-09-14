import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import { CAMERA_OPTIONS } from '../../data/initialData';
import ImageUploadBox from '../common/ImageUploadBox';
import {
  Table as TableIcon,
  FileSpreadsheet,
  Copy,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Film,
  Mic,
  Clock,
  Check,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function AVProductionTable({ video, contextTab = 'storyboard' }) {
  const {
    updateShot,
    addShot,
    deleteShot,
    moveShot,
    duplicateShot,
    addToast
  } = useVideo();

  const [copiedForSheets, setCopiedForSheets] = useState(false);
  const shots = video.shots || [];

  // Calculate total runtime in seconds
  const totalSeconds = shots.reduce((acc, shot) => {
    const num = parseInt(shot.duration) || 3;
    return acc + num;
  }, 0);

  // Export to CSV for Google Sheets / Excel
  const handleExportCSV = () => {
    if (!shots.length) {
      addToast('No scenes to export!', 'error');
      return;
    }

    const headers = [
      'Scene Number',
      'Camera Framing',
      'Duration',
      'Characters',
      'Screen Visuals',
      'Voice Over / Dialogue',
      'Image URL',
      'Status'
    ];

    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${s}"`;
    };

    const rows = shots.map((shot, idx) => [
      `Scene ${idx + 1}`,
      escapeCSV(shot.camera || 'wide'),
      escapeCSV(shot.duration || '3s'),
      escapeCSV(shot.chars || ''),
      escapeCSV(shot.desc || ''),
      escapeCSV(shot.dialogue || ''),
      escapeCSV(shot.image || ''),
      escapeCSV(shot.status || 'approved')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${video.title.replace(/[^a-z0-9]/gi, '_')}_production_breakdown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Downloaded Production Breakdown for Google Sheets!', 'success');
  };

  // Copy Tab-Separated Values (TSV) directly to clipboard for 1-click paste into Google Sheets
  const handleCopyForGoogleSheets = () => {
    if (!shots.length) {
      addToast('No scenes to copy!', 'error');
      return;
    }

    const headers = ['Scene #', 'Camera Angle', 'Duration', 'Characters', 'Screen Visuals (Action)', 'Voice Over (VO) / Dialogue', 'Status'];
    
    const rows = shots.map((shot, idx) => [
      `Scene ${idx + 1}`,
      (shot.camera || 'wide').toUpperCase(),
      shot.duration || '3s',
      shot.chars || '',
      (shot.desc || '').replace(/\t|\r?\n/g, ' '),
      (shot.dialogue || '').replace(/\t|\r?\n/g, ' '),
      (shot.status || 'approved').toUpperCase()
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedForSheets(true);
    setTimeout(() => setCopiedForSheets(false), 2500);
    addToast('Copied for Google Sheets! Paste (Ctrl+V) directly into any Google Sheet.', 'info');
  };

  return (
    <div className="av-table-container">
      {/* Table Action Bar */}
      <div className="av-table-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="av-toolbar-badge">
            <Film className="w-3.5 h-3.5 text-purple-600" />
            <span>{shots.length} Scenes / Shots</span>
          </div>
          <div className="av-toolbar-badge">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Est. Runtime: ~{totalSeconds}s ({Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s)</span>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            ⚡ <b>Live Synced:</b> Edits here automatically reflect across Storyboard, Script, and Timeline.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '11.5px', padding: '5px 12px' }}
            onClick={handleCopyForGoogleSheets}
            title="Copy tab-delimited table to paste directly into Google Sheets (Ctrl+V)"
          >
            {copiedForSheets ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedForSheets ? 'Copied for Sheets!' : 'Copy for Google Sheets'}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '11.5px', padding: '5px 12px' }}
            onClick={handleExportCSV}
            title="Download CSV file for Google Sheets or Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
            Export to Google Sheets (.csv)
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ fontSize: '11.5px', padding: '5px 12px' }}
            onClick={() => addShot(video.id)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Scene
          </button>
        </div>
      </div>

      {/* The Two-Column AV Production Table */}
      <div className="av-table-wrapper">
        <table className="av-table">
          <thead>
            <tr>
              <th style={{ width: '130px' }} className="av-th">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Scene / Shot</span>
                </div>
              </th>
              <th style={{ width: '38%' }} className="av-th">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Film className="w-3.5 h-3.5 text-purple-500" />
                  <span>Screen Visuals (Video)</span>
                </div>
              </th>
              <th style={{ width: '38%' }} className="av-th">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mic className="w-3.5 h-3.5 text-purple-500" />
                  <span>Voice Over (VO) & Audio</span>
                </div>
              </th>
              <th style={{ width: '130px', textAlign: 'right' }} className="av-th">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shots.map((shot, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === shots.length - 1;

              return (
                <tr key={shot.id || idx} className="av-tr">
                  {/* COLUMN 1: Scene # & Camera / Timing */}
                  <td className="av-td av-cell-scene">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="av-scene-pill">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <input
                          type="text"
                          value={shot.duration || '3s'}
                          onChange={(e) => updateShot(video.id, idx, 'duration', e.target.value)}
                          className="av-input-duration"
                          placeholder="3s"
                          title="Shot duration in seconds"
                        />
                      </div>

                      <div className="av-camera-select-wrap">
                        <select
                          value={shot.camera || 'wide'}
                          onChange={(e) => updateShot(video.id, idx, 'camera', e.target.value)}
                          className="av-camera-select"
                        >
                          {CAMERA_OPTIONS.map((cam) => (
                            <option key={cam.id} value={cam.id}>
                              {cam.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <select
                        value={shot.status || 'approved'}
                        onChange={(e) => updateShot(video.id, idx, 'status', e.target.value)}
                        className={`av-status-select ${shot.status || 'approved'}`}
                      >
                        <option value="approved">● Approved</option>
                        <option value="pending">◐ Review</option>
                        <option value="rejected">✕ Revise</option>
                      </select>
                    </div>
                  </td>

                  {/* COLUMN 2: Screen Visuals */}
                  <td className="av-td av-cell-visual">
                    <div className="av-visual-layout">
                      <div className="av-visual-img">
                        <ImageUploadBox
                          value={shot.image}
                          onChange={(val) => updateShot(video.id, idx, 'image', val)}
                          label={`Visual #${idx + 1}`}
                          compact={true}
                        />
                      </div>

                      <div className="av-visual-desc">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Visual Action / Framing:
                          </span>
                          <input
                            type="text"
                            value={shot.chars || ''}
                            onChange={(e) => updateShot(video.id, idx, 'chars', e.target.value)}
                            placeholder="Characters involved..."
                            className="av-input-chars"
                            title="Characters on screen"
                          />
                        </div>
                        <textarea
                          value={shot.desc || ''}
                          onChange={(e) => updateShot(video.id, idx, 'desc', e.target.value)}
                          placeholder="Describe the screen visuals, character movement, camera transition, and background setting..."
                          className="av-textarea-visual"
                          rows={3}
                        />
                      </div>
                    </div>
                  </td>

                  {/* COLUMN 3: Voice Over (VO) & Audio */}
                  <td className="av-td av-cell-audio">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="av-vo-badge">
                          VO / DIALOGUE
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Speaker: <b>{(shot.chars || 'NARRATOR').split(',')[0].trim()}</b>
                        </span>
                      </div>

                      <textarea
                        value={shot.dialogue || ''}
                        onChange={(e) => updateShot(video.id, idx, 'dialogue', e.target.value)}
                        placeholder="Type voice over narration, character dialogue, or subtitle lines..."
                        className="av-textarea-audio"
                        rows={3}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>SFX / Music:</span>
                        <input
                          type="text"
                          value={shot.audioCue || shot.notes || ''}
                          onChange={(e) => updateShot(video.id, idx, 'audioCue', e.target.value)}
                          placeholder="Optional sound effects, Foley, or background music cue..."
                          className="av-input-sfx"
                        />
                      </div>
                    </div>
                  </td>

                  {/* COLUMN 4: Actions */}
                  <td className="av-td av-cell-actions">
                    <div className="av-action-btn-group">
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button
                          type="button"
                          className="quick-icon-btn"
                          disabled={isFirst}
                          onClick={() => moveShot(video.id, idx, idx - 1)}
                          title="Move Scene Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="quick-icon-btn"
                          disabled={isLast}
                          onClick={() => moveShot(video.id, idx, idx + 1)}
                          title="Move Scene Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="quick-icon-btn"
                        onClick={() => duplicateShot(video.id, idx)}
                        title="Duplicate Scene"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        className="quick-icon-btn danger"
                        onClick={() => deleteShot(video.id, idx)}
                        title="Delete Scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {shots.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
              No scenes in this project yet.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => addShot(video.id)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Scene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
