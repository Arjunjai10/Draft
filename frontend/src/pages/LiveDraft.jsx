import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchVerseBySlug, fetchCharacters } from '../api/verses';
import { getDraft } from '../api/drafts';
import { DraftHUD } from '../components/draft/DraftHUD';
import { RoleGrid } from '../components/draft/RoleGrid';
import { CharacterDrawModal } from '../components/draft/CharacterDrawModal';
import { useDraftTurn } from '../hooks/useDraftTurn';
import { HowItWorksModal } from '../components/reference/HowItWorksModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { OnlineInviteOverlay } from '../components/draft/OnlineInviteOverlay';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { LogOut, Settings, Zap, Cpu } from 'lucide-react';

export const LiveDraft = () => {
  const { draftId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = draftId;
  const role = searchParams.get('role');
  const navigate = useNavigate();

  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [verse, setVerse] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [initialSession, setInitialSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [socket, setSocket] = useState(null);
  const [localPlayerId, setLocalPlayerId] = useState(localStorage.getItem(`draft_${sessionId}_playerId`) || null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [draftAbandoned, setDraftAbandoned] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    getDraft(sessionId)
      .then(sess => {
        import('../api/verses').then(({ fetchVerses, fetchCharacters }) => {
          fetchVerses().then(verses => {
            const verseObj = typeof sess.verseId === 'object' ? sess.verseId : verses.find(v => v._id === sess.verseId);
            if (!verseObj) { console.error('Verse not found for ID:', sess.verseId); return; }

            setVerse(verseObj);
            setInitialSession({ ...sess, verse: verseObj, verseId: verseObj._id });

            return fetchCharacters(verseObj.slug).then(chars => {
              setCharacters(chars);

              if (sess.mode === 'tournament' && !localPlayerId) {
                const tourneyToken = localStorage.getItem(`tournament_${sess.tournamentId}_token`);
                const me = sess.players.find(p => p.token === tourneyToken);
                if (me) {
                  setLocalPlayerId(me.id);
                  localStorage.setItem(`draft_${sessionId}_playerId`, me.id);
                  localStorage.setItem(`draft_${sessionId}_token`, me.token);
                  localStorage.setItem(`draft_${sessionId}_playerName`, me.name);
                }
              }

              if (sess.mode === 'online' && !localPlayerId && role !== 'spectator') {
                if (sess.status === 'pending') navigate('/join');
                else navigate('/');
                return;
              }

              setLoading(false);
            });
          });
        });
      })
      .catch(console.error);
  }, [sessionId, localPlayerId]);

  useEffect(() => {
    if (!initialSession || !localPlayerId) return;

    let token = localStorage.getItem(`draft_${sessionId}_token`);
    if (!token) {
      token = uuidv4();
      localStorage.setItem(`draft_${sessionId}_token`, token);
    }

    const playerName = localStorage.getItem(`draft_${sessionId}_playerName`) || (localPlayerId === 'player1' ? 'Player 1' : 'Player 2');
    const newSocket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

    newSocket.on('connect', () => {
      newSocket.emit('draft:join', { draftId: sessionId, playerToken: token, playerName, playerId: localPlayerId, role });
    });

    newSocket.on('draft:opponentDisconnected', () => setOpponentDisconnected(true));
    newSocket.on('draft:reconnected', () => setOpponentDisconnected(false));
    newSocket.on('draft:abandoned', () => setDraftAbandoned(true));
    newSocket.on('error', err => console.error('Socket error:', err));

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [initialSession, sessionId, localPlayerId]);

  const { session, currentPlayer, drawnCharacter, isComplete, drawCharacter, assignCharacter, passTurn, getOpenRoles } = useDraftTurn(initialSession, characters, socket, localPlayerId);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(108,99,255,0.3)', borderTop: '3px solid #818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Loading Draft Session…</p>
      </div>
    </div>
  );

  if (!session) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <p style={{ color: '#ef4444', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Failed to load draft</p>
    </div>
  );

  const player1 = session.players[0];
  const player2 = session.players[1] || { id: 'player2', name: 'Player 2' };
  const p1Roster = session.rosters[player1.id] || {};
  const p2Roster = session.rosters[player2.id] || {};

  const mapRoster = (rosterMap) => {
    const fullRoster = {};
    Object.keys(rosterMap).forEach(roleKey => {
      fullRoster[roleKey] = characters.find(c => c._id === rosterMap[roleKey]);
    });
    return fullRoster;
  };

  if (draftAbandoned && !isComplete) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)', padding: '2rem', textAlign: 'center' }}>
      <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>⚡</div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#ef4444', marginBottom: '0.75rem' }}>Opponent Abandoned</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', marginBottom: '2rem' }}>The opponent disconnected and did not return in time.</p>
      <button onClick={() => navigate('/')} style={{ padding: '0.875rem 2rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #2563eb, #4f8cff)', color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 0 20px rgba(79,140,255,0.4)' }}>
        Return to Menu
      </button>
    </div>
  );

  const isMyTurn = !socket || currentPlayer?.id === localPlayerId;
  const p1Active = currentPlayer?.id === player1.id;
  const p2Active = currentPlayer?.id === player2.id;

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-base)',
        backgroundImage: 'url(/bg-landscape.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,7,15,0.72)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Top Bar */}
      <div
        style={{
          position: 'relative', zIndex: 20,
          padding: '0.875rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(7,7,15,0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'linear-gradient(135deg, #6c63ff, #c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>Anime Draft</span>
        </div>

        {/* Current Turn Status */}
        <div
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            background: 'rgba(15,15,26,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontWeight: 800, fontSize: '0.78rem',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24', animation: 'glow-pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
          {currentPlayer?.name || 'Waiting…'}
          <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: '0.7rem' }}>is picking</span>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowSettings(true)} style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <Settings size={16} />
          </button>
          <button onClick={() => navigate('/')} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>

      {/* Main content — VS Split */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* VS Center Divider */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, transform: 'translateX(-50%)', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <div style={{ background: 'rgba(12,12,22,0.95)', border: '2px solid rgba(255,255,255,0.12)', borderRadius: '9999px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', boxShadow: '0 0 24px rgba(0,0,0,0.8)', letterSpacing: '0.04em' }}>
            VS
          </div>
        </div>

        {/* Player 1 Column */}
        <div style={{ flex: 1, padding: '1.5rem 1.5rem 8rem', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '0.04em' }}>{player1.name}</h3>
            {p1Active && !isComplete && (
              <span style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', animation: 'glow-pulse 2s ease-in-out infinite' }}>
                Your Turn
              </span>
            )}
          </div>
          <RoleGrid roles={verse.roles} roster={mapRoster(p1Roster)} isSelectable={false} onSelectRole={() => {}} />
        </div>

        {/* Player 2 Column */}
        <div style={{ flex: 1, padding: '1.5rem 1.5rem 8rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '0.04em' }}>{player2.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {player2.isCPU && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  <Cpu size={10} /> CPU
                </span>
              )}
              {p2Active && !isComplete && (
                <span style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#fca5a5', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', animation: 'glow-pulse 2s ease-in-out infinite' }}>
                  Drafting
                </span>
              )}
            </div>
          </div>
          <RoleGrid roles={verse.roles} roster={mapRoster(p2Roster)} isSelectable={false} onSelectRole={() => {}} />
        </div>
      </div>

      {/* Opponent Disconnected Overlay */}
      {opponentDisconnected && !isComplete && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(15,15,26,0.96)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '1.25rem', padding: '2.5rem', textAlign: 'center', boxShadow: '0 0 40px rgba(251,191,36,0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#fbbf24', marginBottom: '0.5rem' }}>Opponent Disconnected</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>Waiting for opponent to reconnect… (60s)</p>
          </div>
        </div>
      )}

      {/* Online Invite Overlay */}
      {session.mode === 'online' && session.players.length === 1 && localPlayerId === 'player1' && role !== 'spectator' && (
        <OnlineInviteOverlay session={session} />
      )}

      {/* Draw Action — Fixed Bottom */}
      {!isComplete && !drawnCharacter && !currentPlayer?.isCPU && (!socket || currentPlayer?.id === localPlayerId) && role !== 'spectator' && (
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}>
          <button
            onClick={drawCharacter}
            style={{
              padding: '0.875rem 2.5rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: '#fff',
              fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1rem',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 0 28px rgba(34,197,94,0.5)',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(34,197,94,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(34,197,94,0.5)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          >
            <Zap size={18} fill="currentColor" />
            {player1.name}'s Draw
          </button>
        </div>
      )}

      {/* Simulate Battle — when complete */}
      {isComplete && (
        <div style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', zIndex: 30 }}>
          <button
            onClick={async () => {
              try {
                if (session.mode === 'cpu' || session.mode === 'local') {
                  const { updateDraft } = await import('../api/drafts');
                  await updateDraft(session._id, { status: 'complete', rosters: session.rosters });
                }
                navigate(`/battle/${session._id}`);
              } catch {
                alert('Please restart your backend server (npm run dev) so the new API route is loaded!');
              }
            }}
            style={{
              padding: '0.75rem 1.75rem', borderRadius: '0.875rem', border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #4f8cff)',
              color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 800,
              fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', boxShadow: '0 0 24px rgba(79,140,255,0.5)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            ⚔️ Simulate Battle
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', whiteSpace: 'nowrap' }}>Fan-made project · No copyright infringement intended</p>
      </div>

      {/* Modals */}
      <CharacterDrawModal
        character={drawnCharacter}
        onPass={passTurn}
        passesRemaining={session.passesRemaining[currentPlayer?.id] || 0}
        isCpuTurn={currentPlayer?.isCPU || (socket && currentPlayer?.id !== localPlayerId)}
        roles={verse.roles}
        openRoles={getOpenRoles(currentPlayer?.id)}
        onAssign={assignCharacter}
      />
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
