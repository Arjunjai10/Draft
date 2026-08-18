import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { BracketView } from '../components/BracketView';
import { Loader2, User, Copy, Check, Trophy, ChevronRight } from 'lucide-react';

export const LiveBracket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const myToken = localStorage.getItem(`tournament_${id}_token`);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Tournament not found');
        return res.json();
      })
      .then(data => { setTournament(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });

    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('tournament:join', { tournamentId: id });
    });

    socket.on('tournament:bracketUpdate', (updatedTournament) => {
      setTournament(updatedTournament);
    });

    return () => socket.disconnect();
  }, [id]);

  const handleCopyCode = () => {
    if (tournament?.code) {
      navigator.clipboard.writeText(tournament.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleStart = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments/${id}/start`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setTournament(data);
      else alert(data.error);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <Loader2 size={40} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
    </div>
  );
  if (error) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <p style={{ color: '#ef4444', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>{error}</p>
    </div>
  );
  if (!tournament) return null;

  const hostToken = localStorage.getItem(`tournament_${id}_hostToken`);
  const amIFirstPlayer = tournament.players?.length > 0 && tournament.players[0].token === myToken;
  const isHost = tournament.hostId === myToken || tournament.hostId === hostToken || amIFirstPlayer;

  // ── LOBBY STATE ────────────────────────────────────────────────────
  if (tournament.status === 'pending') {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 60px)',
          backgroundColor: 'var(--bg-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '500px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div
          style={{
            width: '100%', maxWidth: '560px',
            background: 'rgba(15,15,26,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(108,99,255,0.2)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            boxShadow: '0 0 40px rgba(108,99,255,0.1), 0 24px 60px rgba(0,0,0,0.5)',
            animation: 'slide-up 0.4s ease forwards',
            position: 'relative', zIndex: 10,
          }}
        >
          {/* Lobby Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.6rem', background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.3rem' }}>
                Tournament Lobby
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem' }}>
                Waiting for players to join…
              </p>
            </div>

            {/* Invite Code */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>Invite Code</div>
              <button
                onClick={handleCopyCode}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1rem', borderRadius: '0.75rem',
                  background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)',
                  color: '#c4b5fd', cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                  fontSize: '1.4rem', letterSpacing: '0.2em',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.12)'; }}
              >
                {tournament.code}
                {copied ? <Check size={16} style={{ color: '#4ade80' }} /> : <Copy size={16} style={{ opacity: 0.6 }} />}
              </button>
            </div>
          </div>

          {/* Player Slots */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Players</h2>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.9rem', color: '#818cf8' }}>
                {tournament.players.length} / {tournament.playerCount}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              {Array.from({ length: tournament.playerCount }).map((_, i) => {
                const p = tournament.players[i];
                const isMe = p?.token === myToken;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.875rem',
                      borderRadius: '0.875rem',
                      background: p ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.02)',
                      border: p
                        ? (isMe ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(108,99,255,0.25)')
                        : '1px dashed rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: p ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: p ? '1px solid rgba(108,99,255,0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
                      {p ? <User size={16} style={{ color: isMe ? '#fde68a' : '#818cf8' }} /> : <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem' }}>{i + 1}</span>}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      {p ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                          {isMe && <span style={{ padding: '0.1rem 0.4rem', borderRadius: '9999px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fde68a', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>You</span>}
                        </div>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontStyle: 'italic' }}>Waiting…</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '4px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, #6c63ff, #c084fc)', width: `${(tournament.players.length / tournament.playerCount) * 100}%`, transition: 'width 0.4s ease', boxShadow: '0 0 10px rgba(108,99,255,0.5)' }} />
          </div>

          {/* Action Button */}
          {isHost ? (
            <button
              onClick={handleStart}
              disabled={tournament.players.length !== tournament.playerCount}
              style={{
                width: '100%', padding: '1rem', borderRadius: '0.875rem', border: 'none',
                background: tournament.players.length === tournament.playerCount
                  ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                  : 'rgba(255,255,255,0.06)',
                color: tournament.players.length === tournament.playerCount ? '#fff' : 'rgba(255,255,255,0.25)',
                fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: tournament.players.length === tournament.playerCount ? 'pointer' : 'not-allowed',
                boxShadow: tournament.players.length === tournament.playerCount ? '0 0 24px rgba(34,197,94,0.4)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
              onMouseEnter={e => { if (tournament.players.length === tournament.playerCount) e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Trophy size={16} />
              {tournament.players.length === tournament.playerCount ? 'Start Tournament' : `Waiting for ${tournament.playerCount - tournament.players.length} more…`}
            </button>
          ) : (
            <div style={{ width: '100%', padding: '1rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Waiting for host to start…
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── BRACKET STATE ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--bg-base)' }}>
      {/* Sticky bracket header */}
      <div
        style={{
          position: 'sticky', top: '60px', zIndex: 20,
          background: 'rgba(7,7,15,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '1rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.2rem', background: 'linear-gradient(135deg, #60a5fa, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '0.04em' }}>
          🏆 Tournament Bracket
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Outfit, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
          CODE:
          <span style={{ fontWeight: 800, letterSpacing: '0.15em', color: '#c4b5fd', padding: '0.25rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.25)' }}>
            {tournament.code}
          </span>
        </div>
      </div>

      <div style={{ overflow: 'auto' }}>
        <BracketView tournament={tournament} />
      </div>
    </div>
  );
};
