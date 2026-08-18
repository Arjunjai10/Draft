import React from 'react';
import * as LucideIcons from 'lucide-react';

export const CharacterDrawModal = ({ character, onPass, passesRemaining, isCpuTurn, roles, openRoles, onAssign }) => {
  if (!character) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full shadow-[0_0_80px_rgba(234,179,8,0.15)] relative overflow-hidden">
        
        {/* Glow effect behind character */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* Top Tag */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-gray-300 font-bold text-xs uppercase tracking-widest">
            {isCpuTurn ? "CPU Drafting..." : "Your Draw"}
          </span>
        </div>
        
        <div className="relative z-10 text-center mt-6">
          
          <div className="w-48 h-48 mx-auto bg-gray-800 rounded-full mb-6 flex items-center justify-center overflow-hidden border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
            {character.imageUrl ? (
              <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 font-black text-6xl uppercase">
                {character.name.substring(0, 2)}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {character.tags.map(tag => (
              <span key={tag} className="px-4 py-1 bg-gray-800 border border-gray-600 rounded-full text-xs font-bold text-gray-300 uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-4xl font-black italic tracking-wide text-white mb-2 uppercase">{character.name}</h2>
          
          {/* Stats Bar Placeholder */}
          <div className="flex justify-center gap-6 mb-8 text-sm">
             <div className="flex items-center gap-1"><span className="text-gray-500 font-bold uppercase">PWR</span> <span className="text-yellow-500 font-black">95</span></div>
             <div className="flex items-center gap-1"><span className="text-gray-500 font-bold uppercase">SPD</span> <span className="text-yellow-500 font-black">92</span></div>
             <div className="flex items-center gap-1"><span className="text-gray-500 font-bold uppercase">IQ</span> <span className="text-yellow-500 font-black">88</span></div>
          </div>

          {!isCpuTurn ? (
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-2xl border border-gray-700">
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">Select Role to Draft</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                {roles?.map(role => {
                  const isOpen = openRoles?.includes(role.key);
                  return (
                    <button
                      key={role.key}
                      onClick={() => isOpen && onAssign(role.key)}
                      disabled={!isOpen}
                      className={`py-3 px-1 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all
                        ${isOpen 
                          ? 'bg-gray-700 hover:bg-yellow-500 text-white hover:text-gray-900 border border-gray-600 hover:border-yellow-400 shadow-md transform hover:scale-105' 
                          : 'bg-gray-900 border border-gray-800 text-gray-700 cursor-not-allowed opacity-50'}`}
                    >
                      {role.name || role.label}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={onPass}
                disabled={passesRemaining <= 0}
                className={`mx-auto px-8 py-3 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95
                  ${passesRemaining > 0 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
              >
                <LucideIcons.SkipForward size={18} />
                {passesRemaining > 0 ? `Pass (${passesRemaining} left)` : 'No Passes Left'}
              </button>
            </div>
          ) : (
             <div className="mt-12">
               <div className="inline-block border-2 border-gray-700 border-t-yellow-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
               <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">CPU is making a decision...</p>
             </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
