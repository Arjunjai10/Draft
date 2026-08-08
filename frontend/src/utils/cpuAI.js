export const pickBestRoleForCharacter = (character, openRoles) => {
  let bestRole = null;
  let maxStat = -1;
  openRoles.forEach(roleKey => {
    const statValue = character.stats[roleKey] || 0;
    if (statValue > maxStat) {
      maxStat = statValue;
      bestRole = roleKey;
    }
  });
  return bestRole || openRoles[0];
};
