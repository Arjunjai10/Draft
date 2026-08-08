import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { getHistory } from '../../api/history';

export const HistoryModal = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getHistory()
        .then(setHistory)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full shadow-2xl relative flex flex-col h-[70vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <LucideIcons.X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <LucideIcons.History className="text-blue-500" size={28} />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Recent Games</h2>
        </div>
        
        <div className="flex-1 overflow-auto pr-2">
          {loading && <p className="text-gray-400 text-center mt-10">Loading history...</p>}
          {error && <p className="text-red-400 text-center mt-10">{error}</p>}
          {!loading && !error && history.length === 0 && (
            <p className="text-gray-500 text-center mt-10">No recent games found.</p>
          )}

          {!loading && !error && history.map((match) => (
            <div key={match._id} className="bg-gray-800 rounded p-4 mb-4 border border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-white mb-1">
                  Player 1 vs {match.opponentName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="uppercase tracking-widest text-xs font-bold bg-gray-700 px-2 py-1 rounded">
                    {match.verseId?.name || 'Unknown Verse'}
                  </span>
                  <span>•</span>
                  <span>{match.mode}</span>
                  <span>•</span>
                  <span>{new Date(match.playedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xl font-black uppercase tracking-widest mb-1 
                  ${match.result === 'player1' ? 'text-blue-400' : match.result === 'player2' ? 'text-red-400' : 'text-gray-400'}`}>
                  {match.result === 'tie' ? 'Tie' : match.result === 'player1' ? 'Player 1 Wins' : `${match.opponentName} Wins`}
                </div>
                <div className="text-gray-400 font-mono font-bold">
                  {match.score.p1} - {match.score.p2}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
