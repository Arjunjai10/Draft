export const simulateBattle = (rosterA, rosterB, roles, player1Id, player2Id) => {
  let scoreA = 0;
  let scoreB = 0;
  const rounds = [];

  // Iterate exactly in the order of the verse's roles
  roles.forEach(role => {
    const roleKey = role.key;
    const charA = rosterA[roleKey];
    const charB = rosterB[roleKey];
    
    // In case someone didn't draft (should be enforced, but fallback to 0)
    const statA = charA ? (charA.stats[roleKey] || 0) : 0;
    const statB = charB ? (charB.stats[roleKey] || 0) : 0;

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
      charA,
      charB,
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
    const roleKey = role.key;
    const charA = rosterA[roleKey];
    const charB = rosterB[roleKey];
    
    totalStatA += charA ? (charA.stats[roleKey] || 0) : 0;
    totalStatB += charB ? (charB.stats[roleKey] || 0) : 0;
  });

  if (totalStatA > totalStatB) return player1Id;
  if (totalStatB > totalStatA) return player2Id;
  
  // Astronomically unlikely fallback: default to p1 advancing
  return player1Id;
};
