const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getVerse = async (slug) => {
  const res = await fetch(`${API_URL}/api/verses/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch verse');
  return res.json();
};

export const getVerseCharacters = async (slug) => {
  const res = await fetch(`${API_URL}/api/verses/${slug}/characters`);
  if (!res.ok) throw new Error('Failed to fetch characters');
  return res.json();
};
