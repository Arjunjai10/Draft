import mongoose from 'mongoose';
import Character from './models/Character.js';

const run = async () => {
  await mongoose.connect('mongodb://localhost:27017/animedraft');
  const chars = await Character.find();
  console.log(`Found ${chars.length} characters`);
  chars.slice(0, 3).forEach(c => {
    console.log(c.name, c.stats);
  });
  process.exit(0);
};
run();
