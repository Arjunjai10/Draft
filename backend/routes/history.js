import express from 'express';
import MatchHistory from '../models/MatchHistory.js';

const router = express.Router();

// GET /api/history
router.get('/', async (req, res) => {
  try {
    const history = await MatchHistory.find()
      .populate('verseId', 'name')
      .sort({ playedAt: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
