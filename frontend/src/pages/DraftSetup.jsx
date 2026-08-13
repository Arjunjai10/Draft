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
  const [draftStyle, setDraftStyle] = useState('standard');
  const [maxPower, setMaxPower] = useState('no-limit');
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
      navigate(`/draft/${draft._id}`);
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

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8 text-center text-gray-400">Loading...</div>;
  if (!verse) return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8 text-center text-red-500">Verse not found</div>;

  const poolSize = characters.length - excludedCharacterIds.size;

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden flex flex-col items-center justify-center font-sans text-white p-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-gray-900 to-blue-900 opacity-60 z-0"></div>

      {/* Main Setup Card */}
      <div className="relative z-10 bg-gray-900 bg-opacity-80 backdrop-blur-xl border border-gray-700 rounded-3xl max-w-2xl w-full p-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-6">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <LucideIcons.ArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-black italic tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
            Draft Setup
          </h2>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Config Grid */}
        <div className="space-y-6 mb-10">
          <div className="grid grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
               <label className="text-gray-400 text-sm font-bold uppercase tracking-wider">Opponent</label>
               <select 
                 value={mode} 
                 onChange={e => setMode(e.target.value)}
                 className="bg-gray-800 border border-gray-600 focus:border-yellow-500 text-white p-3 rounded-xl appearance-none outline-none font-semibold transition-colors"
               >
                 <option value="cpu">CPU (Medium)</option>
                 <option value="local">Local Player</option>
                 <option value="online">Online Friend</option>
               </select>
             </div>
             
             <div className="flex flex-col gap-2">
               <label className="text-gray-400 text-sm font-bold uppercase tracking-wider">Passes</label>
               <select 
                 value={passes} 
                 onChange={e => setPasses(e.target.value)}
                 className="bg-gray-800 border border-gray-600 focus:border-yellow-500 text-white p-3 rounded-xl appearance-none outline-none font-semibold transition-colors"
               >
                 {[...Array(10)].map((_, i) => (
                   <option key={i+1} value={i+1}>{i+1}</option>
                 ))}
               </select>
             </div>

             <div className="flex flex-col gap-2">
               <label className="text-gray-400 text-sm font-bold uppercase tracking-wider">Draft Style</label>
               <select 
                 value={draftStyle} 
                 onChange={e => setDraftStyle(e.target.value)}
                 className="bg-gray-800 border border-gray-600 focus:border-yellow-500 text-white p-3 rounded-xl appearance-none outline-none font-semibold transition-colors"
               >
                 <option value="standard">Standard</option>
                 <option value="snake">Snake</option>
               </select>
             </div>

             <div className="flex flex-col gap-2">
               <label className="text-gray-400 text-sm font-bold uppercase tracking-wider">Max Team Power</label>
               <select 
                 value={maxPower} 
                 onChange={e => setMaxPower(e.target.value)}
                 className="bg-gray-800 border border-gray-600 focus:border-yellow-500 text-white p-3 rounded-xl appearance-none outline-none font-semibold transition-colors"
               >
                 <option value="no-limit">No Limit</option>
                 <option value="balanced">Balanced</option>
                 <option value="competitive">Competitive</option>
               </select>
             </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-4 flex justify-between items-center mt-4">
             <div>
               <h3 className="font-bold text-white tracking-wide">Excluded Characters</h3>
               <p className="text-sm text-gray-400">{excludedCharacterIds.size} excluded • {poolSize} in pool</p>
             </div>
             <button 
               onClick={() => setShowExcludeModal(true)}
               className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
             >
               Edit
             </button>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleStartDraft} 
          className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-black text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all transform hover:scale-[1.02]"
        >
          Start Draft
        </button>
      </div>

      {/* Exclude Characters Modal */}
      {showExcludeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-5xl w-full h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800 bg-opacity-50 rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-black italic tracking-wide text-white uppercase">Exclude Characters</h3>
                <p className="text-gray-400 text-sm mt-1">Select characters to remove from the draft pool.</p>
              </div>
              <button onClick={() => setShowExcludeModal(false)} className="text-gray-400 hover:text-white p-2">
                <LucideIcons.X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 bg-gray-900">
              {characters.map(char => {
                const isExcluded = excludedCharacterIds.has(char._id);
                return (
                  <div 
                    key={char._id}
                    onClick={() => toggleExclude(char._id)}
                    className={`cursor-pointer rounded-xl p-2 border-2 transition-all text-center relative group
                      ${isExcluded ? 'border-red-500 bg-red-950/20' : 'border-gray-800 hover:border-gray-600 bg-gray-800'}`}
                  >
                    <div className="w-16 h-16 mx-auto rounded-full mb-2 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden relative border-2 border-gray-700 group-hover:border-gray-500 transition-colors">
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="uppercase text-lg text-gray-600">{char.name.substring(0, 2)}</span>
                      )}
                      {isExcluded && (
                         <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center backdrop-blur-[2px]">
                           <LucideIcons.Ban className="text-white drop-shadow-lg" size={24} />
                         </div>
                      )}
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider truncate ${isExcluded ? 'text-red-400' : 'text-gray-300'}`}>
                      {char.name}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-gray-800 flex justify-between items-center bg-gray-900 rounded-b-2xl">
               <span className="text-yellow-500 font-bold tracking-wide text-sm">{excludedCharacterIds.size} Excluded</span>
               <button 
                 onClick={() => setShowExcludeModal(false)}
                 className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-wide uppercase transition-colors"
               >
                 Confirm Pool
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

