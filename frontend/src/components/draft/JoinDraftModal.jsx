import React, { useState } from 'react';

export const JoinDraftModal = ({ isOpen, onJoin }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Join Draft</h2>
        <p className="text-gray-400 mb-6">You've been invited to an online draft! Enter your display name to join.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name (e.g. Player 2)" 
            className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:outline-none focus:border-blue-500"
            autoFocus
            required
          />
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-colors">
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};
