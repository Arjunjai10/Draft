import React from 'react';
import * as LucideIcons from 'lucide-react';

export const CharacterDrawModal = ({ character, onPass, passesRemaining, isCpuTurn }) => {
  if (!character) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-3xl rounded-full"></div>
        
        <div className="relative z-10 text-center">
          <h3 className="text-xl font-bold text-gray-100 uppercase tracking-widest mb-1">New Draw</h3>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            {character.name}
          </h2>
          
          <div className="w-32 h-32 bg-gray-800 rounded-lg mx-auto mb-4 border-2 border-gray-700 flex items-center justify-center shadow-inner">
             <span className="text-gray-500 font-bold">PORTRAIT</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {character.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-semibold text-gray-300 uppercase">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-gray-400 text-sm mb-6">
            {isCpuTurn ? "CPU is choosing a role..." : "Select an open role slot on the board to assign."}
          </p>
          
          {!isCpuTurn && (
            <button 
              onClick={onPass}
              disabled={passesRemaining <= 0}
              className={`w-full py-3 rounded-md font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors
                ${passesRemaining > 0 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600' 
                  : 'bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed'}`}
            >
              <LucideIcons.RefreshCw size={18} />
              {passesRemaining > 0 ? `Pass & Redraw (${passesRemaining} left)` : 'No Passes Left'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
