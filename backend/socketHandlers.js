import DraftSession from './models/DraftSession.js';
import { isCharacterTaken, isRoleTaken, isPlayersTurn, advanceTurn } from './utils/draftValidation.js';

const disconnectTimers = {}; // { [draftId_playerToken]: NodeJS.Timeout }
const playerSockets  = {}; // { [draftId_playerToken]: socketId }
const socketTokens   = {}; // { [socketId]: playerToken }

export default (io) => {
  io.on('connection', (socket) => {

    // ─── Disconnect handler — registered ONCE per connection at this scope. ───
    // Previously this was registered inside draft:join, so every reconnect
    // stacked another listener on the same socket. On disconnect the room would
    // receive N copies of draft:opponentDisconnected.  Storing context on the
    // socket object (socket._draftId / socket._draftPlayer) gives the single
    // handler everything it needs.
    socket.on('disconnect', () => {
      const { _draftId, _draftPlayer } = socket;
      delete socketTokens[socket.id];

      if (!_draftId || !_draftPlayer) return;

      const timerKey = `${_draftId}_${_draftPlayer.token}`;
      if (playerSockets[timerKey] !== socket.id) return; // A newer socket superseded this one

      socket.to(_draftId).emit('draft:opponentDisconnected', { playerId: _draftPlayer.id });

      disconnectTimers[timerKey] = setTimeout(() => {
        io.to(_draftId).emit('draft:abandoned', { playerId: _draftPlayer.id });
        // Clean up both maps so long-running servers don't leak entries
        delete disconnectTimers[timerKey];
        delete playerSockets[timerKey];
      }, 60000);
    });

    // ─────────────────────────────────────────────────────────────────────────

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

        // Resolve or create the player record in the session
        let player = session.players.find(p => p.token === playerToken);

        if (!player) {
          if (session.players.length === 1 && playerId === 'player2') {
            player = { id: 'player2', name: playerName, token: playerToken };
            session.players.push(player);
            await session.save();
          } else if (session.players.length === 1 && playerId === 'player1') {
            session.players[0].token = playerToken;
            player = session.players[0];
            await session.save();
          } else if (session.players.find(p => p.id === playerId && !p.token)) {
            const existing = session.players.find(p => p.id === playerId);
            existing.token = playerToken;
            player = existing;
            await session.save();
          } else {
            return socket.emit('error', 'Room full or invalid token');
          }
        }

        socket.join(draftId);

        const timerKey = `${draftId}_${playerToken}`;
        playerSockets[timerKey] = socket.id;
        socketTokens[socket.id]  = playerToken;

        // Store draft context so the top-level disconnect handler can use it
        socket._draftId     = draftId;
        socket._draftPlayer = player;

        // Cancel any pending abandon timer (player reconnected in time)
        if (disconnectTimers[timerKey]) {
          clearTimeout(disconnectTimers[timerKey]);
          delete disconnectTimers[timerKey];
          socket.to(draftId).emit('draft:reconnected', { playerId: player.id });
        }

        socket.emit('draft:state', session);
        socket.to(draftId).emit('draft:joined', { session });

        // ── No socket.on('disconnect') here any more (C7 fix) ──

      } catch (err) {
        console.error('Socket join error:', err);
      }
    });

    // S3: Only relay draw events from sockets that have a verified identity.
    // Old code: `const token = socketTokens[socket.id] || playerToken`
    // Exploit: a socket that never called draft:join could pass any playerToken
    // in the payload and broadcast draws as another player.
    socket.on('draft:draw', ({ draftId, character }) => {
      const token = socketTokens[socket.id];
      if (!token) return socket.emit('error', 'Not joined to a draft');
      socket.to(draftId).emit('draft:draw', { character });
    });

    socket.on('draft:pick', async ({ draftId, playerId, roleKey, characterId }) => {
      try {
        const session = await DraftSession.findById(draftId);
        if (!session) return;
        if (session.status !== 'drafting') return;

        // Identity check
        const token = socketTokens[socket.id];
        const player = session.players.find(p => p.token === token);
        if (!player) return socket.emit('error', 'Unauthorized');
        if ((session.mode === 'online' || session.mode === 'tournament') && player.id !== playerId) {
          return socket.emit('error', 'Unauthorized');
        }

        // Turn check
        if (!isPlayersTurn(session, playerId)) return;

        // S2: role must be empty for THIS player.
        // (Each player fills the same role-keys independently, so we only
        //  check the current player's roster, not across both players.)
        if (isRoleTaken(session.rosters, playerId, roleKey)) {
          return socket.emit('error', 'Role already filled');
        }

        // S1: character must not exist in ANY roster (cross-player uniqueness).
        // The role check above is intentionally scoped per-player; this guard
        // is intentionally global — you can't draft a character your opponent holds.
        const charIdStr = characterId?.toString();
        if (isCharacterTaken(session.rosters, charIdStr)) {
          return socket.emit('error', 'Character already taken');
        }

        // Apply the pick
        const rosterData = session.rosters.get(playerId) || new Map();
        rosterData.set(roleKey, characterId);
        session.rosters.set(playerId, rosterData);

        // C2: use turnOrder.length as the completion signal, not a hardcoded 30.
        // advanceTurn returns the new index and status without mutation.
        const { currentTurnIndex, status } = advanceTurn(session);
        session.currentTurnIndex = currentTurnIndex;
        session.status = status;

        await session.save();
        io.to(draftId).emit('draft:update', session);

      } catch (err) {
        console.error('Socket pick error:', err);
      }
    });

    // C1 note: pass does NOT advance currentTurnIndex — by design.
    // Pass = discard the drawn character and draw again on the SAME turn.
    // The client clears drawnCharacter on receipt of draft:update and
    // re-shows the Draw button for the same player. Advancing the index
    // here would skip the passing player's turn entirely.
    socket.on('draft:pass', async ({ draftId, playerId }) => {
      try {
        const session = await DraftSession.findById(draftId);
        if (!session) return;
        if (session.status !== 'drafting') return;

        const token = socketTokens[socket.id];
        const player = session.players.find(p => p.token === token);
        if (!player) return socket.emit('error', 'Unauthorized');
        if ((session.mode === 'online' || session.mode === 'tournament') && player.id !== playerId) {
          return socket.emit('error', 'Unauthorized');
        }
        if (!isPlayersTurn(session, playerId)) return;

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
