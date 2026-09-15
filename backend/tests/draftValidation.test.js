/**
 * draftValidation.test.js
 *
 * Unit tests for the pure guard functions in utils/draftValidation.js.
 * Run with:   node --test backend/tests/draftValidation.test.js
 * Requires Node ≥ 18 (built-in test runner).
 *
 * No database, no socket, no external dependencies.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCharacterTaken,
  isRoleTaken,
  isPlayersTurn,
  advanceTurn
} from '../utils/draftValidation.js';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build a Mongoose-Map-compatible Map of Maps from a plain object. */
function makeRosters(obj) {
  // obj: { playerId: { roleKey: charId } }
  const rosters = new Map();
  for (const [pid, roster] of Object.entries(obj)) {
    const rosterMap = new Map(Object.entries(roster));
    rosters.set(pid, rosterMap);
  }
  return rosters;
}

function makeSession(overrides = {}) {
  return {
    turnOrder:         ['p1', 'p2', 'p1', 'p2'],
    currentTurnIndex:  0,
    status:            'drafting',
    ...overrides
  };
}

// ─── isCharacterTaken ────────────────────────────────────────────────────────

test('isCharacterTaken: returns false when rosters are empty', () => {
  const rosters = makeRosters({ p1: {}, p2: {} });
  assert.equal(isCharacterTaken(rosters, 'char-abc'), false);
});

test('isCharacterTaken: returns false when char is in no roster', () => {
  const rosters = makeRosters({ p1: { top: 'char-001' }, p2: { top: 'char-002' } });
  assert.equal(isCharacterTaken(rosters, 'char-999'), false);
});

test('isCharacterTaken: returns true when char is in player1 roster', () => {
  const rosters = makeRosters({ p1: { top: 'char-001' }, p2: {} });
  assert.equal(isCharacterTaken(rosters, 'char-001'), true);
});

test('isCharacterTaken: returns true when char is in player2 roster (cross-player check)', () => {
  // This is the S1 exploit: a cheating client tries to pick a char the opponent holds.
  const rosters = makeRosters({ p1: {}, p2: { mid: 'char-123' } });
  assert.equal(isCharacterTaken(rosters, 'char-123'), true);
});

// ─── isRoleTaken ─────────────────────────────────────────────────────────────

test('isRoleTaken: returns false when player has no roster yet', () => {
  const rosters = makeRosters({ p1: {}, p2: {} });
  assert.equal(isRoleTaken(rosters, 'p1', 'top'), false);
});

test('isRoleTaken: returns false when role is empty for target player', () => {
  const rosters = makeRosters({ p1: { mid: 'char-A' }, p2: {} });
  assert.equal(isRoleTaken(rosters, 'p1', 'top'), false);
});

test('isRoleTaken: returns true when role is already filled for target player', () => {
  // S2 exploit: client tries to overwrite an already-assigned role.
  const rosters = makeRosters({ p1: { top: 'char-A' }, p2: {} });
  assert.equal(isRoleTaken(rosters, 'p1', 'top'), true);
});

test('isRoleTaken: role filled for p1 does NOT block the same role key for p2', () => {
  // Both players fill the same set of role keys independently.
  // If we checked cross-player, p2 could never fill "top" after p1 did.
  const rosters = makeRosters({ p1: { top: 'char-A' }, p2: {} });
  assert.equal(isRoleTaken(rosters, 'p2', 'top'), false);
});

// ─── isPlayersTurn ───────────────────────────────────────────────────────────

test('isPlayersTurn: returns true when it is the player\'s turn', () => {
  const session = makeSession({ turnOrder: ['p1', 'p2'], currentTurnIndex: 0 });
  assert.equal(isPlayersTurn(session, 'p1'), true);
});

test('isPlayersTurn: returns false when it is NOT the player\'s turn', () => {
  const session = makeSession({ turnOrder: ['p1', 'p2'], currentTurnIndex: 0 });
  assert.equal(isPlayersTurn(session, 'p2'), false);
});

test('isPlayersTurn: correctly reads from currentTurnIndex', () => {
  const session = makeSession({ turnOrder: ['p1', 'p2', 'p1', 'p2'], currentTurnIndex: 1 });
  assert.equal(isPlayersTurn(session, 'p2'), true);
  assert.equal(isPlayersTurn(session, 'p1'), false);
});

// ─── advanceTurn ─────────────────────────────────────────────────────────────

test('advanceTurn: increments index when not at end', () => {
  const session = makeSession({ turnOrder: ['p1', 'p2', 'p1', 'p2'], currentTurnIndex: 0, status: 'drafting' });
  const result = advanceTurn(session);
  assert.equal(result.currentTurnIndex, 1);
  assert.equal(result.status, 'drafting');
});

test('advanceTurn: sets status=complete on the last turn (does not overflow)', () => {
  // C2: previously `currentTurnIndex++` was unbounded — it would go to index 4
  // on a 4-entry turnOrder, making turnOrder[4] === undefined, silently
  // passing the isPlayersTurn guard and leaving the session in an inconsistent state.
  const session = makeSession({ turnOrder: ['p1', 'p2', 'p1', 'p2'], currentTurnIndex: 3, status: 'drafting' });
  const result = advanceTurn(session);
  assert.equal(result.status, 'complete');
  // Index is NOT incremented past the final position
  assert.equal(result.currentTurnIndex, 3);
});

test('advanceTurn: does not mutate the session object', () => {
  const session = makeSession({ turnOrder: ['p1', 'p2'], currentTurnIndex: 0, status: 'drafting' });
  advanceTurn(session);
  // Caller is responsible for applying the returned values
  assert.equal(session.currentTurnIndex, 0);
  assert.equal(session.status, 'drafting');
});

// ─── Combined: out-of-turn pick scenario ────────────────────────────────────

test('Server rejects out-of-turn pick: isPlayersTurn returns false for wrong player', () => {
  // Simulates what the draft:pick socket handler does before writing anything.
  const session = makeSession({ turnOrder: ['p1', 'p2'], currentTurnIndex: 0 });
  // p2 tries to pick on p1's turn
  const rejected = !isPlayersTurn(session, 'p2');
  assert.equal(rejected, true, 'Out-of-turn pick should be rejected');
});

test('Server rejects duplicate character pick across both players', () => {
  // p1 already has char-777; p2 tries to pick the same one.
  const rosters = makeRosters({ p1: { top: 'char-777' }, p2: {} });
  const rejected = isCharacterTaken(rosters, 'char-777');
  assert.equal(rejected, true, 'Duplicate character pick should be rejected');
});

test('Server rejects overwriting an already-filled role', () => {
  // p1 already filled "top"; they try to pick again into "top".
  const rosters = makeRosters({ p1: { top: 'char-A' }, p2: {} });
  const rejected = isRoleTaken(rosters, 'p1', 'top');
  assert.equal(rejected, true, 'Overwriting a filled role should be rejected');
});

console.log('Run: node --test backend/tests/draftValidation.test.js');
