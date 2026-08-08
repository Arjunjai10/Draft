import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import Papa from 'papaparse';
import { publishVerse } from '../api/verses';

export const PublishVerse = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Step 2: Roles
  const [roles, setRoles] = useState([
    { key: 'captain', label: 'Captain', icon: 'Crown', description: 'Leader of the team' }
  ]);
  const [newRole, setNewRole] = useState({ key: '', label: '', icon: 'Swords', description: '' });

  // Step 3: Characters
  const [characters, setCharacters] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  
  // Manual character add form
  const [manualChar, setManualChar] = useState({ name: '', imageUrl: '', tags: '' });
  const [manualStats, setManualStats] = useState({});

  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRole.key || !newRole.label) return;
    if (roles.find(r => r.key === newRole.key)) return;
    
    setRoles([...roles, { ...newRole }]);
    setNewRole({ key: '', label: '', icon: 'Swords', description: '' });
  };

  const handleRemoveRole = (keyToRemove) => {
    setRoles(roles.filter(r => r.key !== keyToRemove));
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedChars = [];
        const errors = [];
        
        results.data.forEach((row, index) => {
          const rowNum = index + 2; // +1 for 0-index, +1 for header row
          
          if (!row.name) {
            errors.push(`Row ${rowNum}: missing character 'name'`);
            return;
          }

          const stats = {};
          let hasAllStats = true;
          
          roles.forEach(role => {
            if (!(role.key in row)) {
              errors.push(`Row ${rowNum}: missing column for role '${role.key}'`);
              hasAllStats = false;
            } else {
              const val = parseInt(row[role.key], 10);
              if (isNaN(val)) {
                errors.push(`Row ${rowNum}: invalid stat number for role '${role.key}'`);
                hasAllStats = false;
              } else {
                stats[role.key] = val;
              }
            }
          });

          if (hasAllStats) {
            parsedChars.push({
              name: row.name,
              imageUrl: row.imageUrl || '',
              tags: row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
              stats
            });
          }
        });

        if (errors.length > 0) {
          setCsvErrors(errors);
        } else {
          setCsvErrors([]);
          // Additive merge!
          setCharacters([...characters, ...parsedChars]);
        }
      },
      error: (err) => {
        setCsvErrors([`CSV Parsing Error: ${err.message}`]);
      }
    });
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (!manualChar.name) return;
    
    const stats = {};
    for (const role of roles) {
      stats[role.key] = parseInt(manualStats[role.key] || 0, 10);
    }

    setCharacters([...characters, {
      name: manualChar.name,
      imageUrl: manualChar.imageUrl,
      tags: manualChar.tags ? manualChar.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      stats
    }]);

    setManualChar({ name: '', imageUrl: '', tags: '' });
    setManualStats({});
  };

  const handleSubmit = async () => {
    if (characters.length === 0) {
      setError('You must add at least 1 character to publish the verse.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name,
        description,
        coverImage,
        roles,
        characters
      };
      
      const newVerse = await publishVerse(payload);
      navigate(`/gallery/${newVerse.slug}`);
    } catch (err) {
      setError(err.message || 'Failed to publish verse');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-8 text-center">
        Publish a Verse
      </h1>

      {/* Progress Bar */}
      <div className="w-full flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-10 -translate-y-1/2"></div>
        <div className={`absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 transition-all duration-300`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        {[1, 2, 3].map(num => (
          <div key={num} className={`w-10 h-10 rounded-full flex justify-center items-center font-bold border-4 ${step >= num ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}>
            {num}
          </div>
        ))}
      </div>

      <div className="w-full bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-gray-700">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold uppercase text-white border-b border-gray-700 pb-2">Step 1: Basic Info</h2>
            <div>
              <label className="block text-gray-400 font-bold uppercase text-sm mb-2">Verse Name *</label>
              <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:border-green-500 outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Naruto" required />
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase text-sm mb-2">Cover Image URL</label>
              <input type="url" className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:border-green-500 outline-none" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase text-sm mb-2">Description</label>
              <textarea className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:border-green-500 outline-none h-32" value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of this universe..." />
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={() => setStep(2)} disabled={!name} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded font-bold uppercase tracking-widest disabled:opacity-50 transition-colors">
                Next <LucideIcons.ArrowRight className="inline ml-2" size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold uppercase text-white border-b border-gray-700 pb-2">Step 2: Roles</h2>
            <p className="text-gray-400 text-sm">Define the stats/roles each character will have in this verse.</p>
            
            <div className="space-y-3">
              {roles.map(role => (
                <div key={role.key} className="flex justify-between items-center bg-gray-900 p-4 rounded border border-gray-700">
                  <div>
                    <span className="font-bold text-green-400 mr-4">{role.label}</span>
                    <span className="text-gray-500 text-sm font-mono mr-4">({role.key})</span>
                    <span className="text-gray-400 text-sm">{role.description}</span>
                  </div>
                  <button onClick={() => handleRemoveRole(role.key)} className="text-red-500 hover:bg-gray-800 p-2 rounded">
                    <LucideIcons.Trash2 size={18} />
                  </button>
                </div>
              ))}
              {roles.length === 0 && <div className="text-gray-500 italic p-4 bg-gray-900 rounded border border-gray-800">No roles defined. Add at least one!</div>}
            </div>

            <form onSubmit={handleAddRole} className="bg-gray-900 p-4 rounded-xl border border-gray-700 space-y-4">
              <h3 className="font-bold text-gray-300 uppercase text-sm">Add New Role</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs uppercase mb-1">Key (e.g. speed)</label>
                  <input type="text" className="w-full bg-gray-800 rounded px-3 py-2 text-white text-sm outline-none" value={newRole.key} onChange={e => setNewRole({...newRole, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} placeholder="speed" required />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs uppercase mb-1">Label (e.g. Speed)</label>
                  <input type="text" className="w-full bg-gray-800 rounded px-3 py-2 text-white text-sm outline-none" value={newRole.label} onChange={e => setNewRole({...newRole, label: e.target.value})} placeholder="Speed" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-500 text-xs uppercase mb-1">Description</label>
                  <input type="text" className="w-full bg-gray-800 rounded px-3 py-2 text-white text-sm outline-none" value={newRole.description} onChange={e => setNewRole({...newRole, description: e.target.value})} placeholder="How fast they are" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold uppercase text-sm w-full transition-colors">
                <LucideIcons.Plus size={16} className="inline mr-1" /> Add Role
              </button>
            </form>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white px-4 py-3 rounded font-bold uppercase tracking-widest transition-colors">
                <LucideIcons.ArrowLeft className="inline mr-2" size={18} /> Back
              </button>
              <button onClick={() => setStep(3)} disabled={roles.length === 0} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded font-bold uppercase tracking-widest disabled:opacity-50 transition-colors">
                Next <LucideIcons.ArrowRight className="inline ml-2" size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold uppercase text-white border-b border-gray-700 pb-2">Step 3: Characters</h2>
            <p className="text-gray-400 text-sm">Upload a CSV or add characters manually. You have <strong className="text-white">{characters.length}</strong> characters staged.</p>

            {/* CSV Upload */}
            <div className="bg-gray-900 border-2 border-dashed border-gray-700 hover:border-green-500 rounded-xl p-8 text-center transition-colors">
              <LucideIcons.FileSpreadsheet size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-300 font-bold mb-2">Upload CSV</p>
              <p className="text-gray-500 text-sm mb-4">Required columns: name, imageUrl, tags, {roles.map(r=>r.key).join(', ')}</p>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 mx-auto max-w-xs cursor-pointer" />
            </div>

            {csvErrors.length > 0 && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 p-4 rounded max-h-48 overflow-y-auto text-sm space-y-1">
                {csvErrors.map((err, i) => <div key={i}>{err}</div>)}
              </div>
            )}

            {/* Manual Entry */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <h3 className="font-bold text-gray-300 uppercase text-sm mb-4 cursor-pointer flex items-center justify-between">
                <span>Or Add Manually</span>
              </h3>
              <form onSubmit={handleManualAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-xs uppercase mb-1">Name</label>
                    <input type="text" className="w-full bg-gray-800 rounded px-3 py-2 text-white text-sm outline-none" value={manualChar.name} onChange={e => setManualChar({...manualChar, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase mb-1">Image URL</label>
                    <input type="text" className="w-full bg-gray-800 rounded px-3 py-2 text-white text-sm outline-none" value={manualChar.imageUrl} onChange={e => setManualChar({...manualChar, imageUrl: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Tags (comma separated)</label>
                    <input type="text" className="w-full bg-gray-800 rounded px-3 py-2 text-white text-sm outline-none" value={manualChar.tags} onChange={e => setManualChar({...manualChar, tags: e.target.value})} placeholder="Hero, Saiyan" />
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                  {roles.map(role => (
                    <div key={role.key}>
                      <label className="block text-gray-500 text-xs uppercase mb-1 truncate" title={role.label}>{role.label}</label>
                      <input type="number" min="0" max="100" className="w-full bg-gray-800 rounded px-2 py-1 text-white text-sm outline-none" value={manualStats[role.key] || ''} onChange={e => setManualStats({...manualStats, [role.key]: e.target.value})} required />
                    </div>
                  ))}
                </div>

                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold uppercase text-sm w-full transition-colors mt-2">
                  <LucideIcons.Plus size={16} className="inline mr-1" /> Stage Character
                </button>
              </form>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded text-center font-bold">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white px-4 py-3 rounded font-bold uppercase tracking-widest transition-colors">
                <LucideIcons.ArrowLeft className="inline mr-2" size={18} /> Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting || characters.length === 0} 
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded font-bold uppercase tracking-widest disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20"
              >
                {submitting ? <LucideIcons.Loader2 className="animate-spin" size={18} /> : <LucideIcons.Rocket size={18} />}
                Publish Verse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
