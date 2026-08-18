import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { BracketView } from '../components/BracketView';
import * as LucideIcons from 'lucide-react';

export const LiveBracket = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const myToken = localStorage.getItem(`tournament_${id}_token`);

  useEffect(() => {
    // Initial fetch
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Tournament not found');
        return res.json();
      })
      .then(data => {
        setTournament(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Socket connection for live updates
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('tournament:join', { tournamentId: id });
    });

    socket.on('tournament:bracketUpdate', (updatedTournament) => {
      setTournament(updatedTournament);
    });

    return () => socket.disconnect();
  }, [id]);

  const handleStart = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments/${id}/start`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setTournament(data);
        // The server will also broadcast this, but we update locally just in case
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading tournament...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold">{error}</div>;
  if (!tournament) return null;

  const hostToken = localStorage.getItem(`tournament_${id}_hostToken`);
  const amIFirstPlayer = tournament.players?.length > 0 && tournament.players[0].token === myToken;
  const isHost = tournament.hostId === myToken || tournament.hostId === hostToken || amIFirstPlayer;

  if (tournament.status === 'pending') {
    return (
      <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-8 bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-2xl w-full shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest mb-2">
                Tournament Lobby
              </h1>
              <p className="text-gray-400">Waiting for players to join...</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Invite Code</span>
              <div className="bg-gray-900 px-4 py-2 rounded border border-gray-700 font-mono text-3xl tracking-widest text-white shadow-inner">
                {tournament.code}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Players</h2>
              <span className="text-gray-400 font-mono text-lg">{tournament.players.length} / {tournament.playerCount}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: tournament.playerCount }).map((_, i) => {
                const p = tournament.players[i];
                return (
                  <div key={i} className={`flex items-center gap-3 p-4 rounded border ${p ? 'bg-gray-700 border-gray-600' : 'bg-gray-900 border-gray-800 border-dashed'} transition-all`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p ? 'bg-blue-600' : 'bg-gray-800'}`}>
                      {p ? <LucideIcons.User size={20} className="text-white" /> : <span className="text-gray-600 text-sm">{i+1}</span>}
                    </div>
                    {p ? (
                      <span className="text-white font-bold">{p.name} {p.token === myToken ? '(You)' : ''}</span>
                    ) : (
                      <span className="text-gray-600 italic">Waiting...</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isHost && (
            <button
              onClick={handleStart}
              disabled={tournament.players.length !== tournament.playerCount}
              className={`w-full py-4 rounded font-black uppercase tracking-widest text-lg transition-transform ${
                tournament.players.length === tournament.playerCount
                  ? 'bg-green-600 hover:bg-green-500 text-white hover:scale-[1.02] active:scale-95 cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {tournament.players.length === tournament.playerCount ? 'Start Tournament' : 'Waiting for full lobby...'}
            </button>
          )}
          {!isHost && (
            <div className="w-full py-4 text-center text-gray-400 font-bold uppercase tracking-widest border border-gray-700 rounded bg-gray-900">
              Waiting for Host to start...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-900">
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-10">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest">
          Tournament Bracket
        </h1>
        <div className="text-gray-400 font-mono tracking-widest text-sm">
          CODE: <span className="text-white bg-gray-800 px-2 py-1 rounded">{tournament.code}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <BracketView tournament={tournament} />
      </div>
    </div>
  );
};
