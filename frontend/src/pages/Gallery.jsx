import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { fetchVerses } from '../api/verses';

export const Gallery = () => {
  const [verses, setVerses] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerses();
  }, [sort]);

  const loadVerses = async (searchQuery = search) => {
    setLoading(true);
    try {
      const data = await fetchVerses(sort, searchQuery);
      setVerses(data);
    } catch (err) {
      console.error('Failed to fetch verses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVerses();
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-8 max-w-6xl mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
          Verse Gallery
        </h1>
        <Link 
          to="/gallery/publish" 
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
        >
          <LucideIcons.UploadCloud size={20} /> Publish Verse
        </Link>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 mb-8 bg-gray-800 p-4 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input 
            type="text" 
            placeholder="Search verses..." 
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:border-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="bg-gray-700 hover:bg-gray-600 px-4 rounded text-gray-300">
            <LucideIcons.Search size={20} />
          </button>
        </form>
        
        <div className="flex bg-gray-900 rounded p-1">
          <button 
            className={`px-4 py-2 rounded font-bold uppercase text-sm ${sort === 'new' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setSort('new')}
          >
            New
          </button>
          <button 
            className={`px-4 py-2 rounded font-bold uppercase text-sm ${sort === 'top' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setSort('top')}
          >
            Top
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LucideIcons.Loader2 className="animate-spin text-green-500" size={48} />
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verses.map(verse => (
            <Link 
              key={verse._id} 
              to={`/gallery/${verse.slug}`}
              className="bg-gray-800 border-2 border-gray-700 hover:border-green-500 rounded-xl overflow-hidden group transition-all"
            >
              <div className="h-48 w-full bg-gray-900 overflow-hidden relative">
                {verse.coverImages && verse.coverImages[0] ? (
                  <img src={verse.coverImages[0]} alt={verse.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex justify-center items-center text-gray-700">
                    <LucideIcons.Image size={64} />
                  </div>
                )}
                {verse.isOfficial && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold uppercase px-2 py-1 rounded flex items-center gap-1 shadow-md">
                    <LucideIcons.CheckCircle size={14} /> Official
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold uppercase text-white mb-2">{verse.name}</h2>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                  {verse.description || "No description provided."}
                </p>
                <div className="flex justify-between items-center text-gray-500 text-sm font-semibold uppercase">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1" title="Characters">
                      <LucideIcons.Users size={16} /> {verse.characterCount}
                    </span>
                    <span className="flex items-center gap-1" title="Roles">
                      <LucideIcons.Swords size={16} /> {verse.roleCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 bg-gray-900 px-2 py-1 rounded" title="Power Score">
                    <LucideIcons.Zap size={16} /> {verse.powerScore || 0}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {verses.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              <LucideIcons.Library size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">No verses found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
