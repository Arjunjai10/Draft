const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const createDraft = async (draftData) => {
  const res = await fetch(`${API_URL}/api/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draftData)
  });
  if (!res.ok) throw new Error('Failed to create draft');
  return res.json();
};

export const getDraft = async (id) => {
  const res = await fetch(`${API_URL}/api/drafts/${id}`);
  if (!res.ok) throw new Error('Failed to get draft');
  return res.json();
};
