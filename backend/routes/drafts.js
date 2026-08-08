import express from 'express';
import DraftSession from '../models/DraftSession.js';

const router = express.Router();

// POST /api/drafts
router.post('/', async (req, res) => {
  try {
    const { verseId, mode, players, passes } = req.body;
    
    // Initialize rosters and passes
    const rosters = {};
    const passesRemaining = {};
    const turnOrder = [];

    // Simple alternating turn order for 1v1
    const p1Id = 'player1';
    const p2Id = 'player2';
    
    // Create 15 turns for each player (since there are 15 roles)
    for (let i = 0; i < 15; i++) {
      turnOrder.push(p1Id);
      turnOrder.push(p2Id);
    }

    rosters[p1Id] = {};
    rosters[p2Id] = {};
    passesRemaining[p1Id] = passes || 10;
    passesRemaining[p2Id] = passes || 10;

    const session = new DraftSession({
      verseId,
      mode,
      players,
      rosters,
      passesRemaining,
      turnOrder,
      currentTurnIndex: 0,
      status: 'drafting'
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
    const session = await DraftSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
