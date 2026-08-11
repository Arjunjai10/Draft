const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getHistory = async () => {
  const response = await fetch(`${API_URL}/api/match-history`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};
