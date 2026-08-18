import React from 'react';

const RoleSlot = ({ role, character, isOpen, onClick }) => {
  if (isOpen) {
    return (
      <button 
        onClick={onClick}
        className="relative px-2 py-4 rounded-xl flex flex-col items-center justify-center transition-all bg-gray-900 bg-opacity-60 border border-gray-700 hover:border-yellow-500 hover:bg-opacity-80 text-gray-400 hover:text-white shadow-inner group"
      >
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
           <span className="text-gray-500 text-xs">+</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-center px-1">{role.name || role.label}</span>
      </button>
    );
  }

  // Filled State
  return (
    <div className="relative p-2 rounded-xl flex flex-col items-center justify-center bg-gray-800 bg-opacity-90 backdrop-blur-md border border-gray-600 shadow-[0_0_15px_rgba(0,0,0,0.5)] h-32 text-center transition-all overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-80 z-0"></div>
      
      <div className="relative z-10 w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-500 mb-1 bg-gray-900 shadow-md flex-shrink-0">
        {character?.imageUrl ? (
          <img src={character.imageUrl} alt={character?.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold uppercase bg-gray-700">
            {character?.name?.substring(0, 2) || '???'}
          </div>
        )}
      </div>
      <p className="relative z-10 text-[11px] font-black uppercase text-white leading-tight mb-0.5 line-clamp-1 w-full px-1 drop-shadow-md">{character?.name}</p>
      <p className="relative z-10 text-[9px] font-bold text-yellow-500 uppercase tracking-wider w-full px-1 truncate">{role.name || role.label}</p>
    </div>
  );
};

export const RoleGrid = ({ roles, roster, onSelectRole, isSelectable }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {roles.map(role => {
        const charId = roster[role.key];
        const character = charId; 
        const isOpen = !character;
        
        return (
          <RoleSlot 
            key={role.key} 
            role={role} 
            character={character} 
            isOpen={isOpen}
            onClick={() => isSelectable && isOpen && onSelectRole(role.key)}
          />
        );
      })}
    </div>
  );
};
