import express from 'express';
import Verse from '../models/Verse.js';
import Character from '../models/Character.js';

const router = express.Router();

// GET /api/verses/:slug
router.get('/:slug', async (req, res) => {
  try {
    const verse = await Verse.findOne({ slug: req.params.slug });
    if (!verse) return res.status(404).json({ error: 'Verse not found' });
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/verses/:slug/characters
router.get('/:slug/characters', async (req, res) => {
  try {
    const verse = await Verse.findOne({ slug: req.params.slug });
    if (!verse) return res.status(404).json({ error: 'Verse not found' });

    const characters = await Character.find({ verseId: verse._id });
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
