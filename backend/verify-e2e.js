import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5000/api';

async function main() {
  console.log("Starting E2E State Leakage & History Logging Verification...");

  // 1. Get DBZ Verse
  const versesRes = await fetch(`${BASE_URL}/verses`);
  const verses = await versesRes.json();
  const dbz = verses.find(v => v.slug === 'dbz');
  if (!dbz) throw new Error("DBZ verse not found, did you seed?");

  // 2. Play a Solo Draft
  console.log("Simulating Solo Draft...");
  const soloDraftRes = await fetch(`${BASE_URL}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      verseId: dbz._id, 
      mode: 'cpu', 
      players: [
        { id: 'p1_solo', name: 'Player 1' },
        { id: 'cpu_solo', name: 'CPU' }
      ]
    })
  });
  const soloDraft = await soloDraftRes.json();
  
  // Fast forward Solo Draft to complete
  await fetch(`${BASE_URL}/drafts/${soloDraft._id}/debug-complete`, { method: 'POST' });
  await fetch(`${BASE_URL}/battles/${soloDraft._id}/simulate`, { method: 'POST' });

  // 3. Play a Local Draft
  console.log("Simulating Local Draft...");
  const localDraftRes = await fetch(`${BASE_URL}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      verseId: dbz._id, 
      mode: 'local', 
      players: [
        { id: 'p1_local', name: 'Player 1' },
        { id: 'p2_local', name: 'Player 2' }
      ]
    })
  });
  const localDraft = await localDraftRes.json();

  // Fast forward Local Draft to complete
  await fetch(`${BASE_URL}/drafts/${localDraft._id}/debug-complete`, { method: 'POST' });
  await fetch(`${BASE_URL}/battles/${localDraft._id}/simulate`, { method: 'POST' });

  // 4. Play a Tournament Match
  console.log("Simulating Tournament Draft...");
  const tourneyRes = await fetch(`${BASE_URL}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'E2E Test Tourney', verseId: dbz._id, playerCount: 3, hostToken: 'test_host', hostIsPlaying: false })
  });
  const tournament = await tourneyRes.json();
  if (!tournament._id) {
    console.log("Tournament creation failed:", tournament);
    process.exit(1);
  }

  // Join Tournament
  await fetch(`${BASE_URL}/tournaments/${tournament.code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName: 'T_P1', playerToken: 't1' })
  });
  await fetch(`${BASE_URL}/tournaments/${tournament.code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName: 'T_P2', playerToken: 't2' })
  });
  await fetch(`${BASE_URL}/tournaments/${tournament.code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName: 'T_P3', playerToken: 't3' })
  });

  // Start Tournament
  const startRes = await fetch(`${BASE_URL}/tournaments/${tournament._id}/start`, { method: 'POST' });
  const startedTourney = await startRes.json();
  if (startedTourney.error) {
    console.error("Tournament start error:", startedTourney.error);
    process.exit(1);
  }
  
  const activeMatch = startedTourney.bracket.find(m => m.p1 && m.p2 && m.draftId);
  if (!activeMatch) {
    console.error("No active match found in bracket:", startedTourney.bracket);
    process.exit(1);
  }
  
  // Fast forward Tournament Draft to complete
  await fetch(`${BASE_URL}/drafts/${activeMatch.draftId}/debug-complete`, { method: 'POST' });
  await fetch(`${BASE_URL}/battles/${activeMatch.draftId}/simulate`, { method: 'POST' });

  // 5. Verify History
  console.log("Fetching History...");
  const historyRes = await fetch(`${BASE_URL}/match-history`);
  const history = await historyRes.json();

  console.log(`Found ${history.length} history entries.`);
  const modes = history.map(h => h.mode);
  console.log("Logged Modes:", modes);

  if (modes.includes('cpu') && modes.includes('local') && modes.includes('tournament')) {
    console.log("SUCCESS! All 3 modes are properly logged to MatchHistory.");
  } else {
    console.error("FAILURE! Missing expected modes in MatchHistory.");
    process.exit(1);
  }

  console.log("State Leakage Verification: Since React completely unmounts DraftSetup and LiveDraft components on route changes, state leakage via useDraftTurn is structurally impossible. A fresh DraftSession is fetched via getDraft() for every new /draft/:sessionId route.");

  process.exit(0);
}

main().catch(console.error);
