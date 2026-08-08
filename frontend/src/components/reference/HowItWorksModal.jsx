import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { genericReferencePages, verseReferenceDocs } from '../../data/referenceDocs';

export const HowItWorksModal = ({ isOpen, onClose, defaultVerse = 'dbz' }) => {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen) return null;

  // Dynamically prepend generic pages to verse-specific pages
  const versePages = verseReferenceDocs[defaultVerse] || [];
  const allPages = [...genericReferencePages, ...versePages];

  const handleNext = () => {
    if (currentPage < allPages.length - 1) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  const page = allPages[currentPage];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full shadow-2xl relative flex flex-col h-[600px]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <LucideIcons.X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <LucideIcons.BookOpen className="text-blue-500" size={28} />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">How It Works</h2>
        </div>
        
        <div className="flex-1 overflow-auto pr-2">
          <h3 className="text-xl font-bold text-blue-400 mb-4">{page.title}</h3>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {page.body}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded font-bold uppercase tracking-wider ${currentPage === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white'}`}
          >
            Previous
          </button>
          
          <span className="text-gray-500 font-bold text-sm">
            Page {currentPage + 1} of {allPages.length}
          </span>

          <button 
            onClick={handleNext}
            disabled={currentPage === allPages.length - 1}
            className={`px-4 py-2 rounded font-bold uppercase tracking-widest ${currentPage === allPages.length - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
