// backend/utils/bracketGenerator.js

/**
 * Shuffles an array in place using Fisher-Yates.
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a bracket structure for 3, 4, or 8 players.
 * Returns an array of matches.
 */
export function generateBracket(players, count) {
  const shuffled = shuffle(players);
  const bracket = [];

  if (count === 8) {
    // Quarterfinals
    for (let i = 0; i < 4; i++) {
      bracket.push({
        matchId: `QF-${i + 1}`,
        nextMatchId: `SF-${Math.floor(i / 2) + 1}`,
        round: 1,
        p1: shuffled[i * 2] || null,
        p2: shuffled[i * 2 + 1] || null
      });
    }
    // Semifinals
    for (let i = 0; i < 2; i++) {
      bracket.push({
        matchId: `SF-${i + 1}`,
        nextMatchId: `F-1`,
        round: 2,
        p1: null,
        p2: null
      });
    }
    // Final
    bracket.push({
      matchId: `F-1`,
      nextMatchId: null,
      round: 3,
      p1: null,
      p2: null
    });
  } else if (count === 4) {
    // Semifinals
    for (let i = 0; i < 2; i++) {
      bracket.push({
        matchId: `SF-${i + 1}`,
        nextMatchId: `F-1`,
        round: 1,
        p1: shuffled[i * 2] || null,
        p2: shuffled[i * 2 + 1] || null
      });
    }
    // Final
    bracket.push({
      matchId: `F-1`,
      nextMatchId: null,
      round: 2,
      p1: null,
      p2: null
    });
  } else if (count === 3) {
    // Player 0 gets bye (placed into F-1)
    // Players 1 and 2 play in SF-1
    const pBye = shuffled[0];
    const pB = shuffled[1];
    const pC = shuffled[2];

    bracket.push({
      matchId: `SF-1`,
      nextMatchId: `F-1`,
      round: 1,
      p1: pB,
      p2: pC
    });

    bracket.push({
      matchId: `F-1`,
      nextMatchId: null,
      round: 2,
      p1: pBye,
      p2: null // Waiting for winner of SF-1
    });
  } else {
    throw new Error('Unsupported player count for bracket generation');
  }

  return bracket;
}
