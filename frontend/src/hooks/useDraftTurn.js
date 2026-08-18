import { useState, useCallback, useEffect } from 'react';
import { pickBestRoleForCharacter } from '../utils/cpuAI.js';

export const useDraftTurn = (sessionData, allCharacters, socket = null, localPlayerId = null) => {
  const [session, setSession] = useState(sessionData);

  useEffect(() => {
    if (sessionData && !session) {
      setSession(sessionData);
    }
  }, [sessionData]);

  const [draftedCharacterIds, setDraftedCharacterIds] = useState(new Set());
  const [drawnCharacter, setDrawnCharacter] = useState(null);
  const [isCPUThinking, setIsCPUThinking] = useState(false);

  const currentTurnPlayerId = session?.turnOrder[session?.currentTurnIndex];
  const isComplete = session?.status === 'complete';
  const currentPlayer = session?.players.find(p => p.id === currentTurnPlayerId);

  const isSocketMode = Boolean(socket) && (session?.mode === 'online' || session?.mode === 'tournament');
  // In local/cpu mode, the single client window acts on behalf of all players.
  // In online/tournament mode, only the localPlayerId is "local"
  const isLocalTurn = (session?.mode === 'online' || session?.mode === 'tournament') 
    ? currentTurnPlayerId === localPlayerId 
    : true;

  // Socket listeners
  useEffect(() => {
    if (!socket || !isSocketMode) return;

    const handleUpdate = (updatedSession) => {
      setSession(prev => ({
        ...updatedSession,
        verse: prev?.verse || updatedSession.verse
      }));
      // Rebuild drafted set from updated rosters
      const newDrafted = new Set();
      Object.values(updatedSession.rosters || {}).forEach(roster => {
        Object.values(roster).forEach(charId => newDrafted.add(charId));
      });
      setDraftedCharacterIds(newDrafted);
      setDrawnCharacter(null); // Clear draw on turn change
    };

    const handleDraw = ({ character }) => {
      setDrawnCharacter(character);
    };

    socket.on('draft:state', handleUpdate);
    socket.on('draft:update', handleUpdate);
    socket.on('draft:joined', ({ session }) => handleUpdate(session));
    socket.on('draft:draw', handleDraw);

    return () => {
      socket.off('draft:state', handleUpdate);
      socket.off('draft:update', handleUpdate);
      socket.off('draft:joined');
      socket.off('draft:draw', handleDraw);
    };
  }, [socket, isSocketMode]);

  const getOpenRoles = (playerId) => {
    if (!session || !session.verse) return [];
    const roster = session.rosters[playerId] || {};
    return session.verse.roles.filter(r => !roster[r.key]).map(r => r.key);
  };

  const drawCharacter = useCallback(() => {
    if (!session || isComplete || drawnCharacter || isCPUThinking || !isLocalTurn) return;

    const availableCharacters = allCharacters.filter(c => 
      !draftedCharacterIds.has(c._id) && 
      !(session.excludedCharacters || []).includes(c._id)
    );
    if (availableCharacters.length === 0) {
      console.warn("No characters left to draw!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    const selected = availableCharacters[randomIndex];
    setDrawnCharacter(selected);

    if (isSocketMode) {
      socket.emit('draft:draw', { draftId: session._id, character: selected });
    }
  }, [session, isComplete, drawnCharacter, isCPUThinking, allCharacters, draftedCharacterIds, isLocalTurn, socket, isSocketMode]);

  const nextTurn = useCallback((updatedRosters, updatedPasses) => {
    let nextIndex = session.currentTurnIndex + 1;
    let newStatus = session.status;
    
    // Check if both rosters are full (15 each)
    let totalAssigned = 0;
    Object.values(updatedRosters).forEach(roster => {
      totalAssigned += Object.keys(roster).length;
    });

    if (totalAssigned >= session.verse.roles.length * 2) {
      newStatus = 'complete';
    }

    setSession(prev => ({
      ...prev,
      rosters: updatedRosters,
      passesRemaining: updatedPasses,
      currentTurnIndex: nextIndex,
      status: newStatus
    }));
    setDrawnCharacter(null);
    setIsCPUThinking(false);
  }, [session]);

  const assignCharacter = useCallback((roleKey) => {
    if (!drawnCharacter || !currentTurnPlayerId || !isLocalTurn) return;

    if (isSocketMode) {
      socket.emit('draft:pick', {
        draftId: session._id,
        playerId: currentTurnPlayerId,
        roleKey,
        characterId: drawnCharacter._id
      });
      return; // Server will broadcast draft:update
    }

    const updatedRosters = { ...session.rosters };
    if (!updatedRosters[currentTurnPlayerId]) updatedRosters[currentTurnPlayerId] = {};
    
    updatedRosters[currentTurnPlayerId] = {
      ...updatedRosters[currentTurnPlayerId],
      [roleKey]: drawnCharacter._id
    };

    setDraftedCharacterIds(prev => new Set(prev).add(drawnCharacter._id));
    nextTurn(updatedRosters, session.passesRemaining);
  }, [drawnCharacter, currentTurnPlayerId, session, nextTurn, isLocalTurn, socket, isSocketMode]);

  const passTurn = useCallback(() => {
    if (!currentTurnPlayerId || !isLocalTurn) return;
    const passes = session.passesRemaining[currentTurnPlayerId] || 0;
    
    if (passes <= 0) {
      console.warn("No passes remaining. Forced assignment required.");
      return;
    }

    if (isSocketMode) {
      socket.emit('draft:pass', {
        draftId: session._id,
        playerId: currentTurnPlayerId
      });
      return; // Server will broadcast draft:update
    }

    const updatedPasses = {
      ...session.passesRemaining,
      [currentTurnPlayerId]: passes - 1
    };
    
    // Pass redraws instantly
    setSession(prev => ({ ...prev, passesRemaining: updatedPasses }));
    setDrawnCharacter(null);
    drawCharacter(); // Redraw immediately
  }, [currentTurnPlayerId, session, drawCharacter, isLocalTurn, socket, isSocketMode]);

  // CPU auto-turn state machine
  
  // 1. When it becomes CPU's turn and no character is drawn, start thinking
  useEffect(() => {
    if (session?.mode === 'cpu' && !isComplete && currentPlayer?.isCPU && !drawnCharacter && !isCPUThinking) {
      setIsCPUThinking(true);
    }
  }, [session?.mode, isComplete, currentPlayer?.isCPU, drawnCharacter, isCPUThinking]);

  // 2. When CPU is thinking and no character is drawn, draw a character after 500ms
  useEffect(() => {
    if (session?.mode === 'cpu' && !isComplete && currentPlayer?.isCPU && isCPUThinking && !drawnCharacter) {
      const timer = setTimeout(() => {
        const availableCharacters = allCharacters.filter(c => 
          !draftedCharacterIds.has(c._id) && 
          !(session.excludedCharacters || []).includes(c._id)
        );
        if (availableCharacters.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableCharacters.length);
          const charToAssign = availableCharacters[randomIndex];
          setDrawnCharacter(charToAssign);
        } else {
          setIsCPUThinking(false); // Failsafe
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [session?.mode, isComplete, currentPlayer?.isCPU, isCPUThinking, drawnCharacter, allCharacters, draftedCharacterIds, session?.excludedCharacters]);

  // 3. When CPU is thinking and character IS drawn, assign it after 1000ms
  useEffect(() => {
    if (session?.mode === 'cpu' && !isComplete && currentPlayer?.isCPU && isCPUThinking && drawnCharacter) {
      const timer = setTimeout(() => {
        const openRoles = getOpenRoles(currentPlayer.id);
        const bestRole = pickBestRoleForCharacter(drawnCharacter, openRoles);
        assignCharacter(bestRole);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [session?.mode, isComplete, currentPlayer?.isCPU, currentPlayer?.id, isCPUThinking, drawnCharacter, assignCharacter]);

  return {
    session,
    currentPlayer,
    drawnCharacter,
    isCPUThinking,
    isComplete,
    isLocalTurn,
    drawCharacter,
    assignCharacter,
    passTurn,
    getOpenRoles,
    setSession // Exposed so we can update session from LiveDraft if needed
  };
};
