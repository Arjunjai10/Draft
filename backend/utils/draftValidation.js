/**
 * draftValidation.js
 * Pure guard functions for draft pick/pass integrity.
 * All functions take plain data (no Mongoose methods needed) so they
 * are trivially testable without a database.
 */

/**
 * Returns true if `charIdStr` is already assigned in ANY player's roster.
 * Rosters is a Mongoose Map<playerId, Map<roleKey, charId>> — use the
 * iterable form so both Mongoose Maps and plain Maps work.
 *
 * @param {Map} rosters  - session.rosters (Mongoose Map)
 * @param {string} charIdStr - characterId.toString()
 */
export function isCharacterTaken(rosters, charIdStr) {
  for (const rosterMap of rosters.values()) {
    for (const v of rosterMap.values()) {
      if (v?.toString() === charIdStr) return true;
    }
  }
  return false;
}

/**
 * Returns true if `roleKey` is already filled in the given player's roster.
 *
 * @param {Map} rosters
 * @param {string} playerId
 * @param {string} roleKey
 */
export function isRoleTaken(rosters, playerId, roleKey) {
  const rosterMap = rosters.get(playerId);
  if (!rosterMap) return false;
  return rosterMap.has(roleKey);
}

/**
 * Returns true when it is `playerId`'s turn according to the session.
 *
 * @param {{ turnOrder: string[], currentTurnIndex: number }} session
 * @param {string} playerId
 */
export function isPlayersTurn(session, playerId) {
  return session.turnOrder[session.currentTurnIndex] === playerId;
}

/**
 * Advance turn or mark complete.
 * Returns an object with the updated `currentTurnIndex` and `status`.
 * Does NOT mutate the session — caller applies the returned values.
 *
 * @param {{ turnOrder: string[], currentTurnIndex: number, status: string }} session
 */
export function advanceTurn(session) {
  if (session.currentTurnIndex + 1 >= session.turnOrder.length) {
    return { currentTurnIndex: session.currentTurnIndex, status: 'complete' };
  }
  return { currentTurnIndex: session.currentTurnIndex + 1, status: session.status };
}
