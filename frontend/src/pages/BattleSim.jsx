import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { simulateBattle } from '../api/battles';
import { getDraft } from '../api/drafts';
import { Play, Pause, SkipForward, RefreshCcw, RotateCcw, Eye, EyeOff, Home, Trophy } from 'lucide-react';
import { SettingsModal } from '../components/settings/SettingsModal';

const SPEED_MAP = { 1: 1000, 2: 500, 3: 250 };
const PHASES = { INTRO: 'INTRO', REVEAL: 'REVEAL', END: 'END' };

export const BattleSim = () => {
  const { draftId } = useParams();
  const sessionId = draftId;
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [runningScoreA, setRunningScoreA] = useState(0);
  const [runningScoreB, setRunningScoreB] = useState(0);

  const [speed, setSpeed] = useState(1);
  const [hideStats, setHideStats] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const autoPlayTimer = useRef(null);

  useEffect(() => {
    Promise.all([
      simulateBattle(sessionId),
      getDraft(sessionId).catch(() => null),
    ])
      .then(([resData, sessData]) => {
        setResult(resData);
        setSession(sessData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const p1Id = session?.players[0]?.id || 'player1';
  const p2Id = session?.players[1]?.id || 'player2';
  const p1Name = session?.players[0]?.name || 'Player 1';
  const p2Name = session?.players[1]?.name || 'Player 2';

  // Single source of truth for running scores.
  // Count all rounds before current roundIdx, plus the current round if it has been REVEALED (phase === END).
  useEffect(() => {
    if (!result) return;
    let sA = 0, sB = 0;
    const countUpTo = phase === PHASES.END ? roundIdx + 1 : roundIdx;
    for (let i = 0; i < countUpTo; i++) {
      const w = result.rounds[i]?.winner;
      if (w === p1Id || w === 'player1') sA++;
      else if (w === p2Id || w === 'player2') sB++;
    }
    setRunningScoreA(sA);
    setRunningScoreB(sB);
  }, [roundIdx, phase, result, p1Id, p2Id]);

  const advanceState = useCallback(() => {
    if (!result) return;
    // Scores are managed entirely by the useEffect above — do NOT touch them here.
    setPhase(prev => {
      if (prev === PHASES.INTRO) return PHASES.REVEAL;
      if (prev === PHASES.REVEAL) {
        // Score update handled by useEffect watching phase
        return PHASES.END;
      }
      if (prev === PHASES.END) {
        if (roundIdx < result.rounds.length - 1) {
          setRoundIdx(r => r + 1);
          return PHASES.INTRO;
        } else {
          return PHASES.END; // Last round — stay at END (battle complete)
        }
      }
      return prev;
    });
  }, [result, roundIdx]);

  const resetRound = useCallback(() => { setPhase(PHASES.INTRO); }, []);

  const resetBattle = useCallback(() => {
    setRoundIdx(0);
    setPhase(PHASES.INTRO);
    setIsAutoPlaying(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') { e.preventDefault(); setIsAutoPlaying(p => !p); }
      else if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') { setIsAutoPlaying(false); advanceState(); }
      else if (e.key === 'r' || e.key === 'R') { if (e.shiftKey) resetBattle(); else resetRound(); }
      else if (e.key === '1') setSpeed(1);
      else if (e.key === '2') setSpeed(2);
      else if (e.key === '3') setSpeed(3);
      else if (e.key === 'h' || e.key === 'H') setHideStats(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceState, resetRound, resetBattle]);

  useEffect(() => {
    if (isAutoPlaying && phase !== PHASES.END || (isAutoPlaying && roundIdx < result.rounds.length - 1)) {
      autoPlayTimer.current = setTimeout(() => { advanceState(); }, SPEED_MAP[speed]);
    } else {
      clearTimeout(autoPlayTimer.current);
    }
    return () => clearTimeout(autoPlayTimer.current);
  }, [isAutoPlaying, phase, roundIdx, speed, advanceState]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid rgba(108,99,255,0.3)', borderTop: '3px solid #818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Simulating Battle…</p>
    </div>
  );

  if (!result) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <p style={{ color: '#ef4444', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Error loading simulation</p>
    </div>
  );

  const round = result.rounds[roundIdx];
  const isBattleComplete = roundIdx === result.rounds.length - 1 && phase === PHASES.END;
  const p1Won = round.winner === p1Id || round.winner === 'player1';
  const p2Won = round.winner === p2Id || round.winner === 'player2';

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-base)',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {/* Ambient gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.14) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'radial-gradient(ellipse at 50% 100%, rgba(192,132,252,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Scoreboard / Header */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(7,7,15,0.65)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '2.5rem',
            background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1.25rem', padding: '1rem 2.5rem',
            boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          }}
        >
          {/* P1 Score */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>{p1Name}</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.8rem', lineHeight: 1, color: '#60a5fa', textShadow: runningScoreA > runningScoreB ? '0 0 20px rgba(96,165,250,0.6)' : 'none', transition: 'text-shadow 0.3s' }}>{runningScoreA}</div>
          </div>

          {/* VS Divider */}
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem', color: 'rgba(255,255,255,0.15)', fontStyle: 'italic', letterSpacing: '0.05em' }}>VS</div>

          {/* P2 Score */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>{p2Name}</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.8rem', lineHeight: 1, color: '#f87171', textShadow: runningScoreB > runningScoreA ? '0 0 20px rgba(248,113,113,0.6)' : 'none', transition: 'text-shadow 0.3s' }}>{runningScoreB}</div>
          </div>
        </div>

        {/* Round badge */}
        <div
          style={{
            position: 'absolute', right: '2rem',
            padding: '0.4rem 1rem', borderRadius: '9999px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.7rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
          }}
        >
          Round {roundIdx + 1} / {result.rounds.length}
        </div>

        <button onClick={() => navigate('/')}
          style={{ position: 'absolute', left: '2rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <Home size={12} /> Menu
        </button>
      </div>

      {/* Role label */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', padding: '0.75rem', }}>
        <div style={{ padding: '0.35rem 1.25rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
          {round.role.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Main Stage */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', overflow: 'hidden' }}>

        {/* P1 Character */}
        <div
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            transition: 'all 0.5s ease',
            transform: phase === PHASES.END && p1Won ? 'scale(1.08)' : 'scale(1)',
            opacity: phase === PHASES.END && p2Won ? 0.35 : 1,
            filter: phase === PHASES.END && p2Won ? 'grayscale(80%)' : 'none',
          }}
        >
          <div style={{
            width: '220px', height: '320px', borderRadius: '1.25rem', overflow: 'hidden',
            border: phase === PHASES.END && p1Won ? '2px solid #fbbf24' : '2px solid rgba(255,255,255,0.08)',
            background: 'rgba(15,15,26,0.8)',
            boxShadow: phase === PHASES.END && p1Won ? '0 0 50px rgba(251,191,36,0.35)' : '0 20px 50px rgba(0,0,0,0.5)',
            transition: 'all 0.4s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {round.charA?.imageUrl ? (
              <img src={round.charA.imageUrl} alt={round.charA.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '4rem', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
                {round.charA?.name?.substring(0, 2) || '?'}
              </div>
            )}
          </div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', marginTop: '1.25rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {round.charA?.name || 'Missing'}
          </h3>
          <div style={{ opacity: hideStats && phase !== PHASES.END ? 0 : 1, transition: 'opacity 0.3s', marginTop: '0.75rem', background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{round.role.replace(/_/g, ' ')}</span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.2rem', color: phase === PHASES.END && p1Won ? '#fbbf24' : '#fff', textShadow: phase === PHASES.END && p1Won ? '0 0 20px rgba(251,191,36,0.6)' : 'none', transition: 'all 0.3s' }}>{round.statA}</span>
          </div>
        </div>

        {/* VS / Winner Center */}
        <div style={{ width: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, gap: '1rem' }}>
          {phase === PHASES.INTRO && (
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '5rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.08)', lineHeight: 1, letterSpacing: '-0.02em' }}>VS</div>
          )}
          {phase === PHASES.REVEAL && (
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '5rem', fontStyle: 'italic', color: '#fbbf24', lineHeight: 1, letterSpacing: '-0.02em', textShadow: '0 0 40px rgba(251,191,36,0.6)', transform: 'scale(1.2)', transition: 'all 0.3s ease' }}>VS</div>
          )}
          {phase === PHASES.END && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(15,15,26,0.95)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '1.25rem', padding: '1.25rem 1.5rem',
              boxShadow: '0 0 40px rgba(0,0,0,0.8)',
              animation: 'slide-up 0.3s ease forwards',
            }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>Winner</div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.04em',
                color: round.winner === 'tie' ? 'rgba(255,255,255,0.5)' : p1Won ? '#fbbf24' : '#f87171',
                textShadow: p1Won ? '0 0 16px rgba(251,191,36,0.5)' : p2Won ? '0 0 16px rgba(248,113,113,0.5)' : 'none',
              }}>
                {round.winner === 'tie' ? 'Tie' : p1Won ? p1Name : p2Name}
              </div>
            </div>
          )}
        </div>

        {/* P2 Character */}
        <div
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            transition: 'all 0.5s ease',
            transform: phase === PHASES.END && p2Won ? 'scale(1.08)' : 'scale(1)',
            opacity: phase === PHASES.END && p1Won ? 0.35 : 1,
            filter: phase === PHASES.END && p1Won ? 'grayscale(80%)' : 'none',
          }}
        >
          <div style={{
            width: '220px', height: '320px', borderRadius: '1.25rem', overflow: 'hidden',
            border: phase === PHASES.END && p2Won ? '2px solid #f87171' : '2px solid rgba(255,255,255,0.08)',
            background: 'rgba(15,15,26,0.8)',
            boxShadow: phase === PHASES.END && p2Won ? '0 0 50px rgba(248,113,113,0.35)' : '0 20px 50px rgba(0,0,0,0.5)',
            transition: 'all 0.4s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {round.charB?.imageUrl ? (
              <img src={round.charB.imageUrl} alt={round.charB.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '4rem', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
                {round.charB?.name?.substring(0, 2) || '?'}
              </div>
            )}
          </div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', marginTop: '1.25rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {round.charB?.name || 'Missing'}
          </h3>
          <div style={{ opacity: hideStats && phase !== PHASES.END ? 0 : 1, transition: 'opacity 0.3s', marginTop: '0.75rem', background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.875rem', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{round.role.replace(/_/g, ' ')}</span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.2rem', color: phase === PHASES.END && p2Won ? '#f87171' : '#fff', textShadow: phase === PHASES.END && p2Won ? '0 0 20px rgba(248,113,113,0.6)' : 'none', transition: 'all 0.3s' }}>{round.statB}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          padding: '1rem 1.5rem',
          background: 'rgba(7,7,15,0.8)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Auto / Pause */}
          <button
            onClick={() => setIsAutoPlaying(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '0.75rem', border: isAutoPlaying ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.1)', background: isAutoPlaying ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)', color: isAutoPlaying ? '#fde68a' : 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isAutoPlaying ? 'Pause' : 'Auto'} <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>Space</span>
          </button>

          {/* Next */}
          <button
            onClick={advanceState}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '0.75rem', border: '1px solid rgba(79,140,255,0.25)', background: 'rgba(79,140,255,0.1)', color: '#93c5fd', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <SkipForward size={14} /> Next <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>N</span>
          </button>

          {/* Replay round */}
          <button
            onClick={resetRound}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '0.75rem', border: '1px solid rgba(192,132,252,0.25)', background: 'rgba(192,132,252,0.08)', color: '#d8b4fe', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <RefreshCcw size={14} /> Replay
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Speed */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.625rem', overflow: 'hidden' }}>
            {[1, 2, 3].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{ padding: '0.5rem 0.75rem', border: 'none', background: speed === s ? 'rgba(108,99,255,0.25)' : 'transparent', color: speed === s ? '#c4b5fd' : 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.2s', borderRight: s < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Hide stats */}
          <button
            onClick={() => setHideStats(p => !p)}
            style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.08)', background: hideStats ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
            title={hideStats ? 'Show Stats' : 'Hide Stats'}
          >
            {hideStats ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

          {/* Restart battle */}
          <button
            onClick={resetBattle}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <RotateCcw size={13} /> Restart
          </button>
        </div>
      </div>

      {/* Battle Complete Modal */}
      {isBattleComplete && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,7,15,0.92)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, animation: 'fade-in 0.3s ease forwards' }}>
          <div style={{ textAlign: 'center', animation: 'slide-up 0.4s ease forwards' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>Simulation Complete</div>

            {/* Final Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>{p1Name}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '6rem', lineHeight: 1, color: '#60a5fa', textShadow: '0 0 30px rgba(96,165,250,0.5)' }}>{runningScoreA}</div>
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>—</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>{p2Name}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '6rem', lineHeight: 1, color: '#f87171', textShadow: '0 0 30px rgba(248,113,113,0.5)' }}>{runningScoreB}</div>
              </div>
            </div>

            {/* Winner Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem', borderRadius: '1rem', background: result.overallWinner === 'tie' ? 'rgba(255,255,255,0.06)' : (result.overallWinner === p1Id || result.overallWinner === 'player1') ? 'rgba(96,165,250,0.12)' : 'rgba(248,113,113,0.12)', border: result.overallWinner === 'tie' ? '1px solid rgba(255,255,255,0.1)' : (result.overallWinner === p1Id || result.overallWinner === 'player1') ? '1px solid rgba(96,165,250,0.3)' : '1px solid rgba(248,113,113,0.3)', marginBottom: '2.5rem', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
              <Trophy size={24} style={{ color: result.overallWinner === 'tie' ? 'rgba(255,255,255,0.4)' : '#fbbf24' }} />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: result.overallWinner === 'tie' ? 'rgba(255,255,255,0.5)' : (result.overallWinner === p1Id || result.overallWinner === 'player1') ? '#93c5fd' : '#fca5a5' }}>
                {result.overallWinner === 'tie' ? "It's a Tie!" : (result.overallWinner === p1Id || result.overallWinner === 'player1') ? `${p1Name} Wins!` : `${p2Name} Wins!`}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {session?.mode === 'tournament' && (
                <button onClick={() => navigate(`/tournament/${session.tournamentId}`)} style={{ padding: '0.875rem 1.75rem', borderRadius: '0.875rem', border: '1px solid rgba(192,132,252,0.3)', background: 'rgba(192,132,252,0.12)', color: '#d8b4fe', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Back to Bracket
                </button>
              )}
              <button onClick={resetBattle} style={{ padding: '0.875rem 1.75rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={15} /> Watch Replay
              </button>
              <button onClick={() => navigate('/')} style={{ padding: '0.875rem 1.75rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #2563eb, #4f8cff)', color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 0 24px rgba(79,140,255,0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Home size={15} /> Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
