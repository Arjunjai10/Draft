import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Trophy, AlertCircle, Users } from 'lucide-react';

export const TournamentJoin = () => {
  const navigate = useNavigate();
  const [codeChars, setCodeChars] = useState(['', '', '', '', '', '']);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const code = codeChars.join('');

  const handleCodeChange = (idx, val) => {
    const char = val.toUpperCase().slice(-1);
    const next = [...codeChars];
    next[idx] = char;
    setCodeChars(next);
    if (char && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleCodeKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !codeChars[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const next = [...codeChars];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setCodeChars(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const playerToken = uuidv4();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, playerToken }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem(`tournament_${data._id}_token`, playerToken);
        const me = data.players.find(p => p.token === playerToken);
        if (me) localStorage.setItem(`tournament_${data._id}_playerId`, me.id);
        navigate(`/tournament/${data._id}`);
      } else {
        setError(data.error || 'Failed to join');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(15,15,26,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(192,132,252,0.2)',
          borderRadius: '1.75rem',
          padding: '2.5rem',
          boxShadow: '0 0 50px rgba(192,132,252,0.08), 0 24px 80px rgba(0,0,0,0.6)',
          animation: 'slide-up 0.4s ease forwards',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '1.25rem', background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 0 24px rgba(192,132,252,0.25)' }}>
            <Users size={28} style={{ color: '#d8b4fe' }} />
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#fff', letterSpacing: '0.04em' }}>
            Join Tournament
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', marginTop: '0.35rem' }}>
            Enter the 6-character tournament code
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem' }}>
              Tournament Code
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }} onPaste={handlePaste}>
              {codeChars.map((ch, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  value={ch}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  style={{
                    width: '48px', height: '56px',
                    textAlign: 'center',
                    fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem',
                    color: ch ? '#d8b4fe' : 'rgba(255,255,255,0.2)',
                    background: ch ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.03)',
                    border: ch ? '1px solid rgba(192,132,252,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem', outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: ch ? '0 0 12px rgba(192,132,252,0.2)' : 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(192,132,252,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(192,132,252,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = ch ? 'rgba(192,132,252,0.4)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = ch ? '0 0 12px rgba(192,132,252,0.2)' : 'none'; }}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem' }}>
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="e.g. Vegeta99"
              required
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eeeeff', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', transition: 'all 0.2s' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(192,132,252,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(192,132,252,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            type="submit"
            disabled={code.length < 6 || !playerName || loading}
            style={{
              width: '100%', padding: '1rem', borderRadius: '0.875rem', border: 'none',
              background: (code.length === 6 && playerName && !loading) ? 'linear-gradient(135deg, #7c3aed, #c084fc)' : 'rgba(255,255,255,0.06)',
              color: (code.length === 6 && playerName && !loading) ? '#fff' : 'rgba(255,255,255,0.3)',
              fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: (code.length === 6 && playerName && !loading) ? 'pointer' : 'not-allowed',
              boxShadow: (code.length === 6 && playerName && !loading) ? '0 0 24px rgba(192,132,252,0.4)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { if (code.length === 6 && playerName && !loading) e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Trophy size={16} />
            {loading ? 'Joining...' : 'Enter Lobby'}
          </button>
        </form>
      </div>
    </div>
  );
};
