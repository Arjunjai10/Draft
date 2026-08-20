/**
 * Safely read a stat from a character object.
 * Handles: Mongoose Map (char.stats.get), plain object (char.stats[key]),
 * and undefined/null characters (returns 0).
 */
const getStat = (char, roleKey) => {
  if (!char || !char.stats) return 0;
  // Mongoose Map instance
  if (typeof char.stats.get === 'function') {
    return char.stats.get(roleKey) || 0;
  }
  // Plain object (after .lean() or JSON round-trip)
  return char.stats[roleKey] || 0;
};

export const simulateBattle = (rosterA, rosterB, roles, player1Id, player2Id) => {
  let scoreA = 0;
  let scoreB = 0;
  const rounds = [];

  // Iterate exactly in the order of the verse's roles
  roles.forEach(role => {
    const roleKey = role.key;
    const charA = rosterA[roleKey] || null;
    const charB = rosterB[roleKey] || null;

    const statA = getStat(charA, roleKey);
    const statB = getStat(charB, roleKey);

    let winner = 'tie';
    if (statA > statB) {
      winner = player1Id;
      scoreA += 1;
    } else if (statB > statA) {
      winner = player2Id;
      scoreB += 1;
    }

    rounds.push({
      role: roleKey,
      charA: charA || { name: 'Empty Slot', imageUrl: '', stats: {} },
      charB: charB || { name: 'Empty Slot', imageUrl: '', stats: {} },
      statA,
      statB,
      winner
    });
  });

  let overallWinner = 'tie';
  if (scoreA > scoreB) overallWinner = player1Id;
  else if (scoreB > scoreA) overallWinner = player2Id;
  else overallWinner = resolveTie(rosterA, rosterB, roles, player1Id, player2Id);

  return {
    scoreA,
    scoreB,
    overallWinner,
    rounds
  };
};

export const resolveTie = (rosterA, rosterB, roles, player1Id, player2Id) => {
  let totalStatA = 0;
  let totalStatB = 0;

  roles.forEach(role => {
    totalStatA += getStat(rosterA[role.key], role.key);
    totalStatB += getStat(rosterB[role.key], role.key);
  });

  if (totalStatA > totalStatB) return player1Id;
  if (totalStatB > totalStatA) return player2Id;

  // Astronomically unlikely perfect tie: default to p1 advancing
  return player1Id;
};
