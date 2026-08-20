import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Globe, LogIn, BookOpen, Settings, Zap, Star, Users, Swords, Trophy, ChevronRight } from 'lucide-react';
import { TutorialModal } from '../components/tutorial/TutorialModal';
import { SettingsModal } from '../components/settings/SettingsModal';

const verses = [
  { id: 'naruto', name: 'Naruto', emoji: '🍃', color: '#ff6b35', glow: 'rgba(255,107,53,0.4)' },
  { id: 'bleach', name: 'Bleach', emoji: '⚔️', color: '#4f8cff', glow: 'rgba(79,140,255,0.4)' },
  { id: 'dbz', name: 'Dragon Ball', emoji: '🔮', color: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
  { id: 'one-piece', name: 'One Piece', emoji: '🏴‍☠️', color: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
  { id: 'jjk', name: 'Jujutsu Kaisen', emoji: '🤞', color: '#9333ea', glow: 'rgba(147,51,234,0.4)' },
  { id: 'demon-slayer', name: 'Demon Slayer', emoji: '🌊', color: '#f43f5e', glow: 'rgba(244,63,94,0.4)' },
  { id: 'mha', name: 'My Hero Academia', emoji: '💥', color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
];

const features = [
  { icon: <Zap size={18} />, label: 'Fast Drafts', desc: 'Quick 15-pick sessions' },
  { icon: <Users size={18} />, label: 'Multiplayer', desc: 'Local or online battles' },
  { icon: <Trophy size={18} />, label: 'Tournaments', desc: 'Full bracket competitions' },
  { icon: <Swords size={18} />, label: 'Battle Sim', desc: 'Auto-resolve matches' },
];

export const Landing = () => {
  const navigate = useNavigate();
  const [activeVerse, setActiveVerse] = useState('dbz');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentVerse = verses.find(v => v.id === activeVerse);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* Ambient background orbs */}
      <div
        style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: '500px', height: '500px',
          borderRadius: '9999px',
          background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: '600px', height: '600px',
          borderRadius: '9999px',
          background: `radial-gradient(circle, ${currentVerse?.glow?.replace('0.4', '0.14')} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          transition: 'background 0.6s ease',
        }}
      />
      <div
        style={{
          position: 'absolute', top: '40%', left: '60%',
          width: '300px', height: '300px',
          borderRadius: '9999px',
          background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Verse Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1rem',
          padding: '0.4rem',
          animation: 'slide-up 0.4s ease forwards',
        }}
      >
        {verses.map(v => {
          const active = activeVerse === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveVerse(v.id)}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '0.85rem',
                border: active ? `1px solid ${v.color}55` : '1px solid transparent',
                background: active
                  ? `linear-gradient(135deg, ${v.color}22, ${v.color}11)`
                  : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: active ? 700 : 500,
                fontSize: '0.9rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: active ? `0 0 12px ${v.glow}` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{v.emoji}</span> {v.name}
            </button>
          );
        })}
      </div>

      {/* Main Hero Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(15,15,26,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${currentVerse?.color}33`,
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: `0 0 50px ${currentVerse?.glow?.replace('0.4', '0.12')}, 0 24px 80px rgba(0,0,0,0.6)`,
          animation: 'slide-up 0.5s ease forwards',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Card Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                lineHeight: 1.1,
                background: `linear-gradient(135deg, #fff 30%, ${currentVerse?.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transition: 'all 0.3s ease',
              }}
            >
              {currentVerse?.name} Draft
            </h1>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <button
                onClick={() => setShowTutorial(true)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  color: '#fde68a',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s',
                }}
              >
                <BookOpen size={12} /> Guide
              </button>
              <button
                onClick={() => setShowSettings(true)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(108,99,255,0.1)',
                  border: '1px solid rgba(108,99,255,0.25)',
                  color: '#a5b4fc',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s',
                }}
              >
                <Settings size={12} /> Settings
              </button>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}>
            Player 1 vs Player 2 — Local or Online
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: '2rem' }} />

        {/* Feature Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}
        >
          {features.map(f => (
            <div
              key={f.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.875rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: currentVerse?.color, flexShrink: 0 }}>
                {React.cloneElement(f.icon, { size: 20 })}
              </span>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.85rem', color: '#eeeeff' }}>{f.label}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — Start Draft */}
        <button
          onClick={() => navigate(`/setup/${activeVerse}`)}
          style={{
            width: '100%',
            padding: '1.25rem',
            borderRadius: '1rem',
            border: 'none',
            background: `linear-gradient(135deg, ${currentVerse?.color}, ${currentVerse?.color}cc)`,
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            boxShadow: `0 0 28px ${currentVerse?.glow}`,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 0 40px ${currentVerse?.glow}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 28px ${currentVerse?.glow}`; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
        >
          <Play size={18} fill="currentColor" /> Start Draft
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Secondary CTAs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1.75rem',
          animation: 'slide-up 0.6s ease forwards',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate('/tournament')}
          style={{
            padding: '0.8rem 1.75rem',
            borderRadius: '2rem',
            border: '1px solid rgba(79,140,255,0.35)',
            background: 'rgba(79,140,255,0.1)',
            color: '#93c5fd',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 0 20px rgba(79,140,255,0.25)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.2)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Globe size={16} /> Host Online
        </button>
        <button
          onClick={() => navigate('/join')}
          style={{
            padding: '0.8rem 1.75rem',
            borderRadius: '2rem',
            border: '1px solid rgba(34,197,94,0.35)',
            background: 'rgba(34,197,94,0.1)',
            color: '#4ade80',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 0 20px rgba(34,197,94,0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <LogIn size={16} /> Join Battle
        </button>
      </div>

      {/* Footer note */}
      <p
        style={{
          marginTop: '2.5rem',
          color: 'rgba(255,255,255,0.2)',
          fontSize: '0.65rem',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          letterSpacing: '0.04em',
          position: 'relative',
          zIndex: 10,
        }}
      >
        Fan-made project for discussion & fair use. No copyright infringement intended.
      </p>

      {showTutorial && <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />}
      {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />}
    </div>
  );
};
