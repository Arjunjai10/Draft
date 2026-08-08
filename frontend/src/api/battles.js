const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const simulateBattle = async (draftId) => {
  const res = await fetch(`${API_URL}/api/battles/${draftId}/simulate`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to simulate battle');
  return res.json();
};

export const getBattleResult = async (draftId) => {
  const res = await fetch(`${API_URL}/api/battles/${draftId}`);
  if (!res.ok) throw new Error('Failed to get battle result');
  return res.json();
};
