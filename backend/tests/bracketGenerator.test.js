import assert from 'assert';
import { generateBracket } from '../utils/bracketGenerator.js';

console.log("Running bracketGenerator tests...");

// Test 8-player bracket
{
  const players = [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({ id: `p${i}`, name: `Player ${i}` }));
  const bracket = generateBracket(players, 8);
  
  assert.strictEqual(bracket.length, 7, "8 players should produce 7 matches");
  
  const qfMatches = bracket.filter(m => m.round === 1);
  assert.strictEqual(qfMatches.length, 4, "Should have 4 Quarterfinal matches");
  qfMatches.forEach(m => {
    assert.ok(m.p1, "QF match p1 must exist");
    assert.ok(m.p2, "QF match p2 must exist");
    assert.match(m.nextMatchId, /^SF-\d$/, "QF must point to SF");
  });

  const sfMatches = bracket.filter(m => m.round === 2);
  assert.strictEqual(sfMatches.length, 2, "Should have 2 Semifinal matches");
  sfMatches.forEach(m => {
    assert.strictEqual(m.p1, null, "SF match p1 must be null initially");
    assert.strictEqual(m.p2, null, "SF match p2 must be null initially");
    assert.strictEqual(m.nextMatchId, 'F-1', "SF must point to F-1");
  });

  const fMatch = bracket.find(m => m.matchId === 'F-1');
  assert.strictEqual(fMatch.nextMatchId, null, "Final must point to null");
  assert.strictEqual(fMatch.p1, null, "Final p1 must be null initially");
  assert.strictEqual(fMatch.p2, null, "Final p2 must be null initially");
  console.log("8-player test passed");
}

// Test 4-player bracket
{
  const players = [1, 2, 3, 4].map(i => ({ id: `p${i}`, name: `Player ${i}` }));
  const bracket = generateBracket(players, 4);

  assert.strictEqual(bracket.length, 3, "4 players should produce 3 matches");

  const sfMatches = bracket.filter(m => m.round === 1);
  assert.strictEqual(sfMatches.length, 2, "Should have 2 Semifinal matches");
  sfMatches.forEach(m => {
    assert.ok(m.p1, "SF match p1 must exist");
    assert.ok(m.p2, "SF match p2 must exist");
    assert.strictEqual(m.nextMatchId, 'F-1', "SF must point to F-1");
  });

  const fMatch = bracket.find(m => m.matchId === 'F-1');
  assert.strictEqual(fMatch.nextMatchId, null, "Final must point to null");
  console.log("4-player test passed");
}

// Test 3-player bracket with bye logic
{
  const players = [1, 2, 3].map(i => ({ id: `p${i}`, name: `Player ${i}` }));
  const bracket = generateBracket(players, 3);

  assert.strictEqual(bracket.length, 2, "3 players should produce 2 matches");

  const sfMatch = bracket.find(m => m.matchId === 'SF-1');
  assert.strictEqual(sfMatch.round, 1, "SF-1 should be round 1");
  assert.ok(sfMatch.p1, "SF-1 p1 must exist");
  assert.ok(sfMatch.p2, "SF-1 p2 must exist");
  assert.strictEqual(sfMatch.nextMatchId, 'F-1', "SF-1 must point to F-1");

  const fMatch = bracket.find(m => m.matchId === 'F-1');
  assert.strictEqual(fMatch.round, 2, "F-1 should be round 2");
  assert.ok(fMatch.p1, "F-1 p1 must exist (the bye player)");
  assert.strictEqual(fMatch.p2, null, "F-1 p2 must be null (waiting for SF winner)");
  assert.strictEqual(fMatch.nextMatchId, null, "F-1 must point to null");

  const allAssignedPlayers = [sfMatch.p1.id, sfMatch.p2.id, fMatch.p1.id].sort();
  assert.deepStrictEqual(allAssignedPlayers, ['p1', 'p2', 'p3'], "All 3 players must be assigned somewhere");
  console.log("3-player test passed");
}

console.log("All bracketGenerator tests passed!");
