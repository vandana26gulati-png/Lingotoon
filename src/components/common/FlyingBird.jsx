import React, { useState } from 'react';
import { Sparkles, X, Navigation, Feather, RefreshCw } from 'lucide-react';

const CHIRP_MESSAGES = [
  "Chirp! Ready to animate your story!",
  "✨ Attach images to any storyboard paragraph for AI reference!",
  "🎬 Storyboards & Script are live-synced: change in one only!",
  "💜 Purple & white studio looking fresh and soothing!",
  "🕊️ Flap flap! Flying through Lingotoon Studio!",
  "🌟 Pro tip: Lock character looks before generating video!"
];

export default function FlyingBird() {
  const [isFlying, setIsFlying] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [spin, setSpin] = useState(false);

  const nextChirp = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 700);
    setSpeechIndex((prev) => (prev + 1) % CHIRP_MESSAGES.length);
    setShowBubble(true);
  };

  const toggleFlying = () => {
    setIsFlying((prev) => !prev);
    setShowBubble(true);
  };

  return (
    <>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bird-minimized-btn"
          title="Summon Flying Bird Mascot"
        >
          <img
            src="/bird-mascot.png"
            alt="Mascot"
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--grape)' }}>
            Mascot
          </span>
        </button>
      ) : (
        <div
          className={`flying-bird-container ${isFlying ? 'mode-flying' : 'mode-perched'}`}
        >
          {/* Speech / Tip Bubble */}
          {showBubble && (
            <div className="bird-speech-bubble">
              <button
                className="bird-bubble-close"
                onClick={() => setShowBubble(false)}
                title="Dismiss tip"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="bird-speech-text">
                {CHIRP_MESSAGES[speechIndex]}
              </div>
              <div className="bird-speech-actions">
                <button
                  type="button"
                  className="bird-action-btn"
                  onClick={nextChirp}
                  title="Next tip"
                >
                  <RefreshCw className={`w-3 h-3 ${spin ? 'animate-spin' : ''}`} /> Next Chirp
                </button>
                <button
                  type="button"
                  className="bird-action-btn"
                  onClick={toggleFlying}
                  title={isFlying ? 'Perch in corner' : 'Fly across the studio'}
                >
                  <Navigation className="w-3 h-3" />
                  {isFlying ? 'Land' : 'Fly'}
                </button>
              </div>
            </div>
          )}

          {/* Animated Bird Avatar & Wings */}
          <div
            className={`bird-avatar-wrapper ${spin ? 'bird-do-flip' : ''}`}
            onClick={nextChirp}
            title="Click me for tips & animation!"
          >
            <div className="bird-halo-glow"></div>
            <img
              src="/bird-mascot.png"
              alt="Flying Bird Mascot"
              className="bird-mascot-img"
            />
            <div className="bird-floating-sparkle">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            </div>
          </div>

          {/* Quick Controls below mascot */}
          <div className="bird-controls">
            <button
              className="bird-mini-pill"
              onClick={toggleFlying}
              title={isFlying ? 'Pause flight and perch' : 'Start soaring across screen'}
            >
              <Feather className="w-3 h-3 inline mr-1" />
              {isFlying ? 'Perch' : 'Fly Free'}
            </button>
            <button
              className="bird-mini-pill"
              onClick={() => setIsMinimized(true)}
              title="Minimize mascot"
            >
              Minimize
            </button>
          </div>
        </div>
      )}
    </>
  );
}
