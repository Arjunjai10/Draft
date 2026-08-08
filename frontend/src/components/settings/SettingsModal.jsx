import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [canonicalArt, setCanonicalArt] = useState(true);
  const [sfx, setSfx] = useState(true);
  const [hideCpu, setHideCpu] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  // Load from local storage
  useEffect(() => {
    if (isOpen) {
      setCanonicalArt(localStorage.getItem('canonicalArt') !== 'false');
      setSfx(localStorage.getItem('sfx') !== 'false');
      setHideCpu(localStorage.getItem('hideCpu') === 'true');
      setAnalytics(localStorage.getItem('analytics') !== 'false');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key, setter, current) => {
    const nextVal = !current;
    setter(nextVal);
    localStorage.setItem(key, String(nextVal));
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear your cache? This will reset your settings.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <LucideIcons.X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <LucideIcons.Settings className="text-gray-400" size={28} />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Settings</h2>
        </div>
        
        <div className="flex flex-col gap-6 mb-8">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-gray-200">Show Canonical Art</p>
              <p className="text-xs text-gray-500">Toggle between official art and placeholder styling.</p>
            </div>
            <input type="checkbox" className="w-6 h-6 rounded bg-gray-800 border-gray-600 checked:bg-blue-500 cursor-pointer" 
                   checked={canonicalArt} onChange={() => handleToggle('canonicalArt', setCanonicalArt, canonicalArt)} />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-gray-200">Sound Effects</p>
              <p className="text-xs text-gray-500">Play sounds during drafts and battles.</p>
            </div>
            <input type="checkbox" className="w-6 h-6 rounded bg-gray-800 border-gray-600 checked:bg-blue-500 cursor-pointer" 
                   checked={sfx} onChange={() => handleToggle('sfx', setSfx, sfx)} />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-gray-200">Hide CPU Picks</p>
              <p className="text-xs text-gray-500">Keep the opponent's roster secret during Solo Drafts.</p>
            </div>
            <input type="checkbox" className="w-6 h-6 rounded bg-gray-800 border-gray-600 checked:bg-blue-500 cursor-pointer" 
                   checked={hideCpu} onChange={() => handleToggle('hideCpu', setHideCpu, hideCpu)} />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-gray-200">Analytics Data</p>
              <p className="text-xs text-gray-500">Allow anonymous usage data (GA).</p>
            </div>
            <input type="checkbox" className="w-6 h-6 rounded bg-gray-800 border-gray-600 checked:bg-blue-500 cursor-pointer" 
                   checked={analytics} onChange={() => handleToggle('analytics', setAnalytics, analytics)} />
          </label>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <button 
            onClick={handleClearCache}
            className="w-full py-3 bg-red-900/30 hover:bg-red-900 border border-red-800 text-red-400 hover:text-white rounded font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <LucideIcons.AlertTriangle size={18} />
            Clear Cache & Reload
          </button>
        </div>
      </div>
    </div>
  );
};
