import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

export const TournamentLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center bg-gray-900 p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest mb-6">
          Tournament Mode
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto">
          Host or join a multi-player bracket. Settle debates and prove your drafting strategy against the world.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => navigate('/tournament/host')}
            className="flex flex-col items-center p-8 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600/40 transition-colors">
              <LucideIcons.Trophy size={32} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-2">Host Tournament</h2>
            <p className="text-gray-400 text-sm">Create a new bracket and invite your friends to compete.</p>
          </button>

          <button 
            onClick={() => navigate('/tournament/join')}
            className="flex flex-col items-center p-8 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600/40 transition-colors">
              <LucideIcons.Users size={32} className="text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-2">Join Tournament</h2>
            <p className="text-gray-400 text-sm">Enter a 6-character code to join an existing lobby.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
