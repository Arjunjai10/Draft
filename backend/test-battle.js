import mongoose from 'mongoose';
import DraftSession from './models/DraftSession.js';
import Verse from './models/Verse.js';
import Character from './models/Character.js';
import { simulateBattle, resolveTie } from './utils/battleEngine.js';

const run = async () => {
  await mongoose.connect('mongodb://localhost:27017/animedraft');
  const verse = await Verse.findOne({ slug: 'dbz' });
  const chars = await Character.find({ verseId: verse._id }).lean();
  
  const rosters = {
    player1: {},
    player2: {}
  };
  
  verse.roles.forEach((r, i) => {
    rosters.player1[r.key] = chars[i];
    rosters.player2[r.key] = chars[i + 15];
  });
  
  const result = simulateBattle(rosters.player1, rosters.player2, verse.roles, 'player1', 'player2');
  console.log(`P1: ${result.scoreA} vs P2: ${result.scoreB}. Winner: ${result.overallWinner}`);
  
  // Test forced tie
  console.log("\nTesting forced tiebreak...");
  const tiedRoster1 = {};
  const tiedRoster2 = {};
  
  // Create identical rosters but tweak one stat slightly to ensure one is the tiebreaker winner
  verse.roles.forEach((r, i) => {
    // Both players get the exact same character to force 0-0 or rather, if stats are identical, statA == statB -> tie
    // We will clone the character to mutate it
    tiedRoster1[r.key] = JSON.parse(JSON.stringify(chars[0]));
    tiedRoster2[r.key] = JSON.parse(JSON.stringify(chars[0]));
  });

  // Make Player 2 win by 1 point overall stat
  tiedRoster2[verse.roles[0].key].stats[verse.roles[0].key] += 1;

  const tieResult = simulateBattle(tiedRoster1, tiedRoster2, verse.roles, 'player1', 'player2');
  console.log(`Tie battle: P1: ${tieResult.scoreA} vs P2: ${tieResult.scoreB}. Round Winner: ${tieResult.overallWinner}`);
  
  const tieWinner = resolveTie(tiedRoster1, tiedRoster2, verse.roles, 'player1', 'player2');
  console.log(`Tie resolved! Winner should be player2. Actual: ${tieWinner}`);
  
  process.exit(0);
};

run();
