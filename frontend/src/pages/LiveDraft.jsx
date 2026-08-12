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
import { JoinDraftModal } from '../components/draft/JoinDraftModal';
import { OnlineInviteOverlay } from '../components/draft/OnlineInviteOverlay';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

export const LiveDraft = () => {
  const { verseSlug } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const role = searchParams.get('role');
  const navigate = useNavigate();
  
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [verse, setVerse] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [initialSession, setInitialSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Online Mode States
  const [socket, setSocket] = useState(null);
  const [localPlayerId, setLocalPlayerId] = useState(localStorage.getItem(`draft_${sessionId}_playerId`) || null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [draftAbandoned, setDraftAbandoned] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchVerseBySlug(verseSlug),
      fetchCharacters(verseSlug),
      getDraft(sessionId)
    ]).then(([v, chars, sess]) => {
      setVerse(v);
      setCharacters(chars);
      setInitialSession({ ...sess, verse: v });
      
      if (sess.mode === 'online' && !localPlayerId && role !== 'spectator') {
        setShowJoinModal(true);
      }
      setLoading(false);
    }).catch(console.error);
  }, [verseSlug, sessionId, localPlayerId]);

  useEffect(() => {
    if (!initialSession || !localPlayerId || showJoinModal) return;

    let token = localStorage.getItem(`draft_${sessionId}_token`);
    if (!token) {
      token = uuidv4();
      localStorage.setItem(`draft_${sessionId}_token`, token);
    }
    
    // Default fallback to 'Player 1' if not set, but JoinDraftModal forces user to set one
    const playerName = localPlayerId === 'player1' ? 'Player 1' : localStorage.getItem(`draft_${sessionId}_playerName`) || 'Player 2';

    const newSocket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');
    
    newSocket.on('connect', () => {
      newSocket.emit('draft:join', { draftId: sessionId, playerToken: token, playerName, playerId: localPlayerId, role });
    });

    newSocket.on('draft:opponentDisconnected', () => setOpponentDisconnected(true));
    newSocket.on('draft:reconnected', () => setOpponentDisconnected(false));
    newSocket.on('draft:abandoned', () => setDraftAbandoned(true));
    
    newSocket.on('error', (err) => console.error('Socket error:', err));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [initialSession, sessionId, localPlayerId, showJoinModal]);

  const handleJoinDraft = (name) => {
    localStorage.setItem(`draft_${sessionId}_playerId`, 'player2');
    localStorage.setItem(`draft_${sessionId}_playerName`, name);
    setLocalPlayerId('player2');
    setShowJoinModal(false);
  };

  const {
    session,
    currentPlayer,
    drawnCharacter,
    isComplete,
    drawCharacter,
    assignCharacter,
    passTurn,
    getOpenRoles
  } = useDraftTurn(initialSession, characters, socket, localPlayerId);

  if (loading) return <div className="p-8 text-center">Loading Draft Session...</div>;
  if (!session) return <div className="p-8 text-center text-red-500">Failed to load draft</div>;

  const player1 = session.players[0];
  const player2 = session.players[1] || { id: 'player2', name: 'Player 2' };

  const p1Roster = session.rosters[player1.id] || {};
  const p2Roster = session.rosters[player2.id] || {};

  // For the UI, map character IDs in the roster to full character objects
  const mapRoster = (rosterMap) => {
    const fullRoster = {};
    Object.keys(rosterMap).forEach(roleKey => {
      fullRoster[roleKey] = characters.find(c => c._id === rosterMap[roleKey]);
    });
    return fullRoster;
  };

  if (draftAbandoned) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-900 p-4 text-center">
        <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-4">Opponent Abandoned</h2>
        <p className="text-gray-400 mb-8">The opponent disconnected and did not return in time.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest">
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-900 text-gray-100 bg-cover bg-center"
      style={{ backgroundImage: 'url(/bg-landscape.png)' }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <DraftHUD 
        currentPlayer={currentPlayer} 
        passesRemaining={session.passesRemaining[currentPlayer?.id] || 0}
        isComplete={isComplete}
        onSimulate={() => navigate(`/battle/${session._id}`)}
        onHowItWorks={() => setShowHowItWorks(true)}
        onSettings={() => setShowSettings(true)}
      />
      
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Player 1 Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-blue-400">{player1.name}</h3>
              {currentPlayer?.id === player1.id && !isComplete && (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-bold rounded animate-pulse uppercase tracking-wider">
                  Drafting
                </span>
              )}
            </div>
            <RoleGrid 
              roles={verse.roles} 
              roster={mapRoster(p1Roster)} 
              isSelectable={false}
              onSelectRole={() => {}}
            />
          </div>

          {/* Player 2 Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-red-400">{player2.name}</h3>
              {currentPlayer?.id === player2.id && !isComplete && (
                <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded animate-pulse uppercase tracking-wider">
                  Drafting
                </span>
              )}
            </div>
            <RoleGrid 
              roles={verse.roles} 
              roster={mapRoster(p2Roster)} 
              isSelectable={false} 
              onSelectRole={() => {}}
            />
          </div>
        </div>
      </div>

      {opponentDisconnected && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg shadow-2xl text-center">
            <h2 className="text-2xl font-black text-yellow-500 uppercase tracking-widest mb-2">Opponent Disconnected</h2>
            <p className="text-gray-400">Waiting for opponent to reconnect... (60s)</p>
          </div>
        </div>
      )}

      {session.mode === 'online' && session.players.length === 1 && localPlayerId === 'player1' && !showJoinModal && role !== 'spectator' && (
        <OnlineInviteOverlay />
      )}

      {/* Draw Action Area - Fixed at bottom */}
      {!isComplete && !drawnCharacter && !currentPlayer?.isCPU && (!socket || currentPlayer?.id === localPlayerId) && role !== 'spectator' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 shadow-2xl z-20">
          <button 
            onClick={drawCharacter}
            className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black uppercase tracking-widest text-xl transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          >
            Draw Character
          </button>
        </div>
      )}

      {/* Draft Modals */}
      <CharacterDrawModal 
        character={drawnCharacter}
        onPass={passTurn}
        passesRemaining={session.passesRemaining[currentPlayer?.id] || 0}
        isCpuTurn={currentPlayer?.isCPU || (socket && currentPlayer?.id !== localPlayerId)}
        roles={verse.roles}
        openRoles={getOpenRoles(currentPlayer?.id)}
        onAssign={assignCharacter}
      />
      <JoinDraftModal isOpen={showJoinModal} onJoin={handleJoinDraft} />
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
    </div>
  );
};
