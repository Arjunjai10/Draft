import express from 'express';
import Verse from '../models/Verse.js';
import Character from '../models/Character.js';

const router = express.Router();

// GET /api/verses
router.get('/', async (req, res) => {
  try {
    const { sort = 'new', search = '' } = req.query;
    
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let sortOptions = { publishedAt: -1 };
    if (sort === 'top') {
      sortOptions = { powerScore: -1 };
    }

    const verses = await Verse.find(query).sort(sortOptions);
    res.json(verses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/verses
router.post('/', async (req, res) => {
  try {
    const { name, description, coverImage, roles, characters } = req.body;
    
    if (!name || !roles || !characters || characters.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or characters' });
    }

    let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await Verse.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Compute powerScore
    let totalStats = 0;
    characters.forEach(char => {
      Object.values(char.stats).forEach(statVal => {
        totalStats += (Number(statVal) || 0);
      });
    });
    const powerScore = Math.floor(totalStats / characters.length);

    const verse = new Verse({
      slug,
      name,
      description,
      coverImages: coverImage ? [coverImage] : [],
      isOfficial: false,
      roles,
      characterCount: characters.length,
      roleCount: roles.length,
      powerScore,
      createdBy: null
    });
    
    await verse.save();

    // Insert Characters
    const docs = characters.map(c => ({
      verseId: verse._id,
      name: c.name,
      imageUrl: c.imageUrl,
      tags: c.tags,
      stats: c.stats
    }));

    await Character.insertMany(docs);

    res.status(201).json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
