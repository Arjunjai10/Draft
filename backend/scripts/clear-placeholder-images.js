import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Character from '../models/Character.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animedraft';

async function run() {
  await mongoose.connect(MONGO_URI);

  // Null out any imageUrl that points to the defunct via.placeholder.com service
  // (or any other placeholder-like URL) so the component falls through to the
  // initial-letter fallback instead of issuing a network request that times out.
  const result = await Character.updateMany(
    { imageUrl: { $regex: 'placeholder', $options: 'i' } },
    { $unset: { imageUrl: '' } }
  );

  console.log(`Cleared dead placeholder imageUrls from ${result.modifiedCount} character(s).`);
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
