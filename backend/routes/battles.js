import express from 'express';
import DraftSession from '../models/DraftSession.js';
import BattleResult from '../models/BattleResult.js';
import Character from '../models/Character.js';
import Verse from '../models/Verse.js';
import MatchHistory from '../models/MatchHistory.js';
import Tournament from '../models/Tournament.js';
import { simulateBattle } from '../utils/battleEngine.js';

const router = express.Router();

// POST /api/battles/:draftId/simulate
router.post('/:draftId/simulate', async (req, res) => {
  try {
    const session = await DraftSession.findById(req.params.draftId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'complete') {
      return res.status(400).json({ error: 'Draft is not complete yet' });
    }

    const verse = await Verse.findById(session.verseId);
    if (!verse) return res.status(404).json({ error: 'Verse not found' });

    // Check if result already exists
    let existingResult = await BattleResult.findOne({ draftId: session._id });
    if (existingResult) {
      return res.json(existingResult);
    }

    const player1 = session.players[0].id;
    const player2 = session.players[1].id;

    // Load full characters for the rosters
    const chars = await Character.find({ verseId: verse._id }).lean();
    const charMap = {};
    chars.forEach(c => charMap[c._id.toString()] = c);

    const rosterA = {};
    const rosterB = {};

    const p1RosterData = session.rosters.get(player1) || new Map();
    const p2RosterData = session.rosters.get(player2) || new Map();

    // Map Mongoose Map to plain object with full character data
    for (const [roleKey, charId] of p1RosterData.entries()) {
      rosterA[roleKey] = charMap[charId.toString()];
    }
    for (const [roleKey, charId] of p2RosterData.entries()) {
      rosterB[roleKey] = charMap[charId.toString()];
    }

    const result = simulateBattle(rosterA, rosterB, verse.roles, player1, player2);

    const battleResult = new BattleResult({
      draftId: session._id,
      scoreA: result.scoreA,
      scoreB: result.scoreB,
      overallWinner: result.overallWinner,
      rounds: result.rounds
    });

    const savedResult = await battleResult.save();

    // Log to MatchHistory if not a tournament
    if (session.mode !== 'tournament') {
      const historyEntry = new MatchHistory({
        userId: null,
        opponentName: session.players[1]?.name || 'CPU',
        verseId: verse._id,
        mode: session.mode,
        score: { p1: result.scoreA, p2: result.scoreB },
        result: result.overallWinner
      });
      await historyEntry.save();
    } else {
      // Tournament Advancement Logic
      const tournament = await Tournament.findById(session.tournamentId);
      if (tournament) {
        const matchIndex = tournament.bracket.findIndex(m => m.draftId && m.draftId.toString() === session._id.toString());
        if (matchIndex !== -1) {
          const match = tournament.bracket[matchIndex];
          
          // Determine winning player object
          let winningPlayer = null;
          if (result.overallWinner === player1) {
            winningPlayer = session.players[0];
          } else if (result.overallWinner === player2) {
            winningPlayer = session.players[1];
          }
          
          if (winningPlayer) {
            match.winnerId = winningPlayer.id;
            
            // Move winner to next match if there is one
            if (match.nextMatchId) {
              const nextMatchIndex = tournament.bracket.findIndex(m => m.matchId === match.nextMatchId);
              if (nextMatchIndex !== -1) {
                const nextMatch = tournament.bracket[nextMatchIndex];
                if (!nextMatch.p1 || !nextMatch.p1.id) {
                  nextMatch.p1 = { id: winningPlayer.id, name: winningPlayer.name };
                } else if (!nextMatch.p2 || !nextMatch.p2.id) {
                  nextMatch.p2 = { id: winningPlayer.id, name: winningPlayer.name };
                }
                
                // If both p1 and p2 are now present, init the next DraftSession
                if (nextMatch.p1 && nextMatch.p1.id && nextMatch.p2 && nextMatch.p2.id && nextMatch.draftId) {
                  const nextSession = await DraftSession.findById(nextMatch.draftId);
                  if (nextSession) {
                    nextSession.players = [
                      { id: nextMatch.p1.id, name: nextMatch.p1.name, token: nextMatch.p1.token },
                      { id: nextMatch.p2.id, name: nextMatch.p2.name, token: nextMatch.p2.token }
                    ];
                    console.log('--- DEBUG --- nextSession.players assigned:', nextSession.players);
                    
                    const turnOrder = [];
                    for (let t = 0; t < tournament.rolesCount; t++) {
                      turnOrder.push(nextMatch.p1.id);
                      turnOrder.push(nextMatch.p2.id);
                    }
                    nextSession.turnOrder = turnOrder;
                    
                    const passes = {};
                    const rosters = {};
                    nextSession.players.forEach(p => {
                      passes[p.id] = tournament.passesPerPlayer;
                      rosters[p.id] = {};
                    });
                    nextSession.passesRemaining = passes;
                    nextSession.rosters = rosters;
                    nextSession.status = 'drafting';
                    
                    await nextSession.save();
                  }
                }
              }
            } else {
              // Final match complete
              tournament.status = 'complete';
            }
            
            tournament.markModified('bracket');
            await tournament.save();
            
            // Emit socket event
            const io = req.app.get('io');
            if (io) {
              io.to(`tournament_${tournament._id}`).emit('tournament:bracketUpdate', tournament);
            }
          }
        }
      }
    }

    res.json(savedResult);

  } catch (error) {
    console.error('Error simulating battle:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/battles/:draftId
router.get('/:draftId', async (req, res) => {
  try {
    const result = await BattleResult.findOne({ draftId: req.params.draftId });
    if (!result) return res.status(404).json({ error: 'Battle result not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
