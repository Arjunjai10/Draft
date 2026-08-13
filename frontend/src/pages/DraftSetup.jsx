import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVerseBySlug, fetchCharacters } from '../api/verses';
import { createDraft } from '../api/drafts';
import * as LucideIcons from 'lucide-react';

export const DraftSetup = () => {
  const { verseSlug } = useParams();
  const navigate = useNavigate();
  const [verse, setVerse] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mode, setMode] = useState('cpu');
  const [passes, setPasses] = useState(10);
  const [excludedCharacterIds, setExcludedCharacterIds] = useState(new Set());
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  
  useEffect(() => {
    Promise.all([
      fetchVerseBySlug(verseSlug),
      fetchCharacters(verseSlug)
    ]).then(([v, chars]) => {
      setVerse(v);
      setCharacters(chars);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [verseSlug]);

  const handleStartDraft = async () => {
    try {
      const draftConfig = {
        verseId: verse._id,
        mode,
        players: [],
        passes: parseInt(passes, 10),
        excludedCharacters: Array.from(excludedCharacterIds)
      };

      if (mode === 'cpu') {
        draftConfig.players = [
          { id: 'player1', name: 'Player 1' },
          { id: 'cpu1', name: 'CPU', isCPU: true, cpuDifficulty: 'medium' }
        ];
      } else if (mode === 'local') {
        draftConfig.players = [
          { id: 'player1', name: 'Player 1' },
          { id: 'player2', name: 'Player 2' }
        ];
      } else if (mode === 'online') {
        draftConfig.players = [
          { id: 'player1', name: 'Player 1' }
        ];
      }

      const draft = await createDraft(draftConfig);
      localStorage.setItem(`draft_${draft._id}_playerId`, 'player1');
      navigate(`/draft/${verseSlug}/play?session=${draft._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExclude = (charId) => {
    setExcludedCharacterIds(prev => {
      const next = new Set(prev);
      if (next.has(charId)) next.delete(charId);
      else next.add(charId);
      return next;
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading verse...</div>;
  if (!verse) return <div className="p-8 text-center text-red-500">Verse not found</div>;

  const poolSize = characters.length - excludedCharacterIds.size;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Main Setup Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-3xl w-full p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">{verse.name} Draft</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-gray-400">Player 1 vs</span>
              <select 
                value={mode} 
                onChange={e => setMode(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-blue-400 px-3 py-1 rounded font-bold text-sm"
              >
                <option value="cpu">CPU (Medium)</option>
                <option value="local">Local Player</option>
                <option value="online">Online Friend</option>
              </select>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded flex items-center gap-2 transition-colors">
            <LucideIcons.ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* Roles */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Roles</h3>
            <span className="bg-fuchsia-700 text-white px-4 py-1 rounded-full text-sm font-bold">
              {verse.roles.length} Roles
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {verse.roles.map(r => (
              <span key={r.key} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-sm font-semibold text-gray-300">
                {r.name}
              </span>
            ))}
          </div>
        </div>

        {/* Config Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col">
            <label className="text-gray-400 text-sm font-semibold mb-2">Passes (1-10)</label>
            <select 
              value={passes} 
              onChange={e => setPasses(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded p-2 mt-auto w-full"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col">
            <label className="text-gray-400 text-sm font-semibold mb-2">Character Pool</label>
            <div className="text-4xl font-black text-white mt-auto">{poolSize}</div>
          </div>
          
          <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex flex-col justify-end">
            <button 
              onClick={() => setShowExcludeModal(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-colors"
            >
              Exclude Characters
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="py-4 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
            <LucideIcons.BookOpen size={20} /> Tutorial
          </button>
          <button onClick={() => navigate(`/gallery/${verseSlug}`)} className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
            <LucideIcons.Image size={20} /> Gallery
          </button>
          <button onClick={handleStartDraft} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
            <LucideIcons.Play size={20} /> Start Draft
          </button>
        </div>
      </div>

      {/* Exclude Characters Modal */}
      {showExcludeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-white">Exclude Characters</h3>
                <p className="text-gray-400 text-sm mt-1">Select characters to remove from the draft pool.</p>
              </div>
              <button onClick={() => setShowExcludeModal(false)} className="text-gray-400 hover:text-white">
                <LucideIcons.X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {characters.map(char => {
                const isExcluded = excludedCharacterIds.has(char._id);
                return (
                  <div 
                    key={char._id}
                    onClick={() => toggleExclude(char._id)}
                    className={`cursor-pointer rounded-lg p-2 border-2 transition-all text-center
                      ${isExcluded ? 'border-red-500 bg-red-950/30 opacity-50' : 'border-gray-800 hover:border-gray-600 bg-gray-800'}`}
                  >
                    <div className="w-16 h-16 mx-auto bg-gray-900 rounded-full mb-2 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden relative">
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="uppercase text-lg">{char.name.substring(0, 2)}</span>
                      )}
                      {isExcluded && (
                         <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center backdrop-blur-[1px]">
                           <LucideIcons.Ban className="text-white drop-shadow-md" size={24} />
                         </div>
                      )}
                    </div>
                    <div className="text-xs font-bold text-gray-300 truncate">{char.name}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-gray-800 flex justify-between items-center bg-gray-950 rounded-b-xl">
               <span className="text-gray-400 font-bold">{excludedCharacterIds.size} Excluded</span>
               <button 
                 onClick={() => setShowExcludeModal(false)}
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
               >
                 Done
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

