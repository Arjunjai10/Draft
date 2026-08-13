import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { TutorialModal } from '../components/tutorial/TutorialModal';
import { SettingsModal } from '../components/settings/SettingsModal';

export const Landing = () => {
  const navigate = useNavigate();
  const [activeVerse, setActiveVerse] = useState('dragon-ball');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const verses = [
    { id: 'naruto', name: 'Naruto' },
    { id: 'bleach', name: 'Bleach' },
    { id: 'dragon-ball', name: 'Dragon Ball' },
    { id: 'one-piece', name: 'One Piece' }
  ];

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden flex flex-col font-sans text-white">
      {/* Dynamic Background Placeholder (Using gradient for now) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-green-900 opacity-80 z-0"></div>
      
      {/* Top Navigation Bar */}
      <nav className="relative z-10 w-full p-4 flex items-center justify-between">
        <button className="flex items-center gap-2 bg-indigo-900 bg-opacity-70 border border-indigo-700 rounded-full px-4 py-2 hover:bg-opacity-100 transition">
          <LucideIcons.Gamepad2 size={18} className="text-purple-400" />
          <span className="font-semibold text-sm">More Games</span>
        </button>

        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white"><LucideIcons.ChevronLeft size={20} /></button>
          <div className="flex gap-6">
            {verses.map(v => (
              <button 
                key={v.id}
                onClick={() => setActiveVerse(v.id)}
                className={`font-bold text-sm tracking-wide ${activeVerse === v.id ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1' : 'text-gray-300 hover:text-white'}`}
              >
                {v.name}
              </button>
            ))}
          </div>
          <button className="text-blue-400 bg-blue-900 bg-opacity-50 rounded-full p-1"><LucideIcons.Play size={16} fill="currentColor" /></button>
        </div>

        <div className="flex items-center gap-2 bg-green-900 bg-opacity-40 border border-green-700 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold text-green-400 tracking-wider">Online</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        
        {/* The Draft Card */}
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black italic tracking-wide text-white">Dragon Ball Draft</h1>
              <p className="text-gray-400 text-sm mt-1">Player 1 vs Player 2 (Local/Pass)</p>
            </div>
            <div className="flex gap-2">
              <button className="text-xs font-bold bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300">About</button>
              <button className="text-xs font-bold bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-yellow-500">Stats</button>
              <button className="text-xs font-bold bg-purple-900 hover:bg-purple-800 px-3 py-1.5 rounded text-purple-300 flex items-center gap-1">
                <LucideIcons.Star size={12} fill="currentColor" /> Credits
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 border-t border-b border-gray-700 py-4">
            <span className="font-bold text-gray-300">Roles</span>
            <button className="bg-purple-900 bg-opacity-60 text-purple-300 text-sm font-bold px-4 py-2 rounded-lg border border-purple-700 hover:bg-opacity-100 transition">
              Choose Roles (15/15)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <button onClick={() => setShowTutorial(true)} className="col-span-1 bg-yellow-900 bg-opacity-40 hover:bg-opacity-80 text-yellow-500 border border-yellow-700 rounded-xl py-3 font-bold text-sm transition">
              <LucideIcons.BookOpen size={16} className="inline mr-2" /> Tutorial
            </button>
            <button onClick={() => setShowSettings(true)} className="col-span-1 bg-blue-900 bg-opacity-40 hover:bg-opacity-80 text-blue-400 border border-blue-700 rounded-xl py-3 font-bold text-sm transition">
              <LucideIcons.Settings size={16} className="inline mr-2" /> Settings
            </button>
            <button onClick={() => navigate('/setup/dbz')} className="col-span-1 bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 font-bold text-sm shadow-[0_0_15px_rgba(34,197,94,0.4)] transition">
              <LucideIcons.Play size={16} fill="currentColor" className="inline mr-2" /> Start Draft
            </button>
          </div>
        </div>

        <button onClick={() => navigate('/tournament')} className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] transition flex items-center gap-2 text-lg">
          <LucideIcons.Globe size={20} /> Host Online
        </button>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 flex justify-between items-center">
        <div className="flex gap-4">
          <button className="bg-indigo-900 p-2 rounded-full text-indigo-300 hover:bg-indigo-800 transition"><LucideIcons.MessageSquare size={18} /></button>
          <button className="bg-orange-900 p-2 rounded-full text-orange-400 hover:bg-orange-800 transition"><LucideIcons.MessageCircle size={18} /></button>
          <button className="bg-blue-900 p-2 rounded-full text-blue-400 hover:bg-blue-800 transition"><LucideIcons.Coffee size={18} /></button>
          <span className="text-gray-500 text-xs flex items-center ml-4">
            2026 Anime Draft Fan-made project for discussion and fun. No copyright infringement intended. <a href="#" className="underline ml-2">Pages</a>
          </span>
        </div>
        
        <button onClick={() => setShowSettings(true)} className="bg-gray-800 border border-gray-700 hover:bg-gray-700 px-4 py-2 rounded-full text-sm font-bold text-gray-300 transition">
          Settings
        </button>
      </footer>

      {showTutorial && <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />}
      {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />}
    </div>
  );
};
