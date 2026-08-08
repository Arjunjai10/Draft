import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { fetchVerseBySlug, fetchCharacters } from '../api/verses';

export const VerseDetail = () => {
  const { verseSlug } = useParams();
  const navigate = useNavigate();
  const [verse, setVerse] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [verseSlug]);

  const loadData = async () => {
    setLoading(true);
    try {
      const verseData = await fetchVerseBySlug(verseSlug);
      setVerse(verseData);
      
      const charData = await fetchCharacters(verseSlug);
      setCharacters(charData);
    } catch (err) {
      console.error('Failed to load verse data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <LucideIcons.Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-64px)]">
        <h2 className="text-2xl text-red-500 mb-4">Verse not found</h2>
        <Link to="/gallery" className="text-blue-400 hover:underline">Back to Gallery</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-8 max-w-6xl mx-auto w-full">
      <Link to="/gallery" className="self-start flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <LucideIcons.ArrowLeft size={20} /> Back to Gallery
      </Link>
      
      <div className="w-full bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-8 flex flex-col md:flex-row">
        <div className="md:w-1/3 h-64 md:h-auto bg-gray-900 relative">
          {verse.coverImages && verse.coverImages[0] ? (
            <img src={verse.coverImages[0]} alt={verse.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex justify-center items-center text-gray-700">
              <LucideIcons.Image size={64} />
            </div>
          )}
          {verse.isOfficial && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white text-sm font-bold uppercase px-3 py-1 rounded shadow-md flex items-center gap-2">
              <LucideIcons.CheckCircle size={16} /> Official
            </div>
          )}
        </div>
        
        <div className="p-8 md:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-black uppercase text-white">{verse.name}</h1>
              <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-lg text-yellow-400 font-bold text-xl shadow-inner">
                <LucideIcons.Zap size={24} /> {verse.powerScore || 0}
              </div>
            </div>
            
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {verse.description || "No description provided."}
            </p>
            
            <div className="flex gap-6 mb-8 text-gray-400 font-semibold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <LucideIcons.Users size={20} /> {verse.characterCount} Characters
              </div>
              <div className="flex items-center gap-2">
                <LucideIcons.Swords size={20} /> {verse.roleCount} Roles
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link 
              to={`/draft/${verse.slug}`}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white text-center py-4 rounded-lg font-black uppercase tracking-widest text-lg transition-colors flex justify-center items-center gap-2 shadow-md"
            >
              <LucideIcons.Play size={24} /> Start Draft
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h2 className="text-2xl font-bold uppercase text-white mb-6 border-b border-gray-700 pb-2">Characters</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {characters.map(char => (
            <div key={char._id} className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700 hover:border-gray-500 transition-colors">
              <div className="w-full aspect-square bg-gray-900 rounded-lg mb-3 overflow-hidden">
                {char.imageUrl ? (
                  <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex justify-center items-center text-gray-700">
                    <LucideIcons.User size={32} />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-white text-sm truncate">{char.name}</h3>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {char.tags?.join(', ') || 'No tags'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
