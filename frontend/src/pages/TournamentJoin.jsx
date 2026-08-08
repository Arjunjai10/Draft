import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export const TournamentJoin = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const playerToken = uuidv4();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          playerToken
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem(`tournament_${data._id}_token`, playerToken);
        // Find our assigned playerId
        const me = data.players.find(p => p.token === playerToken);
        if (me) {
          localStorage.setItem(`tournament_${data._id}_playerId`, me.id);
        }
        navigate(`/tournament/${data._id}`);
      } else {
        setError(data.error || 'Failed to join');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-6 text-center">Join Tournament</h2>
        
        {error && <div className="bg-red-500/20 text-red-400 border border-red-500/50 p-3 rounded mb-4 text-center font-bold">{error}</div>}

        <form onSubmit={handleJoin} className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Tournament Code</label>
            <input 
              type="text" 
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="6-CHAR CODE"
              maxLength={6}
              required
              className="w-full bg-gray-900 border border-gray-600 rounded p-4 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-purple-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Your Name</label>
            <input 
              type="text" 
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="e.g. Vegeta99"
              required
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 mt-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-black uppercase tracking-widest text-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            Enter Lobby
          </button>
        </form>
      </div>
    </div>
  );
};
