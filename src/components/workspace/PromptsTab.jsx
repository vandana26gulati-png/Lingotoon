import React from 'react';
import { useVideo } from '../../context/VideoContext';
import { TOOL_OPTIONS } from '../../data/initialData';
import StatusBadge from '../common/StatusBadge';
import { Send, Copy, Sparkles, Wand2 } from 'lucide-react';

export default function PromptsTab({ video }) {
  const { updatePrompt, sendPromptToGeneration, addToast } = useVideo();

  const prompts = video.prompts || [];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Prompt copied to clipboard!', 'info');
  };

  return (
    <div>
      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '18px' }}>
        Auto-drafted from each approved shot and locked character reference sheet.
        Fine-tune prompts before dispatching to AI video synthesis tools (Runway, Kling, Veo, Sora).
      </p>

      {prompts.length === 0 ? (
        <div className="empty-state">
          <Wand2 className="w-8 h-8 text-purple-400 mb-2" />
          <div>No generated prompts yet.</div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', maxWidth: '45ch' }}>
            Go to the <b>Storyboard</b> tab and click <b>Approve</b> on any shot to automatically compile an AI video prompt here.
          </p>
        </div>
      ) : (
        <div>
          {prompts.map((p, idx) => {
            const toolMeta = TOOL_OPTIONS.find(t => t.name === p.tool) || { defaultCost: 80 };

            return (
              <div key={p.id || idx} className="prompt-block">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--lilac)', fontSize: '14px' }}>
                      Shot {p.shot}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ margin: 0 }}>Target Model:</label>
                    <select
                      style={{ width: '160px', padding: '6px 10px', fontSize: '12px' }}
                      value={p.tool}
                      onChange={(e) => updatePrompt(video.id, idx, { tool: e.target.value })}
                    >
                      {TOOL_OPTIONS.map(t => (
                        <option key={t.name} value={t.name}>
                          {t.name} ({t.defaultCost} cr)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label>Compiled AI Video Prompt</label>
                  <textarea
                    className="prompt-text"
                    value={p.text}
                    onChange={(e) => updatePrompt(video.id, idx, { text: e.target.value })}
                  />
                </div>

                <div className="review-row" style={{ justifyContent: 'space-between' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleCopy(p.text)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Prompt
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => sendPromptToGeneration(video.id, p)}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send to Generation ({toolMeta.defaultCost} cr)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
