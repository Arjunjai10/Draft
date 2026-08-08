import DraftSession from './models/DraftSession.js';

const disconnectTimers = {}; // { [draftId_playerToken]: NodeJS.Timeout }
const playerSockets = {}; // { [draftId_playerToken]: socketId }
const socketTokens = {}; // { [socketId]: playerToken }

export default (io) => {
  io.on('connection', (socket) => {
    
    socket.on('tournament:join', ({ tournamentId }) => {
      socket.join(`tournament_${tournamentId}`);
    });

    socket.on('draft:join', async ({ draftId, playerToken, playerName, playerId, role }) => {
      try {
        const session = await DraftSession.findById(draftId);
        if (!session) return socket.emit('error', 'Session not found');

        if (role === 'spectator') {
          socket.join(draftId);
          socket.emit('draft:state', session);
          return;
        }

        // Check if player is already in the session by token
        let player = session.players.find(p => p.token === playerToken);
        
        if (!player) {
          // If not found by token, check if there's an empty slot or if we're adding player 2
          if (session.players.length === 1 && playerId === 'player2') {
            player = { id: 'player2', name: playerName, token: playerToken };
            session.players.push(player);
            await session.save();
          } else if (session.players.length === 1 && playerId === 'player1') {
            // Rejoining player 1 before player 2 joins (just updating token)
            session.players[0].token = playerToken;
            player = session.players[0];
            await session.save();
          } else if (session.players.find(p => p.id === playerId && !p.token)) {
             // Matching by ID if token was missing
             const existing = session.players.find(p => p.id === playerId);
             existing.token = playerToken;
             player = existing;
             await session.save();
          } else {
            return socket.emit('error', 'Room full or invalid token');
          }
        }

        socket.join(draftId);
        
        // Save socket mapping
        const timerKey = `${draftId}_${playerToken}`;
        playerSockets[timerKey] = socket.id;
        socketTokens[socket.id] = playerToken;

        // Clear any existing disconnect timer
        if (disconnectTimers[timerKey]) {
          clearTimeout(disconnectTimers[timerKey]);
          delete disconnectTimers[timerKey];
          // Tell the other player they reconnected
          socket.to(draftId).emit('draft:reconnected', { playerId: player.id });
        }

        // Send full state to joining player
        socket.emit('draft:state', session);

        // Tell the room someone joined (useful for updating players array)
        socket.to(draftId).emit('draft:joined', { session });

        socket.on('disconnect', () => {
          delete socketTokens[socket.id];
          // If this socket was the latest one for this player
          if (playerSockets[timerKey] === socket.id) {
            socket.to(draftId).emit('draft:opponentDisconnected', { playerId: player.id });
            
            disconnectTimers[timerKey] = setTimeout(() => {
              io.to(draftId).emit('draft:abandoned', { playerId: player.id });
              delete disconnectTimers[timerKey];
            }, 60000); // 60 seconds
          }
        });

      } catch (err) {
        console.error('Socket join error:', err);
      }
    });

    socket.on('draft:draw', ({ draftId, character, playerToken }) => {
      // Basic security for drawing (optional but good practice)
      const token = socketTokens[socket.id] || playerToken;
      socket.to(draftId).emit('draft:draw', { character });
    });

    socket.on('draft:pick', async ({ draftId, playerId, roleKey, characterId }) => {
      try {
        const session = await DraftSession.findById(draftId);
        if (!session) return;
        if (session.status !== 'drafting') return;
        
        // Server-side enforcement of turn and token
        const token = socketTokens[socket.id];
        const player = session.players.find(p => p.token === token);
        if (!player || player.id !== playerId) return socket.emit('error', 'Unauthorized');
        if (session.turnOrder[session.currentTurnIndex] !== playerId) return;

        // Update roster
        const rosterData = session.rosters.get(playerId) || new Map();
        rosterData.set(roleKey, characterId);
        session.rosters.set(playerId, rosterData);

        // Check completion
        let totalAssigned = 0;
        session.rosters.forEach(r => totalAssigned += r.size);
        const rolesCount = 15; // Hardcode for now or calculate from Verse if populated

        if (totalAssigned >= rolesCount * 2) {
          session.status = 'complete';
        } else {
          session.currentTurnIndex++;
        }

        await session.save();
        io.to(draftId).emit('draft:update', session);

      } catch (err) {
        console.error('Socket pick error:', err);
      }
    });

    socket.on('draft:pass', async ({ draftId, playerId }) => {
      try {
        const session = await DraftSession.findById(draftId);
        if (!session) return;
        if (session.status !== 'drafting') return;
        
        // Server-side enforcement of turn and token
        const token = socketTokens[socket.id];
        const player = session.players.find(p => p.token === token);
        if (!player || player.id !== playerId) return socket.emit('error', 'Unauthorized');
        if (session.turnOrder[session.currentTurnIndex] !== playerId) return;

        const passes = session.passesRemaining.get(playerId) || 0;
        if (passes <= 0) return;

        session.passesRemaining.set(playerId, passes - 1);
        await session.save();

        io.to(draftId).emit('draft:update', session);
      } catch (err) {
        console.error('Socket pass error:', err);
      }
    });

  });
};
