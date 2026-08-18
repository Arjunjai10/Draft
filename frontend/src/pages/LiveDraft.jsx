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

  // Online Mode States
  const [socket, setSocket] = useState(null);
  const [localPlayerId, setLocalPlayerId] = useState(localStorage.getItem(`draft_${sessionId}_playerId`) || null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [draftAbandoned, setDraftAbandoned] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    getDraft(sessionId)
      .then(sess => {
        // Since the backend might not be restarted and verseId is just a string,
        // we'll fetch all verses to find the matching one to get the slug.
        import('../api/verses').then(({ fetchVerses, fetchCharacters }) => {
          fetchVerses().then(verses => {
            const verseObj = typeof sess.verseId === 'object' ? sess.verseId : verses.find(v => v._id === sess.verseId);
            
            if (!verseObj) {
              console.error("Verse not found for ID:", sess.verseId);
              return;
            }
            
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
                // If they are not authenticated, redirect them to the join code page
                if (sess.status === 'pending') {
                  navigate('/join');
                } else {
                  navigate('/'); // Or somewhere else
                }
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
    
    newSocket.on('error', (err) => console.error('Socket error:', err));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [initialSession, sessionId, localPlayerId]);



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

  if (draftAbandoned && !isComplete) {
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

      <div className="relative z-10 flex flex-col items-center justify-start pt-16 h-full">
        {/* Status Area */}
        <div className="flex flex-col items-center mb-6 absolute top-8 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md border border-gray-700 rounded-full px-8 py-3 text-white font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <span className="text-yellow-500 animate-pulse">●</span> 
            {currentPlayer?.name || 'Waiting...'} <span className="text-gray-400 text-xs">is picking...</span>
          </div>
        </div>
      
      <div className="flex-1 w-full h-full flex flex-col md:flex-row relative z-10">
        
        {/* VS Divider */}
        <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent items-center justify-center z-20">
           <div className="bg-gray-900 border-2 border-gray-700 text-white font-black italic text-2xl w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,1)] z-30">
             VS
           </div>
        </div>
          {/* Player 1 Column */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-32">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">{player1.name}</h3>
              {currentPlayer?.id === player1.id && !isComplete && (
                <span className="px-3 py-1 bg-green-900 bg-opacity-50 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse border border-green-700">
                  Your Turn
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
          <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-32">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">{player2.name}</h3>
              <div className="flex items-center gap-2">
                {player2.isCPU && <span className="bg-gray-800 border border-gray-600 text-gray-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">CPU</span>}
                {currentPlayer?.id === player2.id && !isComplete && (
                  <span className="px-3 py-1 bg-red-900 bg-opacity-50 text-red-400 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse border border-red-700">
                    Drafting
                  </span>
                )}
              </div>
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

      {opponentDisconnected && !isComplete && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg shadow-2xl text-center">
            <h2 className="text-2xl font-black text-yellow-500 uppercase tracking-widest mb-2">Opponent Disconnected</h2>
            <p className="text-gray-400">Waiting for opponent to reconnect... (60s)</p>
          </div>
        </div>
      )}

      {session.mode === 'online' && session.players.length === 1 && localPlayerId === 'player1' && role !== 'spectator' && (
        <OnlineInviteOverlay session={session} />
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
          <button 
            onClick={async () => {
              try {
                if (session.mode === 'cpu' || session.mode === 'local') {
                  const { updateDraft } = await import('../api/drafts');
                  await updateDraft(session._id, { status: 'complete', rosters: session.rosters });
                }
                navigate(`/battle/${session._id}`);
              } catch (e) {
                console.error('Failed to sync draft to backend:', e);
                alert('Please restart your backend server (npm run dev) so the new API route is loaded!');
              }
            }} 
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs shadow-lg transition-colors"
          >
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
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
