import React from 'react';

const RoleSlot = ({ role, character, isOpen, onClick }) => {
  if (isOpen) {
    return (
      <button 
        onClick={onClick}
        className="relative px-2 py-3 rounded-2xl flex items-center justify-center transition-colors bg-black/40 hover:bg-black/60 text-white shadow-inner"
      >
        <span className="text-xs font-medium tracking-wider">{role.name || role.label}</span>
      </button>
    );
  }

  // Filled State
  return (
    <div className="relative p-3 rounded-2xl flex flex-col items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 shadow-lg h-32 text-center transition-all">
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 mb-2 bg-gray-800 shadow-md flex-shrink-0">
        {character?.imageUrl ? (
          <img src={character.imageUrl} alt={character?.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">IMG</div>
        )}
      </div>
      <p className="text-sm font-bold text-white leading-tight mb-0.5 line-clamp-1 w-full px-1">{character?.name}</p>
      <p className="text-[10px] text-gray-400 italic w-full px-1 truncate">{role.name || role.label}</p>
    </div>
  );
};

export const RoleGrid = ({ roles, roster, onSelectRole, isSelectable }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
