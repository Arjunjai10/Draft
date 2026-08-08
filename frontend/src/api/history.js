const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getHistory = async () => {
  const response = await fetch(`${API_URL}/history`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
};
