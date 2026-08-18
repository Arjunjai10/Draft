import express from 'express';
import Tournament from '../models/Tournament.js';
import DraftSession from '../models/DraftSession.js';
import { generateBracket } from '../utils/bracketGenerator.js';

const router = express.Router();

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/tournaments
router.post('/', async (req, res) => {
  try {
    const { verseId, playerCount, rolesCount, passesPerPlayer, hostIsPlaying, hostName, hostToken } = req.body;
    
    const tournament = new Tournament({
      code: generateCode(),
      hostId: hostToken, // use token as a simple host identifier
      verseId,
      playerCount,
      rolesCount: rolesCount || 15,
      passesPerPlayer: passesPerPlayer || 10,
      players: hostIsPlaying ? [{ id: 'p1', name: hostName, token: hostToken }] : []
    });

    await tournament.save();
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tournaments/:code/join
router.post('/:code/join', async (req, res) => {
  try {
    const { playerName, playerToken } = req.body;
    const tournament = await Tournament.findOne({ code: req.params.code.toUpperCase() });
    
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.status !== 'pending') return res.status(400).json({ error: 'Tournament already started' });
    if (tournament.players.length >= tournament.playerCount) return res.status(400).json({ error: 'Tournament is full' });

    // Check if player already in lobby
    if (!tournament.players.find(p => p.token === playerToken)) {
      const nextId = `p${tournament.players.length + 1}`;
      tournament.players.push({ id: nextId, name: playerName, token: playerToken });
      await tournament.save();
      
      const io = req.app.get('io');
      if (io) {
        io.to(`tournament_${tournament._id}`).emit('tournament:bracketUpdate', tournament);
      }
    }

    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tournaments/:id/start
router.post('/:id/start', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    if (tournament.status !== 'pending') return res.status(400).json({ error: 'Already started' });
    if (tournament.players.length !== tournament.playerCount) return res.status(400).json({ error: 'Not enough players' });

    // Generate bracket
    const bracketData = generateBracket(tournament.players, tournament.playerCount);

    // Create DraftSessions for matches
    for (let i = 0; i < bracketData.length; i++) {
      const match = bracketData[i];
      
      const playersForSession = [];
      if (match.p1) playersForSession.push(match.p1);
      if (match.p2) playersForSession.push(match.p2);

      const session = new DraftSession({
        verseId: tournament.verseId,
        tournamentId: tournament._id,
        mode: 'tournament',
        players: playersForSession,
        status: playersForSession.length === 2 ? 'drafting' : 'pending',
        rosters: {},
        passesRemaining: {}
      });

      // Init turn order and rosters if both players are present
      if (playersForSession.length === 2) {
        const turnOrder = [];
        for (let t = 0; t < tournament.rolesCount; t++) {
          turnOrder.push(playersForSession[0].id);
          turnOrder.push(playersForSession[1].id);
        }
        session.turnOrder = turnOrder;
        
        const passes = {};
        const rosters = {};
        playersForSession.forEach(p => {
          passes[p.id] = tournament.passesPerPlayer;
          rosters[p.id] = {};
        });
        session.passesRemaining = passes;
        session.rosters = rosters;
      }

      const savedSession = await session.save();
      match.draftId = savedSession._id;
    }

    tournament.bracket = bracketData;
    tournament.status = 'in_progress';
    await tournament.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`tournament_${tournament._id}`).emit('tournament:bracketUpdate', tournament);
    }

    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tournaments/:id
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
