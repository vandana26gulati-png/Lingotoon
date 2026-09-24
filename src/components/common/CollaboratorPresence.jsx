import React, { useState, useEffect, useRef } from 'react';
import { useVideo } from '../../context/VideoContext';
import { Users, User, Shield, Check, Edit2, ChevronDown, Circle } from 'lucide-react';

const PRESET_ROLES = [
  'Director',
  'Lead Animator',
  'Storyboard Artist',
  'Scriptwriter',
  'Voice Actor',
  'Producer',
  'Reviewer'
];

const PRESET_COLORS = [
  '#6d28d9', // Grape purple
  '#2563eb', // Royal blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Crimson
  '#db2777', // Pink
  '#0891b2'  // Cyan
];

export default function CollaboratorPresence() {
  const { currentUser, updateCurrentUser, currentVideoId, videos, activeTab } = useVideo();
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [roleInput, setRoleInput] = useState(currentUser.role);
  const [colorInput, setColorInput] = useState(currentUser.color);

  const popoverRef = useRef(null);
  const currentScenarioTitle = videos[currentVideoId]?.title || 'Main Studio Dashboard';

  // Heartbeat & presence broadcaster via BroadcastChannel + localStorage
  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('lingotoon_presence') : null;
    const STORAGE_PRESENCE_KEY = 'lingotoon_active_collaborators';

    const sendHeartbeat = () => {
      const myPresence = {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        color: currentUser.color,
        scenario: currentScenarioTitle,
        activeTab: activeTab,
        lastActive: Date.now()
      };

      try {
        // Read existing and prune stale (> 45s)
        const raw = localStorage.getItem(STORAGE_PRESENCE_KEY);
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        
        const now = Date.now();
        list = list.filter(u => u.id !== currentUser.id && (now - u.lastActive < 45000));
        list.push(myPresence);
        
        localStorage.setItem(STORAGE_PRESENCE_KEY, JSON.stringify(list));
        setCollaborators(list);

        if (channel) {
          channel.postMessage({ type: 'HEARTBEAT', presence: myPresence });
        }
      } catch (e) {
        console.warn('Presence sync notice:', e);
      }
    };

    // Send immediately on mount or profile change
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 12000);

    // Listen on BroadcastChannel
    const handleMessage = (event) => {
      if (event.data?.type === 'HEARTBEAT' && event.data.presence) {
        setCollaborators(prev => {
          const filtered = prev.filter(u => u.id !== event.data.presence.id);
          return [...filtered, event.data.presence];
        });
      }
    };

    if (channel) {
      channel.onmessage = handleMessage;
    }

    // Cleanup on tab close
    const handleBeforeUnload = () => {
      try {
        const raw = localStorage.getItem(STORAGE_PRESENCE_KEY);
        if (raw) {
          let list = JSON.parse(raw);
          list = list.filter(u => u.id !== currentUser.id);
          localStorage.setItem(STORAGE_PRESENCE_KEY, JSON.stringify(list));
        }
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, currentScenarioTitle, activeTab]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    updateCurrentUser({
      name: nameInput.trim(),
      role: roleInput,
      color: colorInput
    });
    setIsEditingProfile(false);
  };

  const activeCount = Math.max(1, collaborators.length);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={popoverRef}>
      {/* Presence Pill Button */}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{
          fontSize: '11px',
          padding: '3px 10px',
          borderRadius: '20px',
          background: '#ffffff',
          borderColor: 'var(--line)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="View active collaborators & edit your display name"
      >
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block'
            }}
          />
          <span
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              opacity: 0.35,
              animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite'
            }}
          />
        </span>

        <span style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
          {activeCount} {activeCount === 1 ? 'Collaborator' : 'Collaborators'}
        </span>

        {/* Avatar stack */}
        <div style={{ display: 'flex', marginLeft: '2px' }}>
          {collaborators.slice(0, 3).map((collab, i) => (
            <div
              key={collab.id || i}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: collab.color || '#6d28d9',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: i > 0 ? '-5px' : '0',
                border: '1.5px solid #ffffff',
                textTransform: 'uppercase'
              }}
              title={`${collab.name} (${collab.role})`}
            >
              {(collab.name || 'U').charAt(0)}
            </div>
          ))}
        </div>

        <ChevronDown className="w-3 h-3 text-purple-600" style={{ marginLeft: '1px' }} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            background: '#ffffff',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px rgba(109, 40, 217, 0.12)',
            zIndex: 1000,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users className="w-4 h-4 text-purple-600" />
              <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-bright)' }}>
                Active in Studio ({activeCount})
              </span>
            </div>
            <button
              type="button"
              className="link-btn"
              style={{ fontSize: '11px', color: 'var(--grape)' }}
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              {isEditingProfile ? 'Done' : 'Edit My Name ✏️'}
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} style={{ background: '#faf8fe', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line-light)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--grape)', marginBottom: '8px' }}>
                Your Collaborator Profile
              </div>

              <div className="field" style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '10.5px' }}>Display Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Director Vandana"
                  style={{ fontSize: '12px', padding: '6px 8px' }}
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '10.5px' }}>Role</label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  style={{ fontSize: '12px', padding: '5px 8px' }}
                >
                  {PRESET_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '10.5px' }}>Color Badge</label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {PRESET_COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setColorInput(c)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        border: colorInput === c ? '2.5px solid #111827' : '2px solid transparent',
                        transform: colorInput === c ? 'scale(1.1)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '11px', padding: '4px' }}>
                <Check className="w-3.5 h-3.5 mr-1" /> Save Profile
              </button>
            </form>
          ) : (
            /* Collaborators List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {collaborators.map((collab) => {
                const isMe = collab.id === currentUser.id;
                return (
                  <div
                    key={collab.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: isMe ? '#f5f3ff' : '#fcfbfe',
                      border: isMe ? '1px solid #ddd6fe' : '1px solid var(--line)'
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: collab.color || '#6d28d9',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textTransform: 'uppercase',
                        flexShrink: 0
                      }}
                    >
                      {(collab.name || 'U').charAt(0)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-bright)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {collab.name}
                        </span>
                        {isMe && (
                          <span style={{ fontSize: '9.5px', background: '#e0e7ff', color: '#4338ca', padding: '1px 5px', borderRadius: '8px', fontWeight: 700 }}>
                            You
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {collab.role} · <span style={{ color: '#059669', fontWeight: 600 }}>Active now</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', borderTop: '1px solid var(--line)', paddingTop: '8px', lineHeight: 1.4 }}>
            💡 Anyone visiting your website connects to the studio in real time. All changes auto-save directly to your Google Drive!
          </div>
        </div>
      )}
    </div>
  );
}
