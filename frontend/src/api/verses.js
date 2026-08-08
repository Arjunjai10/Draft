const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/verses` : 'http://localhost:5000/api/verses';

export const fetchVerses = async (sort = 'new', search = '') => {
  const params = new URLSearchParams();
  if (sort) params.append('sort', sort);
  if (search) params.append('search', search);

  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch verses');
  return res.json();
};

export const fetchVerseBySlug = async (slug) => {
  const res = await fetch(`${API_URL}/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch verse');
  return res.json();
};

export const fetchCharacters = async (slug) => {
  const res = await fetch(`${API_URL}/${slug}/characters`);
  if (!res.ok) throw new Error('Failed to fetch characters');
  return res.json();
};

export const publishVerse = async (payload) => {
  const res = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to publish verse');
  }
  return res.json();
};
