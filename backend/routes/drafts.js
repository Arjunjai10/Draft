import express from 'express';
import DraftSession from '../models/DraftSession.js';
import mongoose from 'mongoose';

const router = express.Router();

// POST /api/drafts
router.post('/', async (req, res) => {
  try {
    const { verseId, mode, players, passes, excludedCharacters } = req.body;
    
    // Initialize rosters and passes
    const rosters = {};
    const passesRemaining = {};
    const turnOrder = [];

    // Alternating turn order for the players
    const p1Id = (players && players[0] && players[0].id) ? players[0].id : 'player1';
    const p2Id = (players && players[1] && players[1].id) ? players[1].id : 'player2';
    
    // Create 15 turns for each player (since there are 15 roles)
    for (let i = 0; i < 15; i++) {
      turnOrder.push(p1Id);
      turnOrder.push(p2Id);
    }

    rosters[p1Id] = {};
    rosters[p2Id] = {};
    passesRemaining[p1Id] = passes || 10;
    passesRemaining[p2Id] = passes || 10;

    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const session = new DraftSession({
      verseId,
      mode,
      joinCode: mode === 'online' ? generateCode() : undefined,
      players,
      rosters,
      passesRemaining,
      turnOrder,
      currentTurnIndex: 0,
      status: mode === 'online' ? 'pending' : 'drafting',
      excludedCharacters: excludedCharacters || []
    });

    const savedSession = await session.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/drafts/:id
router.get('/:id', async (req, res) => {
  try {
    const session = await DraftSession.findById(req.params.id).populate('verseId');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/drafts/join/:code
router.post('/join/:code', async (req, res) => {
  try {
    const { playerName, playerToken } = req.body;
    const session = await DraftSession.findOne({ joinCode: req.params.code.toUpperCase() });
    
    if (!session) return res.status(404).json({ error: 'Battle code not found.' });
    if (session.status !== 'pending') return res.status(400).json({ error: 'This battle has already started or is closed.' });
    if (session.players.length >= 2) return res.status(400).json({ error: 'This battle is full.' });

    // Check if player already in session (unlikely for new joins, but safe)
    if (!session.players.find(p => p.token === playerToken)) {
      session.players.push({ id: 'player2', name: playerName, token: playerToken });
      
      // If 2 players are now here, move status to drafting
      if (session.players.length === 2) {
        session.status = 'drafting';
      }
      
      await session.save();
      
      // We don't necessarily need to broadcast here because LiveDraft handles draft:join
      // But we can rely on LiveDraft's socket logic to connect and emit 'draft:join'
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/drafts/:id
router.put('/:id', async (req, res) => {
  try {
    const session = await DraftSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    if (req.body.status) session.status = req.body.status;
    if (req.body.rosters) {
      session.rosters = new Map();
      Object.entries(req.body.rosters).forEach(([playerId, roster]) => {
        session.rosters.set(playerId, new Map(Object.entries(roster)));
      });
    }
    
    const savedSession = await session.save();
    res.json(savedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/drafts/:id/debug-complete
router.post('/:id/debug-complete', async (req, res) => {
  try {
    const session = await DraftSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    session.status = 'complete';
    
    // Fill rosters with fake character IDs for 15 roles each just so the simulation doesn't crash
    const rosters = session.rosters || {};
    const verse = await mongoose.model('Verse').findById(session.verseId);
    const roles = verse.roles.map(r => r.key);
    const p1Id = session.players[0]?.id || 'player1';
    const p2Id = session.players[1]?.id || 'player2';
    
    // We actually need real DB character IDs for the simulation to work.
    const chars = await mongoose.model('Character').find({ verseId: session.verseId });
    
    rosters[p1Id] = {};
    rosters[p2Id] = {};
    
    for (let i = 0; i < roles.length; i++) {
      if (chars[i]) rosters[p1Id][roles[i]] = chars[i]._id.toString();
      if (chars[roles.length + i]) rosters[p2Id][roles[i]] = chars[roles.length + i]._id.toString();
    }
    
    session.rosters = new Map([
      [p1Id, new Map(Object.entries(rosters[p1Id]))],
      [p2Id, new Map(Object.entries(rosters[p2Id]))]
    ]);
    session.markModified('rosters');
    const savedSession = await session.save();
    res.json(savedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
