import { useState, useCallback, useEffect } from 'react';
import { pickBestRoleForCharacter } from '../utils/cpuAI.js';

export const useDraftTurn = (sessionData, allCharacters, socket = null, localPlayerId = null) => {
  const [session, setSession] = useState(sessionData);
  const [draftedCharacterIds, setDraftedCharacterIds] = useState(new Set());
  const [drawnCharacter, setDrawnCharacter] = useState(null);
  const [isCPUThinking, setIsCPUThinking] = useState(false);

  const currentTurnPlayerId = session?.turnOrder[session?.currentTurnIndex];
  const isComplete = session?.status === 'complete';
  const currentPlayer = session?.players.find(p => p.id === currentTurnPlayerId);

  // In local mode, both players are "local". In online mode, only the localPlayerId is "local"
  const isLocalTurn = session?.mode === 'online' ? currentTurnPlayerId === localPlayerId : true;

  // Socket listeners
  useEffect(() => {
    if (!socket || session?.mode !== 'online') return;

    const handleUpdate = (updatedSession) => {
      setSession(updatedSession);
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
    socket.on('draft:draw', handleDraw);

    return () => {
      socket.off('draft:state', handleUpdate);
      socket.off('draft:update', handleUpdate);
      socket.off('draft:draw', handleDraw);
    };
  }, [socket, session?.mode]);

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

    if (session.mode === 'online' && socket) {
      socket.emit('draft:draw', { draftId: session._id, character: selected });
    }
  }, [session, isComplete, drawnCharacter, isCPUThinking, allCharacters, draftedCharacterIds, isLocalTurn, socket]);

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

    if (session.mode === 'online' && socket) {
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
  }, [drawnCharacter, currentTurnPlayerId, session, nextTurn, isLocalTurn, socket]);

  const passTurn = useCallback(() => {
    if (!currentTurnPlayerId || !isLocalTurn) return;
    const passes = session.passesRemaining[currentTurnPlayerId] || 0;
    
    if (passes <= 0) {
      console.warn("No passes remaining. Forced assignment required.");
      return;
    }

    if (session.mode === 'online' && socket) {
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
  }, [currentTurnPlayerId, session, drawCharacter, isLocalTurn, socket]);

  // CPU auto-turn logic (only if mode is 'cpu')
  if (session?.mode === 'cpu' && !isComplete && currentPlayer?.isCPU && !isCPUThinking && !drawnCharacter) {
    setIsCPUThinking(true);
    setTimeout(() => {
      const availableCharacters = allCharacters.filter(c => 
        !draftedCharacterIds.has(c._id) && 
        !(session.excludedCharacters || []).includes(c._id)
      );
      if (availableCharacters.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCharacters.length);
        const charToAssign = availableCharacters[randomIndex];
        
        const openRoles = getOpenRoles(currentPlayer.id);
        const bestRole = pickBestRoleForCharacter(charToAssign, openRoles);
        
        setDrawnCharacter(charToAssign);
        
        setTimeout(() => {
          const updatedRosters = { ...session.rosters };
          if (!updatedRosters[currentPlayer.id]) updatedRosters[currentPlayer.id] = {};
          updatedRosters[currentPlayer.id][bestRole] = charToAssign._id;
          
          setDraftedCharacterIds(prev => new Set(prev).add(charToAssign._id));
          nextTurn(updatedRosters, session.passesRemaining);
        }, 1000);
      }
    }, 500);
  }

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
