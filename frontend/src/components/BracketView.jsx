import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Eye, Play } from 'lucide-react';

export const BracketView = ({ tournament }) => {
  const navigate = useNavigate();
  const myPlayerId = localStorage.getItem(`tournament_${tournament._id}_playerId`);

  const { bracket, playerCount } = tournament;
  const qfMatches = bracket.filter(m => m.round === 1 && playerCount === 8);
  const sfMatches = bracket.filter(m =>
    (playerCount === 8 && m.round === 2) ||
    (playerCount === 4 && m.round === 1) ||
    (playerCount === 3 && m.round === 1)
  );
  const fMatch = bracket.find(m =>
    (playerCount === 8 && m.round === 3) ||
    (playerCount === 4 && m.round === 2) ||
    (playerCount === 3 && m.round === 2)
  );

  const MatchNode = ({ match }) => {
    if (!match) return <div style={{ height: '96px', width: '200px', opacity: 0 }} />;

    const isMyMatch = myPlayerId && (match.p1?.id === myPlayerId || match.p2?.id === myPlayerId);

    let statusColor = 'rgba(255,255,255,0.2)';
    let statusLabel = 'Waiting';
    let canAction = false;
    let actionText = '';
    let actionUrl = '';
    let statusGlow = 'none';

    if (match.winnerId) {
      statusColor = '#4ade80';
      statusLabel = 'Complete';
      canAction = true;
      actionText = 'View';
      actionUrl = `/battle/${match.draftId}`;
    } else if (match.p1 && match.p2 && match.draftId) {
      statusColor = '#f87171';
      statusLabel = 'LIVE';
      statusGlow = '0 0 8px rgba(248,113,113,0.6)';
      canAction = true;
      if (isMyMatch) {
        actionText = 'Play';
        actionUrl = `/draft/${match.draftId}`;
      } else {
        actionText = 'Watch';
        actionUrl = `/draft/${match.draftId}?role=spectator`;
      }
    }

    const p1Win = match.winnerId === match.p1?.id;
    const p2Win = match.winnerId === match.p2?.id;

    return (
      <div
        style={{
          width: '200px',
          background: isMyMatch ? 'rgba(251,191,36,0.06)' : 'rgba(15,15,26,0.9)',
          border: isMyMatch ? '1px solid rgba(251,191,36,0.35)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.875rem',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          boxShadow: isMyMatch ? '0 0 20px rgba(251,191,36,0.12)' : match.p1 && match.p2 && match.draftId && !match.winnerId ? '0 0 16px rgba(248,113,113,0.08)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.55rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
            {match.matchId}
          </span>
          <span
            style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.6rem',
              letterSpacing: '0.08em', textTransform: 'uppercase', color: statusColor,
              boxShadow: statusGlow,
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            {statusLabel === 'LIVE' && <span style={{ width: '5px', height: '5px', borderRadius: '9999px', background: '#f87171', animation: 'glow-pulse 1s ease-in-out infinite', display: 'inline-block' }} />}
            {statusLabel}
          </span>
        </div>

        {/* Players */}
        <div style={{ padding: '0.5rem 0' }}>
          {[
            { player: match.p1, isWinner: p1Win },
            { player: match.p2, isWinner: p2Win },
          ].map((row, idx) => (
            <div key={idx}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.45rem 0.75rem',
                  color: row.isWinner ? '#4ade80' : row.player ? '#fff' : 'rgba(255,255,255,0.2)',
                  fontFamily: 'Outfit, sans-serif', fontWeight: row.isWinner ? 800 : 600, fontSize: '0.82rem',
                  background: row.isWinner ? 'rgba(34,197,94,0.07)' : 'transparent',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {row.player?.name || 'TBD'}
                </span>
                {row.isWinner && <Check size={13} style={{ flexShrink: 0, color: '#4ade80' }} />}
              </div>
              {idx === 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 0.75rem' }} />}
            </div>
          ))}
        </div>

        {/* Action Button */}
        {canAction && (
          <button
            onClick={() => navigate(actionUrl)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: 'none',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: isMyMatch && !match.winnerId
                ? 'rgba(251,191,36,0.15)'
                : match.winnerId
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(79,140,255,0.12)',
              color: isMyMatch && !match.winnerId ? '#fde68a' : match.winnerId ? '#4ade80' : '#93c5fd',
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem',
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            {match.winnerId ? <Zap size={11} /> : isMyMatch ? <Play size={11} fill="currentColor" /> : <Eye size={11} />}
            {actionText}
          </button>
        )}
      </div>
    );
  };

  // Connector lines between rounds
  const Connector = () => (
    <div style={{ display: 'flex', alignItems: 'center', width: '40px', flexShrink: 0 }}>
      <div style={{ height: '2px', width: '100%', background: 'linear-gradient(90deg, rgba(108,99,255,0.3), rgba(192,132,252,0.3))', borderRadius: '9999px' }} />
    </div>
  );

  return (
    <div
      style={{
        width: '100%', overflowX: 'auto',
        padding: '3rem 2rem',
        minHeight: '400px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
          minWidth: 'max-content',
          margin: '0 auto',
        }}
      >
        {/* Quarter Finals */}
        {qfMatches.length > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'space-around' }}>
              {qfMatches.map(m => <MatchNode key={m.matchId} match={m} />)}
            </div>
            <Connector />
          </>
        )}

        {/* Semi Finals */}
        {sfMatches.length > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', justifyContent: 'space-around' }}>
              {sfMatches.map(m => <MatchNode key={m.matchId} match={m} />)}
            </div>
            <Connector />
          </>
        )}

        {/* Final */}
        {fMatch && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '0.5rem', textAlign: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fbbf24' }}>🏆 Final</div>
            <MatchNode match={fMatch} />
          </div>
        )}
      </div>
    </div>
  );
};
