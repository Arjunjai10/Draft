import React from 'react';
import * as LucideIcons from 'lucide-react';

const RoleSlot = ({ role, character, isOpen, onClick }) => {
  const Icon = LucideIcons[role.icon] || LucideIcons.Circle;
  
  return (
    <div 
      onClick={isOpen ? onClick : undefined}
      className={`relative p-2 border-2 rounded-md flex items-center justify-between h-16 transition-colors
        ${isOpen 
          ? 'border-dashed border-gray-600 hover:border-blue-500 cursor-pointer bg-gray-800/50' 
          : 'border-solid border-gray-700 bg-gray-800'}`}
    >
      <div className="flex items-center gap-3 w-full">
        <div className={`p-2 rounded-full ${isOpen ? 'bg-gray-700' : 'bg-blue-900/50'}`}>
          <Icon size={20} className={isOpen ? 'text-gray-400' : 'text-blue-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider truncate">{role.label}</p>
          {character ? (
            <p className="text-sm font-semibold text-gray-100 truncate">{character.name}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">Empty</p>
          )}
        </div>
        {character && (
          <div className="w-10 h-10 bg-gray-700 rounded-md shrink-0 flex items-center justify-center overflow-hidden border border-gray-600">
            {/* Placeholder portrait */}
            <span className="text-xs font-bold text-gray-400">IMG</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const RoleGrid = ({ roles, roster, onSelectRole, isSelectable }) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {roles.map(role => {
        const charId = roster[role.key];
        // We need to pass the actual character object here, so let's assume roster is now a map of roleKey -> Character Object for UI purposes
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
