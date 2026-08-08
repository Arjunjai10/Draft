import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchVerses } from '../api/verses';
import { v4 as uuidv4 } from 'uuid';

export const TournamentHost = () => {
  const navigate = useNavigate();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [verseId, setVerseId] = useState('');
  const [playerCount, setPlayerCount] = useState(8);
  const [hostMode, setHostMode] = useState('play'); // 'play' or 'spectate'
  const [hostName, setHostName] = useState('');

  useEffect(() => {
    fetchVerses().then(data => {
      setVerses(data);
      if (data.length > 0) setVerseId(data[0]._id);
      setLoading(false);
    });
  }, []);

  const handleHost = async (e) => {
    e.preventDefault();
    try {
      const hostToken = uuidv4();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseId,
          playerCount,
          rolesCount: 15,
          passesPerPlayer: 10,
          hostIsPlaying: hostMode === 'play',
          hostName: hostMode === 'play' ? hostName : 'Host',
          hostToken
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem(`tournament_${data._id}_token`, hostToken);
        if (hostMode === 'play') {
          localStorage.setItem(`tournament_${data._id}_playerId`, 'p1');
        }
        navigate(`/tournament/${data._id}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-6 text-center">Host Tournament</h2>
        
        <form onSubmit={handleHost} className="flex flex-col gap-6">
          
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Select Verse</label>
            <select 
              value={verseId} 
              onChange={e => setVerseId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-blue-500"
            >
              {verses.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Bracket Size</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 8].map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setPlayerCount(size)}
                  className={`py-2 rounded font-bold transition-colors ${playerCount === size ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {size} Players
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Host Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHostMode('play')}
                className={`py-2 px-4 rounded font-bold transition-colors ${hostMode === 'play' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Play & Host
              </button>
              <button
                type="button"
                onClick={() => setHostMode('spectate')}
                className={`py-2 px-4 rounded font-bold transition-colors ${hostMode === 'spectate' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Spectate Only
              </button>
            </div>
          </div>

          {hostMode === 'play' && (
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Your Name</label>
              <input 
                type="text" 
                value={hostName}
                onChange={e => setHostName(e.target.value)}
                placeholder="e.g. GokuFan99"
                required
                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 mt-4 bg-green-600 hover:bg-green-500 text-white rounded font-black uppercase tracking-widest text-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            Create Lobby
          </button>
        </form>
      </div>
    </div>
  );
};
