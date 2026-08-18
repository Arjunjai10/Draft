import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, ChevronRight, Zap, Globe } from 'lucide-react';

export const TournamentLanding = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(79,140,255,0.1) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        {/* Icon */}
        <div
          style={{
            width: '72px', height: '72px', borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, rgba(79,140,255,0.2), rgba(192,132,252,0.2))',
            border: '1px solid rgba(108,99,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 30px rgba(108,99,255,0.25)',
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          <Trophy size={36} style={{ color: '#fbbf24' }} />
        </div>

        <h1
          style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            background: 'linear-gradient(135deg, #60a5fa, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '0.04em', marginBottom: '0.75rem',
            animation: 'slide-up 0.4s ease forwards',
          }}
        >
          Tournament Mode
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 3rem',
            animation: 'slide-up 0.5s ease forwards',
          }}
        >
          Host or join a multi-player bracket. Settle debates and prove your drafting strategy against the world.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', animation: 'slide-up 0.6s ease forwards' }}>
          {/* Host Card */}
          <button
            onClick={() => navigate('/tournament/host')}
            style={{
              padding: '2rem 1.5rem',
              borderRadius: '1.25rem',
              background: 'rgba(15,15,26,0.85)',
              border: '1px solid rgba(79,140,255,0.2)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.25s ease',
              boxShadow: '0 0 20px rgba(79,140,255,0.06)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(79,140,255,0.5)';
              e.currentTarget.style.boxShadow = '0 0 36px rgba(79,140,255,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(79,140,255,0.2)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(79,140,255,0.06)';
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'rgba(79,140,255,0.15)', border: '1px solid rgba(79,140,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(79,140,255,0.2)' }}>
              <Globe size={28} style={{ color: '#60a5fa' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#fff', letterSpacing: '0.02em' }}>Host Tournament</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.5 }}>
              Create a new bracket and invite friends to compete
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Get Started <ChevronRight size={14} />
            </div>
          </button>

          {/* Join Card */}
          <button
            onClick={() => navigate('/tournament/join')}
            style={{
              padding: '2rem 1.5rem',
              borderRadius: '1.25rem',
              background: 'rgba(15,15,26,0.85)',
              border: '1px solid rgba(192,132,252,0.2)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.25s ease',
              boxShadow: '0 0 20px rgba(192,132,252,0.06)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(192,132,252,0.5)';
              e.currentTarget.style.boxShadow = '0 0 36px rgba(192,132,252,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(192,132,252,0.2)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(192,132,252,0.06)';
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(192,132,252,0.2)' }}>
              <Users size={28} style={{ color: '#d8b4fe' }} />
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#fff', letterSpacing: '0.02em' }}>Join Tournament</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.5 }}>
              Enter a 6-character code to join an existing lobby
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#d8b4fe', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Enter Code <ChevronRight size={14} />
            </div>
          </button>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            animation: 'slide-up 0.7s ease forwards',
          }}
        >
          {[
            { icon: <Trophy size={14} />, label: 'Bracket Sizes', val: '3, 4 or 8 players' },
            { icon: <Zap size={14} />, label: 'Live Updates', val: 'Real-time socket' },
            { icon: <Users size={14} />, label: 'Play or Spectate', val: 'Your choice' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                {s.icon} {s.label}
              </div>
              <div style={{ color: '#c084fc', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
