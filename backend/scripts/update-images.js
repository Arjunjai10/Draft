import mongoose from 'mongoose';
import dotenv from 'dotenv';
import https from 'https';
import Character from '../models/Character.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animedraft';

const fetchAnilistImage = (search) => {
  return new Promise((resolve, reject) => {
    const query = `
      query ($search: String) {
        Character (search: $search) {
          image {
            large
          }
        }
      }
    `;
    const data = JSON.stringify({ query, variables: { search } });
    const req = https.request({
      hostname: 'graphql.anilist.co',
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(resData);
          if (json.data && json.data.Character && json.data.Character.image) {
            resolve(json.data.Character.image.large);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', (e) => resolve(null));
    req.write(data);
    req.end();
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB...');

    const characters = await Character.find({});
    console.log(`Found ${characters.length} characters to update.`);

    const imageCache = {}; // Cache to avoid duplicate requests for the same base character
    let updateCount = 0;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      // Extract base name (remove parentheses) e.g., "Goku (MUI)" -> "Goku"
      // Also handle some specific ones if needed, but mostly this works
      let baseName = char.name.replace(/\s*\([^)]*\)\s*/g, '').trim();

      // Special overrides for names that are too generic or clash
      if (baseName === 'A') baseName = 'Fourth Raikage';
      if (baseName === 'Pain (Deva Path)') baseName = 'Pain';

      if (!imageCache[baseName]) {
        console.log(`[${i+1}/${characters.length}] Fetching image for base character: ${baseName}...`);
        const url = await fetchAnilistImage(baseName);
        imageCache[baseName] = url || 'https://via.placeholder.com/150?text=No+Image';
        // Anilist rate limit is 90 per minute (so ~666ms per request)
        await delay(700); 
      }

      if (char.imageUrl !== imageCache[baseName]) {
        char.imageUrl = imageCache[baseName];
        await char.save();
        updateCount++;
      }
    }

    console.log(`Successfully updated ${updateCount} characters with images.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
