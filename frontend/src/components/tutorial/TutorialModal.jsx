import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

const tutorialSteps = [
  {
    title: "Welcome to Anime Draft",
    body: "Build your ultimate anime dream team and pit them against others in a role-based draft simulator!"
  },
  {
    title: "Pick Your Roles",
    body: "Each draft requires you to fill 15 specific roles like Captain, Speed, Tank, and Healer. Your goal is to draft the best character for each specific job."
  },
  {
    title: "Stats Matter",
    body: "Characters have stats for each role. A character might be weak overall but have a massive 'IQ' or 'Sensei' stat, making them a top-tier pick for that specific slot."
  },
  {
    title: "Drawing & Assigning",
    body: "During the draft, you and your opponent alternate drawing random characters from the verse's pool. When you draw a character, click an empty slot on your board to assign them."
  },
  {
    title: "Using Passes",
    body: "Don't like who you drew? Use a Pass to discard them and draw a new character instantly. You only have a limited number of passes, so use them wisely!"
  },
  {
    title: "Battle Simulation",
    body: "Once both boards are full, the Battle Sim begins. Each round compares your character against the opponent's character in the same role. Highest stat wins the round!"
  },
  {
    title: "You're Ready!",
    body: "That's it! Dive into a Solo Draft against the CPU to practice, or read the 'How It Works' guide for a deeper breakdown of the roles."
  }
];

export const TutorialModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      localStorage.setItem('hasSeenTutorial', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-lg w-full shadow-2xl relative">
        <button onClick={() => { localStorage.setItem('hasSeenTutorial', 'true'); onClose(); }} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <LucideIcons.X size={24} />
        </button>
        
        <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2">
          Step {currentStep + 1} of {tutorialSteps.length}
        </h2>
        <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
        
        <p className="text-gray-300 mb-8 leading-relaxed">
          {step.body}
        </p>

        <div className="flex justify-between items-center">
          <button 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded font-bold uppercase tracking-wider ${currentStep === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white'}`}
          >
            Back
          </button>
          
          <button 
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-widest"
          >
            {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};
