import React from 'react';

export const DraftHUD = ({ currentPlayer, passesRemaining, isComplete, onSimulate, onHowItWorks, onSettings }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isComplete ? (
            <h2 className="text-2xl font-bold text-green-400">Draft Complete!</h2>
          ) : (
            <h2 className="text-xl font-bold text-gray-100">
              Current Turn: <span className="text-blue-400">{currentPlayer?.name || 'Waiting...'}</span>
            </h2>
          )}
          <button onClick={onHowItWorks} className="text-sm text-gray-400 hover:text-white underline underline-offset-4">
            How It Works
          </button>
          <button onClick={onSettings} className="text-sm text-gray-400 hover:text-white underline underline-offset-4">
            Settings
          </button>
        </div>
        
        <div className="flex items-center gap-6">
          {!isComplete && currentPlayer && (
            <div className="text-sm">
              <span className="text-gray-400 uppercase tracking-wider mr-2">Passes Remaining:</span>
              <span className={`font-bold ${passesRemaining > 0 ? 'text-gray-100' : 'text-red-400'}`}>
                {passesRemaining}
              </span>
            </div>
          )}
          
          <button 
            onClick={onSimulate}
            disabled={!isComplete}
            className={`px-6 py-2 rounded-md font-bold uppercase tracking-wider transition-colors
              ${isComplete 
                ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
          >
            Simulate Battle
          </button>
        </div>
      </div>
    </div>
  );
};
