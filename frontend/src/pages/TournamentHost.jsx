import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchVerses } from '../api/verses';
import { v4 as uuidv4 } from 'uuid';
import { Trophy, Users, Eye, Loader2, ChevronRight } from 'lucide-react';

const BRACKET_SIZES = [
  { val: 3, label: '3', sub: 'Players' },
  { val: 4, label: '4', sub: 'Players' },
  { val: 8, label: '8', sub: 'Players' },
];

export const TournamentHost = () => {
  const navigate = useNavigate();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [verseId, setVerseId] = useState('');
  const [playerCount, setPlayerCount] = useState(8);
  const [hostMode, setHostMode] = useState('play');
  const [hostName, setHostName] = useState('');

  useEffect(() => {
    fetchVerses().then(data => {
      setVerses(data);
      if (data.length > 0) setVerseId(data[0]._id);
      setLoading(false);
    });
  }, []);

  const handleHost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const hostToken = uuidv4();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseId, playerCount, rolesCount: 15, passesPerPlayer: 10,
          hostIsPlaying: hostMode === 'play',
          hostName: hostMode === 'play' ? hostName : 'Host',
          hostToken,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem(`tournament_${data._id}_hostToken`, hostToken);
        localStorage.setItem(`tournament_${data._id}_token`, hostToken);
        if (hostMode === 'play') localStorage.setItem(`tournament_${data._id}_playerId`, 'p1');
        navigate(`/tournament/${data._id}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <Loader2 size={36} style={{ color: '#6c63ff', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '500px', height: '500px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(79,140,255,0.08) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '500px', height: '500px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

      <div
        style={{
          width: '100%', maxWidth: '460px',
          background: 'rgba(15,15,26,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(79,140,255,0.2)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 0 40px rgba(79,140,255,0.08), 0 24px 60px rgba(0,0,0,0.5)',
          animation: 'slide-up 0.4s ease forwards',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '1rem', background: 'rgba(79,140,255,0.15)', border: '1px solid rgba(79,140,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 20px rgba(79,140,255,0.25)' }}>
            <Trophy size={24} style={{ color: '#fbbf24' }} />
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: '#fff', letterSpacing: '0.04em' }}>
            Host Tournament
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', marginTop: '0.35rem' }}>
            Configure your tournament lobby
          </p>
        </div>

        <form onSubmit={handleHost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Verse Select */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem' }}>
              Select Verse
            </label>
            <select
              value={verseId}
              onChange={e => setVerseId(e.target.value)}
              style={{
                width: '100%', padding: '0.8rem 1rem', borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#eeeeff', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                cursor: 'pointer', appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(79,140,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            >
              {verses.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Bracket Size */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem' }}>
              Bracket Size
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
              {BRACKET_SIZES.map(s => {
                const active = playerCount === s.val;
                return (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => setPlayerCount(s.val)}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: '0.875rem',
                      border: active ? '1px solid rgba(79,140,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      background: active ? 'rgba(79,140,255,0.15)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#93c5fd' : 'rgba(255,255,255,0.35)',
                      cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      boxShadow: active ? '0 0 12px rgba(79,140,255,0.2)' : 'none',
                      textAlign: 'center',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(79,140,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}}
                  >
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1 }}>{s.label}</div>
                    <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.15rem', opacity: 0.7 }}>{s.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Host Role */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem' }}>
              Host Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {[
                { val: 'play', label: 'Play & Host', icon: <Users size={16} />, color: '#818cf8' },
                { val: 'spectate', label: 'Spectate Only', icon: <Eye size={16} />, color: '#9ca3af' },
              ].map(opt => {
                const active = hostMode === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setHostMode(opt.val)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '0.875rem',
                      border: active ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      background: active ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#c4b5fd' : 'rgba(255,255,255,0.35)',
                      cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem',
                      transition: 'all 0.2s ease',
                      boxShadow: active ? '0 0 12px rgba(108,99,255,0.2)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Host Name */}
          {hostMode === 'play' && (
            <div style={{ animation: 'slide-up 0.25s ease forwards' }}>
              <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem' }}>
                Your Name
              </label>
              <input
                type="text"
                value={hostName}
                onChange={e => setHostName(e.target.value)}
                placeholder="e.g. GokuFan99"
                required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eeeeff', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(108,99,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '1rem', borderRadius: '0.875rem', border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #4f8cff)',
              color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 800,
              fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 24px rgba(79,140,255,0.4)',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              opacity: submitting ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trophy size={16} />}
            {submitting ? 'Creating...' : 'Create Lobby'}
            {!submitting && <ChevronRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};
