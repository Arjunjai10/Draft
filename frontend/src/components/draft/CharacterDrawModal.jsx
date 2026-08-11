import React from 'react';
import * as LucideIcons from 'lucide-react';

export const CharacterDrawModal = ({ character, onPass, passesRemaining, isCpuTurn, roles, openRoles, onAssign }) => {
  if (!character) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-block bg-orange-600 text-white px-3 py-1 rounded-t-lg font-bold text-sm tracking-wider uppercase mb-[-1px]">
            {isCpuTurn ? "CPU's Turn" : "Your Turn"}
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-inner">
            
            <div className="w-32 h-32 mx-auto bg-gray-900 rounded-full mb-4 border-4 border-orange-500 flex items-center justify-center text-gray-500 overflow-hidden relative shadow-lg">
              {character.imageUrl ? (
                <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-black text-4xl uppercase">
                  {character.name.substring(0, 2)}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {character.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-full text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="text-3xl font-black text-white mb-2">{character.name}</h2>
            <p className="text-gray-400 text-sm mb-6">
              {isCpuTurn ? "CPU is choosing a role..." : `Select a role for ${character.name}`}
            </p>

            {!isCpuTurn && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {roles?.map(role => {
                  const isOpen = openRoles?.includes(role.key);
                  return (
                    <button
                      key={role.key}
                      onClick={() => isOpen && onAssign(role.key)}
                      disabled={!isOpen}
                      className={`py-2 px-1 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors
                        ${isOpen 
                          ? 'bg-gray-800 border border-orange-500/50 hover:bg-gray-700 text-orange-400 hover:text-orange-300' 
                          : 'bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed'}`}
                    >
                      {role.name}
                    </button>
                  );
                })}
              </div>
            )}

            {!isCpuTurn && (
              <button 
                onClick={onPass}
                disabled={passesRemaining <= 0}
                className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors
                  ${passesRemaining > 0 
                    ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
              >
                <LucideIcons.RefreshCw size={18} />
                {passesRemaining > 0 ? `Pass (${passesRemaining} left)` : 'No Passes Left'}
              </button>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};
