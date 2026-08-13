import React from 'react';

export const CharacterDrawModal = ({ character, onPass, passesRemaining, isCpuTurn, roles, openRoles, onAssign }) => {
  if (!character) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/60 border border-white/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative backdrop-blur-md">
        
        {/* Top Tag */}
        <div className="absolute -top-3 left-6 bg-red-600 text-white px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg">
          {isCpuTurn ? "CPU's Turn" : "Your Turn"}
        </div>
        
        <div className="text-center mt-2">
          
          <div className="w-36 h-36 mx-auto bg-sky-200 rounded-full mb-6 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)]">
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
              <span key={tag} className="px-3 py-0.5 border border-red-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">{character.name}</h2>
          <p className="text-gray-400 text-xs mb-6">
            {isCpuTurn ? "CPU is choosing a role..." : `Select a role for ${character.name}`}
          </p>

          {!isCpuTurn && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {roles?.map(role => {
                const isOpen = openRoles?.includes(role.key);
                return (
                  <button
                    key={role.key}
                    onClick={() => isOpen && onAssign(role.key)}
                    disabled={!isOpen}
                    className={`py-2 px-1 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors
                      ${isOpen 
                        ? 'bg-black/40 border border-red-500 hover:bg-red-500/30 text-white shadow-inner' 
                        : 'bg-black/20 border border-gray-800 text-gray-700 cursor-not-allowed'}`}
                  >
                    {role.name || role.label}
                  </button>
                );
              })}
            </div>
          )}

          {!isCpuTurn && (
            <button 
              onClick={onPass}
              disabled={passesRemaining <= 0}
              className={`mx-auto px-8 py-2 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95
                ${passesRemaining > 0 
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg' 
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
            >
              <span>⏩</span>
              {passesRemaining > 0 ? `Pass (${passesRemaining} left)` : 'No Passes Left'}
            </button>
          )}
          
        </div>
      </div>
    </div>
  );
};
