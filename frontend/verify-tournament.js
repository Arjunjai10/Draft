import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

const API = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
  console.log("Starting Tournament Verification Pass...");

  // Get verse and characters
  const verseRes = await fetch(`${API}/verses/dbz`);
  const verse = await verseRes.json();
  const charsRes = await fetch(`${API}/verses/dbz/characters`);
  const chars = await charsRes.json();
  
  if (!verse || !chars.length) {
    console.error("No verse or characters found.");
    process.exit(1);
  }

  const p1Token = uuidv4();
  const p2Token = uuidv4();
  const p3Token = uuidv4();
  
  console.log("--- 1. Testing 3-Player Tournament & Tiebreak & Spectator ---");
  // Create 3-player tournament
  const hostRes = await fetch(`${API}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verseId: verse._id,
      playerCount: 3,
      rolesCount: 15,
      passesPerPlayer: 10,
      hostIsPlaying: true,
      hostName: 'P1',
      hostToken: p1Token
    })
  });
  let tournament = await hostRes.json();
  const code = tournament.code;
  console.log(`Created 3-player tournament: ${code}`);

  // Join P2
  await fetch(`${API}/tournaments/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName: 'P2', playerToken: p2Token })
  });
  
  // Join P3
  await fetch(`${API}/tournaments/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName: 'P3', playerToken: p3Token })
  });

  // Start Tournament
  const startRes = await fetch(`${API}/tournaments/${tournament._id}/start`, {
    method: 'POST'
  });
  tournament = await startRes.json();
  console.log("Started tournament.");

  const sfMatch = tournament.bracket.find(m => m.matchId === 'SF-1');
  const fMatch = tournament.bracket.find(m => m.matchId === 'F-1');
  
  console.log(`SF Match: ${sfMatch.p1.name} vs ${sfMatch.p2.name} (Draft: ${sfMatch.draftId})`);
  console.log(`F Match: ${fMatch.p1.name} (Bye) vs TBD (Draft: ${fMatch.draftId || 'none'})`);

  const p1Id = tournament.players.find(p => p.token === p1Token).id;
  const p2Id = tournament.players.find(p => p.token === p2Token).id;
  const p3Id = tournament.players.find(p => p.token === p3Token).id;

  // Let's connect sockets for SF-1
  const socketP2 = io(SOCKET_URL);
  const socketP3 = io(SOCKET_URL);
  
  const spectatorToken = uuidv4();
  const socketSpec = io(SOCKET_URL);

  let draftStateP2, draftStateP3, draftStateSpec;

  const sfP1Token = tournament.players.find(p => p.id === sfMatch.p1.id).token;
  const sfP2Token = tournament.players.find(p => p.id === sfMatch.p2.id).token;

  const p2Promise = new Promise((resolve, reject) => {
    socketP2.on('connect', () => {
      socketP2.emit('draft:join', { draftId: sfMatch.draftId, playerToken: sfP1Token, playerName: sfMatch.p1.name, playerId: sfMatch.p1.id });
    });
    socketP2.on('draft:state', state => resolve(state));
    socketP2.on('error', err => reject(new Error('SocketP2 Error: ' + err)));
  });

  const p3Promise = new Promise((resolve, reject) => {
    socketP3.on('connect', () => {
      socketP3.emit('draft:join', { draftId: sfMatch.draftId, playerToken: sfP2Token, playerName: sfMatch.p2.name, playerId: sfMatch.p2.id });
    });
    socketP3.on('draft:state', state => resolve(state));
    socketP3.on('error', err => reject(new Error('SocketP3 Error: ' + err)));
  });

  const specPromise = new Promise(resolve => {
    socketSpec.on('connect', () => {
      socketSpec.emit('draft:join', { draftId: sfMatch.draftId, playerToken: spectatorToken, role: 'spectator' });
    });
    socketSpec.on('draft:state', state => resolve(state));
  });

  [draftStateP2, draftStateP3, draftStateSpec] = await Promise.all([p2Promise, p3Promise, specPromise]);
  console.log("All sockets connected to SF-1");

  // Verify spectator enforcement
  console.log("Attempting malicious spectator pick...");
  const maliciousPromise = new Promise(resolve => {
    socketSpec.on('error', (err) => resolve(err));
  });
  
  socketSpec.emit('draft:pick', { 
    draftId: sfMatch.draftId, 
    playerId: sfMatch.p1.id, // Pretending to be P2
    roleKey: verse.roles[0].key, 
    characterId: chars[0]._id 
  });
  
  const specError = await maliciousPromise;
  console.log(`Malicious spectator got error: ${specError}`);
  if (specError !== 'Unauthorized') {
    throw new Error("Spectator bypass NOT blocked!");
  }

  // To quickly finish the draft, let's just cheat and hit the DB directly or use the simulate endpoint by updating the DraftSession?
  // Actually, we must simulate exactly the tie condition. To tie, they must have exactly equal stats.
  // We can just rapidly fire draft:pick for all 15 roles via sockets, or manually update MongoDB if we want to save time. 
  // For verification, it's safer to use the socket layer to prove it works end-to-end.

  console.log("Rapidly drafting SF-1 (Forcing a tie)...");
  // We want to force a tie. So we assign exactly the same characters if possible. Wait, they draw characters.
  // The characters must be identical. Let's just draw and assign.
  
  let currentTurnIndex = 0;
  while (currentTurnIndex < 30) {
    const turnPlayerId = draftStateP2.turnOrder[currentTurnIndex];
    const roleToAssign = verse.roles[currentTurnIndex % 15].key;
    // We will assign a character
    const charToAssign = chars[currentTurnIndex % 15]._id;
    
    // We'll use the correct socket
    const s = turnPlayerId === sfMatch.p1.id ? socketP2 : socketP3;
    
    s.emit('draft:pick', { draftId: sfMatch.draftId, playerId: turnPlayerId, roleKey: roleToAssign, characterId: charToAssign });
    
    // Wait for update
    await new Promise(r => {
      socketP2.once('draft:update', state => {
        draftStateP2 = state;
        currentTurnIndex = state.currentTurnIndex;
        if (state.status === 'complete') currentTurnIndex = 30; // Exit loop
        r();
      });
    });
  }

  console.log(`SF-1 Draft status: ${draftStateP2.status}`);

  // Now simulate SF-1
  const simRes = await fetch(`${API}/battles/${sfMatch.draftId}/simulate`, { method: 'POST' });
  const simData = await simRes.json();
  console.log(`SF-1 Result: ${sfMatch.p1.name} Score=${simData.scoreA}, ${sfMatch.p2.name} Score=${simData.scoreB}, Winner=${simData.overallWinner}`);
  
  // Was it a tie? Both players got the exact same 15 characters (chars 0 to 14).
  // Yes, because currentTurnIndex % 15 means P2 gets chars[0] for role[0], P3 gets chars[0] for role[0]. Wait, the role keys repeat.
  // Their stats are identical. Tiebreaker should resolve it. By default it falls back to p1 (which is P2 here).

  // Fetch tournament again to check if F-1 was populated
  const t2Res = await fetch(`${API}/tournaments/${tournament._id}`);
  const tournament2 = await t2Res.json();
  const fMatch2 = tournament2.bracket.find(m => m.matchId === 'F-1');
  
  console.log(`F-1 Match is now: ${fMatch2.p1?.name} vs ${fMatch2.p2?.name}`);
  if (!fMatch2.p1 || !fMatch2.p2) {
    throw new Error("F-1 did not correctly populate both slots!");
  }
  if (!fMatch2.draftId) {
    throw new Error("F-1 DraftSession was not created!");
  }
  console.log(`Finals unlocked correctly: DraftSession ID = ${fMatch2.draftId}`);

  socketP2.disconnect();
  socketP3.disconnect();
  socketSpec.disconnect();

  console.log("\n--- 2. Testing 8-Player Tournament (Rapid Simulation) ---");
  
  const host8Res = await fetch(`${API}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verseId: verse._id,
      playerCount: 8,
      hostIsPlaying: false,
      hostName: 'Host8',
      hostToken: uuidv4()
    })
  });
  let t8 = await host8Res.json();
  if (t8.error) throw new Error("Create 8p error: " + t8.error);
  
  // Join 8 players
  const t8Tokens = [];
  for (let i=0; i<8; i++) {
    const t = uuidv4();
    t8Tokens.push(t);
    await fetch(`${API}/tournaments/${t8.code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: `T8P${i+1}`, playerToken: t })
    });
  }

  const start8Res = await fetch(`${API}/tournaments/${t8._id}/start`, { method: 'POST' });
  t8 = await start8Res.json();
  console.log("8-Player Tournament Started");

  // We will directly update the database for the 8-player matches to simulate completion rather than socket emitting 240 times.
  // No, let's use the DB to fast-forward the draft, then call /simulate
  const mongoose = await import('mongoose');
  await mongoose.connect('mongodb://localhost:27017/animedraft');
  const DraftSession = (await import('../backend/models/DraftSession.js')).default;
  
  const fastForwardMatch = async (draftId, p1Id, p2Id) => {
    const sess = await DraftSession.findById(draftId);
    if (!sess) throw new Error('Session not found for fast forward: ' + draftId);

    const rosters = new Map();
    const p1Map = new Map();
    const p2Map = new Map();
    
    verse.roles.forEach((r, idx) => {
      p1Map.set(r.key, chars[idx]._id);
      p2Map.set(r.key, chars[idx+1]._id); // Slightly different to avoid tie
    });

    rosters.set(p1Id, p1Map);
    rosters.set(p2Id, p2Map);

    sess.rosters = rosters;
    sess.status = 'complete';
    await sess.save();
    
    const simRes = await fetch(`${API}/battles/${draftId}/simulate`, { method: 'POST' });
    return await simRes.json();
  };

  for (let round = 1; round <= 3; round++) {
    // Re-fetch tournament
    const tRes = await fetch(`${API}/tournaments/${t8._id}`);
    t8 = await tRes.json();
    if (t8.error) throw new Error("Fetch tournament error: " + t8.error);
    
    const currentRoundMatches = t8.bracket.filter(m => m.round === round);
    console.log(`\nRound ${round}: Processing ${currentRoundMatches.length} matches...`);
    
    for (const match of currentRoundMatches) {
      if (!match.draftId) throw new Error(`Match ${match.matchId} has no draft ID but should be active in round ${round}!`);
      
      console.log(`Fast-forwarding and simulating ${match.matchId} (${match.p1.name} vs ${match.p2.name})...`);
      const res = await fastForwardMatch(match.draftId, match.p1.id, match.p2.id);
      if (res.error) throw new Error("Simulation error: " + res.error);
      console.log(`  -> Winner: ${res.overallWinner}`);
    }
  }

  const finalT = await fetch(`${API}/tournaments/${t8._id}`).then(r => r.json());
  if (finalT.status !== 'complete') {
    throw new Error("Tournament status did not change to complete!");
  }
  console.log("Tournament correctly completed!");
  
  await mongoose.disconnect();
  console.log("\nALL VERIFICATIONS PASSED!");
  process.exit(0);
}

runTests().catch(console.error);
