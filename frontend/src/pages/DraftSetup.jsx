import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVerseBySlug } from '../api/verses';
import { createDraft } from '../api/drafts';

export const DraftSetup = () => {
  const { verseSlug } = useParams();
  const navigate = useNavigate();
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchVerseBySlug(verseSlug)
      .then(setVerse)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [verseSlug]);

  const handleStartSolo = async () => {
    try {
      const draft = await createDraft({
        verseId: verse._id,
        mode: 'cpu',
        players: [
          { id: 'player1', name: 'Player 1' },
          { id: 'cpu1', name: 'CPU', isCPU: true, cpuDifficulty: 'medium' }
        ],
        passes: 10
      });
      localStorage.setItem(`draft_${draft._id}_playerId`, 'player1');
      navigate(`/draft/${verseSlug}/play?session=${draft._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartLocal = async () => {
    try {
      const draft = await createDraft({
        verseId: verse._id,
        mode: 'local',
        players: [
          { id: 'player1', name: 'Player 1' },
          { id: 'player2', name: 'Player 2' }
        ],
        passes: 10
      });
      localStorage.setItem(`draft_${draft._id}_playerId`, 'player1'); // For local, the browser is effectively player 1 (and 2)
      navigate(`/draft/${verseSlug}/play?session=${draft._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartOnline = async () => {
    try {
      const draft = await createDraft({
        verseId: verse._id,
        mode: 'online',
        players: [
          { id: 'player1', name: 'Player 1' } // Player 2 joins via link
        ],
        passes: 10
      });
      localStorage.setItem(`draft_${draft._id}_playerId`, 'player1');
      navigate(`/draft/${verseSlug}/play?session=${draft._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading verse...</div>;
  if (!verse) return <div className="p-8 text-center text-red-500">Verse not found</div>;

  return (
    <div className="max-w-md mx-auto mt-20 bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 text-center">
      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 uppercase tracking-widest">
        {verse.name}
      </h2>
      <p className="text-gray-400 mb-8">Draft Settings</p>
      
      <div className="flex flex-col gap-4 mb-6">
        <button 
          onClick={handleStartSolo}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold uppercase tracking-widest transition-colors"
        >
          Start Solo Draft (vs CPU)
        </button>

        <button 
          onClick={handleStartLocal}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-bold uppercase tracking-widest transition-colors"
        >
          Start Local Draft (Pass & Play)
        </button>

        <button 
          onClick={handleStartOnline}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-bold uppercase tracking-widest transition-colors"
        >
          Play Online (Draft vs a Friend)
        </button>
      </div>
      
      <p className="text-sm text-gray-500">Passes: 10 per player</p>
    </div>
  );
};
