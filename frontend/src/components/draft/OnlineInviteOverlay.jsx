import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

export const OnlineInviteOverlay = () => {
  const [copied, setCopied] = useState(false);
  const inviteLink = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg max-w-md w-full shadow-2xl text-center">
        <LucideIcons.Users size={48} className="mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Waiting for Player 2</h2>
        <p className="text-gray-400 mb-6">Share this link with a friend so they can join the draft.</p>
        
        <div className="flex bg-gray-800 rounded border border-gray-700 p-2 items-center mb-4">
          <input 
            type="text" 
            readOnly 
            value={inviteLink} 
            className="bg-transparent text-gray-300 w-full focus:outline-none text-sm px-2"
          />
          <button 
            onClick={handleCopy}
            className={`p-2 rounded transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
          >
            {copied ? <LucideIcons.Check size={20} /> : <LucideIcons.Copy size={20} />}
          </button>
        </div>
        
        {copied && <p className="text-green-400 text-sm font-bold">Link copied to clipboard!</p>}
      </div>
    </div>
  );
};
