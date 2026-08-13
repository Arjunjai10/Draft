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
      className="flex flex-col h-screen overflow-hidden bg-gray-900 text-gray-100 bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/bg-landscape.png)' }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
      
      {/* Top Left Branding */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
        <span className="font-bold text-sm shadow-black drop-shadow-md">Anime Draft — Fan-made Anime Character Draft Game</span>
      </div>

      {/* Top Right Header Buttons */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
        <button onClick={() => setShowHowItWorks(true)} className="px-4 py-1.5 bg-black/50 hover:bg-black/70 border border-white/20 rounded-full text-xs font-bold transition-colors shadow-lg">
          Fan-made
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start pt-12 h-full">
        {/* Status Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 text-white font-bold flex items-center gap-2 shadow-xl">
            <span className="text-orange-400">⚡</span> 
            Current Player: <span className="text-blue-400">{currentPlayer?.name || 'Waiting...'}</span> 
            <span className="text-orange-400">⚡</span>
          </div>
          <div className="text-4xl font-black text-white/80 mt-4 tracking-widest drop-shadow-lg">
            <span className="text-blue-400/80">⚔️</span> VS <span className="text-red-400/80">⚔️</span>
          </div>
        </div>
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 justify-center">
          {/* Player 1 Column */}
          <fieldset className="border border-blue-500/50 rounded-xl p-4 bg-black/20 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <legend className="px-3 text-white font-bold ml-4">
              {player1.name}
              {currentPlayer?.id === player1.id && !isComplete && (
                <span className="ml-2 px-2 py-0.5 bg-blue-600/30 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider animate-pulse">
                  Drafting
                </span>
              )}
            </legend>
            <RoleGrid 
              roles={verse.roles} 
              roster={mapRoster(p1Roster)} 
              isSelectable={false}
              onSelectRole={() => {}}
            />
          </fieldset>

          {/* Player 2 Column */}
          <fieldset className="border border-white/30 rounded-xl p-4 bg-black/20 backdrop-blur-sm">
            <legend className="px-3 text-white font-bold ml-4 flex items-center gap-2">
              {player2.name}
              {player2.isCPU && <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full">CPU (hard)</span>}
              {currentPlayer?.id === player2.id && !isComplete && (
                <span className="ml-2 px-2 py-0.5 bg-red-600/30 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider animate-pulse">
                  Drafting
                </span>
              )}
            </legend>
            <RoleGrid 
              roles={verse.roles} 
              roster={mapRoster(p2Roster)} 
              isSelectable={false} 
              onSelectRole={() => {}}
            />
          </fieldset>
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
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 shadow-2xl z-20">
          <button 
            onClick={drawCharacter}
            className="px-10 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-transform hover:scale-105 active:scale-95"
          >
            {player1.name}'s Draw
          </button>
        </div>
      )}

      {/* Footer / Disclaimer */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <p className="text-[10px] text-white/70">Fan-made project for discussion and fair use. No copyright infringement intended.</p>
      </div>

      {/* Bottom Corner Buttons */}
      <div className="absolute bottom-4 left-4 z-20">
        <button onClick={() => navigate('/')} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md font-bold text-xs shadow-lg transition-colors">
          Exit
        </button>
      </div>
      
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        {isComplete && (
          <button onClick={() => navigate(`/battle/${session._id}`)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs shadow-lg transition-colors">
            Simulate Battle
          </button>
        )}
        <button onClick={() => setShowSettings(true)} className="px-4 py-1.5 bg-black/60 hover:bg-black/80 border border-white/20 rounded-full text-white font-bold text-xs shadow-lg transition-colors">
          Settings
        </button>
      </div>

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
