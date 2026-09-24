import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Film,
  Volume2,
  Camera,
  Compass,
  Clock,
  LayoutGrid,
  Tv,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export default function StoryboardFullscreenModal({
  isOpen,
  onClose,
  video,
  initialIndex = 0
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('slide'); // 'slide' | 'wall'
  const timerRef = useRef(null);

  const shots = video?.shots || [];
  const currentShot = shots[currentIndex] || {};
  const totalShots = shots.length;

  // Sync initial index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, shots.length - 1)));
      setIsPlaying(false);
    }
  }, [isOpen, initialIndex, shots.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, totalShots]);

  // Slideshow auto-advance based on shot duration
  useEffect(() => {
    if (!isPlaying || !isOpen || totalShots === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const durationSec = parseFloat(currentShot.duration) || 3.5;
    const durationMs = Math.max(1500, durationSec * 1000);

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev >= totalShots - 1) {
          setIsPlaying(false);
          return 0; // loop back or stop
        }
        return prev + 1;
      });
    }, durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, isOpen, totalShots, currentShot.duration]);

  if (!isOpen || totalShots === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalShots - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalShots - 1));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'linear-gradient(180deg, #0d081a 0%, #06030b 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 9, 28, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Left: Project title & Scene counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#f3e8ff' }}>
                {video.title}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(168, 85, 247, 0.25)',
                  color: '#d8b4fe',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(168, 85, 247, 0.4)'
                }}
              >
                {video.epLabel || 'Sequence'}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
              Whole Screen Storyboard Presentation · {totalShots} Cinematic Panels
            </div>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Previous Shot (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '24px',
              padding: '7px 18px',
              fontWeight: 700,
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
            }}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause Presentation
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Play Slideshow
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Next Shot (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginLeft: '6px' }}>
            #{currentIndex + 1} <span style={{ color: '#64748b' }}>/ {totalShots}</span>
          </span>
        </div>

        {/* Right: View Toggles & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '3px',
              borderRadius: '8px',
              display: 'flex',
              gap: '2px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('slide')}
              style={{
                background: viewMode === 'slide' ? '#7c3aed' : 'transparent',
                border: 'none',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Tv className="w-3.5 h-3.5" /> Theater
            </button>
            <button
              type="button"
              onClick={() => setViewMode('wall')}
              style={{
                background: viewMode === 'wall' ? '#7c3aed' : 'transparent',
                border: 'none',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Storyboard Wall
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            title="Exit Whole Screen (Esc)"
          >
            <X className="w-4 h-4" /> Exit
          </button>
        </div>
      </div>

      {/* Main Body */}
      {viewMode === 'slide' ? (
        /* ================= 1. THEATER SLIDE PRESENTATION ================= */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '20px 32px 10px 32px'
          }}
        >
          {/* Main Visual & Details Area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              gap: '28px',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '1440px',
              width: '100%',
              margin: '0 auto',
              minHeight: 0
            }}
          >
            {/* Left: Huge 16:9 Cinema Frame */}
            <div
              style={{
                flex: '1 1 65%',
                maxWidth: '850px',
                height: '100%',
                maxHeight: '520px',
                aspectRatio: '16 / 9',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#160d2e',
                border: '2px solid rgba(168, 85, 247, 0.35)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(124, 58, 237, 0.2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {currentShot.pic || currentShot.image ? (
                <img
                  src={currentShot.pic || currentShot.image}
                  alt={`Scene ${currentIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#c4b5fd'
                  }}
                >
                  <Film className="w-14 h-14 mx-auto mb-2 text-purple-400 opacity-60" />
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>
                    Panel #{currentIndex + 1}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                    16:9 Storyboard Frame
                  </div>
                </div>
              )}

              {/* Top Scene Pill Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(15, 9, 28, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ color: '#ffd859' }}>
                  SCENE #{currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
                </span>
                <span style={{ color: '#64748b' }}>•</span>
                <span>{currentShot.duration || '3s'}</span>
              </div>

              {/* Status Badge Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background:
                    currentShot.status === 'approved'
                      ? 'rgba(16, 185, 129, 0.9)'
                      : currentShot.status === 'rejected'
                      ? 'rgba(239, 68, 68, 0.9)'
                      : 'rgba(124, 58, 237, 0.9)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}
              >
                {currentShot.status || 'Draft'}
              </div>

              {/* Floating Camera Framing tag */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(6px)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#a5f3fc',
                  border: '1px solid rgba(165, 243, 252, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Camera className="w-3.5 h-3.5" />
                {currentShot.camera || 'Wide shot'}
              </div>
            </div>

            {/* Right: Storyboard That Breakdown Panel */}
            <div
              style={{
                flex: '1 1 35%',
                maxWidth: '480px',
                background: 'rgba(24, 15, 45, 0.75)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Camera & Motion Specs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'rgba(124, 58, 237, 0.3)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(124, 58, 237, 0.5)',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Compass className="w-3 h-3" />
                  {currentShot.camera || 'Wide shot'}
                </span>

                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock className="w-3 h-3" />
                  {currentShot.duration || '3s'} Runtime
                </span>

                {currentShot.comments?.length > 0 && (
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fcd34d',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MessageSquare className="w-3 h-3" />
                    {currentShot.comments.length} Director Notes
                  </span>
                )}
              </div>

              {/* Action Description */}
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: '#a78bfa',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  🎬 Visual Action & Staging
                </label>
                <p
                  style={{
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    color: '#f1f5f9',
                    margin: 0,
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  {currentShot.desc || 'No action description provided for this shot.'}
                </p>
              </div>

              {/* Dialogue / VO */}
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  💬 Character Dialogue / Voice Over
                </label>
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontStyle: 'italic',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#e0f2fe'
                  }}
                >
                  {currentShot.dialogue ? (
                    `"${currentShot.dialogue}"`
                  ) : (
                    <span style={{ color: '#64748b' }}>[Non-verbal beat / Ambient visuals]</span>
                  )}
                </div>
              </div>

              {/* Audio / SFX */}
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: '#fbbf24',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  🔊 Audio, Music & Foley Cues
                </label>
                <div
                  style={{
                    background: 'rgba(251, 191, 36, 0.08)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    color: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    {currentShot.audioSfx || currentShot.sfx || 'Original score cue / Atmospheric background'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Filmstrip Timeline */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}
          >
            {shots.map((shot, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <div
                  key={shot.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    flex: '0 0 110px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: isSelected
                      ? '2px solid #a855f7'
                      : '1.5px solid rgba(255, 255, 255, 0.15)',
                    transform: isSelected ? 'scale(1.06)' : 'none',
                    transition: 'all 0.15s ease',
                    background: '#1a1033',
                    boxShadow: isSelected ? '0 0 16px rgba(168, 85, 247, 0.5)' : 'none'
                  }}
                  title={`Jump to Scene #${idx + 1}`}
                >
                  <div
                    style={{
                      height: '62px',
                      background: '#120924',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {shot.pic || shot.image ? (
                      <img
                        src={shot.pic || shot.image}
                        alt={`Thumb ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#a78bfa' }}>
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '3px 6px',
                      background: isSelected ? '#7c3aed' : 'rgba(0, 0, 0, 0.4)',
                      color: '#ffffff',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    #{idx + 1} · {shot.camera?.split(' ')?.[0] || 'Shot'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= 2. STORYBOARD WALL (MULTI-PANEL OVERVIEW) ================= */
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {shots.map((shot, idx) => (
            <div
              key={shot.id || idx}
              onClick={() => {
                setCurrentIndex(idx);
                setViewMode('slide');
              }}
              style={{
                background: '#180f30',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#a855f7';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 85, 247, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.25)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
              }}
            >
              <div
                style={{
                  aspectRatio: '16 / 9',
                  background: '#0d071c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {shot.pic || shot.image ? (
                  <img
                    src={shot.pic || shot.image}
                    alt={`Shot ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#a78bfa' }}>
                    #{idx + 1}
                  </span>
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#ffd859'
                  }}
                >
                  #{idx + 1}
                </div>
              </div>

              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                  <span style={{ fontWeight: 700, color: '#c4b5fd' }}>{shot.camera || 'Wide shot'}</span>
                  <span>{shot.duration || '3s'}</span>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#e2e8f0',
                    margin: 0,
                    lineHeight: 1.45,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {shot.desc || 'No action specified.'}
                </p>
                {shot.dialogue && (
                  <div
                    style={{
                      fontSize: '11px',
                      fontStyle: 'italic',
                      color: '#38bdf8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    "{shot.dialogue}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
