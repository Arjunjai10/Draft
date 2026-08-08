import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { TutorialModal } from '../components/tutorial/TutorialModal';
import { HowItWorksModal } from '../components/reference/HowItWorksModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { HistoryModal } from '../components/history/HistoryModal';

export const Landing = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    if (!localStorage.getItem('hasSeenTutorial')) {
      setShowTutorial(true);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-6xl font-black mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Anime Draft
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          Build your ultimate dream team and simulate battles!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link 
            to="/draft/dbz" 
            className="p-6 bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-500 rounded-xl transition-all group flex flex-col items-center gap-4"
          >
            <LucideIcons.Swords size={48} className="text-blue-500 group-hover:scale-110 transition-transform" />
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider text-white">Solo Draft</h2>
              <p className="text-gray-400 text-sm mt-1">Play offline against the CPU</p>
            </div>
          </Link>
          
          <Link 
            to="/tournament" 
            className="p-6 bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-purple-500 rounded-xl transition-all group flex flex-col items-center gap-4 opacity-50 cursor-not-allowed"
            onClick={(e) => e.preventDefault()}
          >
            <LucideIcons.Trophy size={48} className="text-purple-500 group-hover:scale-110 transition-transform" />
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider text-white">Tournament</h2>
              <p className="text-gray-400 text-sm mt-1">Online Bracket (Coming Soon)</p>
            </div>
          </Link>
        </div>

        <div className="flex justify-center gap-6">
          <button 
            onClick={() => setShowHistory(true)}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <LucideIcons.History size={18} /> Recent Games
          </button>
          <button 
            onClick={() => setShowTutorial(true)}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <LucideIcons.HelpCircle size={18} /> Tutorial
          </button>
          <button 
            onClick={() => setShowHowItWorks(true)}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <LucideIcons.BookOpen size={18} /> Reference
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <LucideIcons.Settings size={18} /> Settings
          </button>
        </div>
      </div>

      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
};
