import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Plus, Trash2, FileSpreadsheet, Loader2, Rocket, Check, AlertCircle, UploadCloud } from 'lucide-react';
import Papa from 'papaparse';
import { publishVerse } from '../api/verses';

const STEP_LABELS = ['Basic Info', 'Roles', 'Characters'];

/* Shared input style factory */
const inputStyle = (active = false) => ({
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  background: 'rgba(255,255,255,0.04)',
  border: active ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
  color: '#eeeeff',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'all 0.2s',
  boxSizing: 'border-box',
});

export const PublishVerse = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Step 1
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Step 2
  const [roles, setRoles] = useState([
    { key: 'captain', label: 'Captain', icon: 'Crown', description: 'Leader of the team' }
  ]);
  const [newRole, setNewRole] = useState({ key: '', label: '', icon: 'Swords', description: '' });

  // Step 3
  const [characters, setCharacters] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
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
          const rowNum = index + 2;
          if (!row.name) { errors.push(`Row ${rowNum}: missing character 'name'`); return; }
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
        if (errors.length > 0) setCsvErrors(errors);
        else { setCsvErrors([]); setCharacters([...characters, ...parsedChars]); }
      },
      error: (err) => { setCsvErrors([`CSV Parsing Error: ${err.message}`]); }
    });
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (!manualChar.name) return;
    const stats = {};
    for (const role of roles) { stats[role.key] = parseInt(manualStats[role.key] || 0, 10); }
    setCharacters([...characters, {
      name: manualChar.name, imageUrl: manualChar.imageUrl,
      tags: manualChar.tags ? manualChar.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      stats
    }]);
    setManualChar({ name: '', imageUrl: '', tags: '' });
    setManualStats({});
  };

  const handleSubmit = async () => {
    if (characters.length === 0) { setError('You must add at least 1 character to publish the verse.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const payload = { name, description, coverImage, roles, characters };
      const newVerse = await publishVerse(payload);
      navigate(`/gallery/${newVerse.slug}`);
    } catch (err) {
      setError(err.message || 'Failed to publish verse');
      setSubmitting(false);
    }
  };

  const labelStyle = {
    display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700,
    fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem',
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden',
        padding: '2.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: 0, left: '30%', width: '600px', height: '400px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '760px', position: 'relative', zIndex: 10 }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'slide-up 0.4s ease forwards' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', background: 'linear-gradient(135deg, #4ade80, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '0.04em' }}>
            Publish a Verse
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Share your anime universe with the community
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2rem', animation: 'slide-up 0.5s ease forwards' }}>
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <React.Fragment key={num}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                  <div
                    style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: done ? 'linear-gradient(135deg, #16a34a, #22c55e)' : active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                      border: done ? '2px solid rgba(34,197,94,0.6)' : active ? '2px solid rgba(34,197,94,0.5)' : '2px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.85rem',
                      color: done ? '#fff' : active ? '#4ade80' : 'rgba(255,255,255,0.2)',
                      boxShadow: active ? '0 0 14px rgba(34,197,94,0.25)' : done ? '0 0 10px rgba(34,197,94,0.3)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {done ? <Check size={16} /> : num}
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? '#4ade80' : done ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.2)', marginTop: '0.4rem', whiteSpace: 'nowrap', transition: 'all 0.3s' }}>
                    {label}
                  </div>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: step > num ? 'linear-gradient(90deg, rgba(34,197,94,0.5), rgba(34,197,94,0.25))' : 'rgba(255,255,255,0.06)', margin: '0 0.5rem', marginBottom: '1.25rem', borderRadius: '9999px', transition: 'background 0.3s ease' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Card */}
        <div
          style={{
            background: 'rgba(15,15,26,0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            animation: 'slide-up 0.4s ease forwards',
          }}
        >
          {/* ── STEP 1 ─────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                Step 1 — Basic Info
              </h2>

              <div>
                <label style={labelStyle}>Verse Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Naruto"
                  style={inputStyle()}
                  onFocus={e => { e.target.style.borderColor = 'rgba(34,197,94,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Cover Image URL</label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle()}
                  onFocus={e => { e.target.style.borderColor = 'rgba(34,197,94,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                {coverImage && (
                  <div style={{ marginTop: '0.75rem', width: '100%', height: '180px', borderRadius: '0.875rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={coverImage} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="A brief description of this universe…"
                  rows={4}
                  style={{ ...inputStyle(), resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(34,197,94,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => setStep(2)}
                  disabled={!name}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', borderRadius: '0.875rem', border: 'none', background: name ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(255,255,255,0.06)', color: name ? '#fff' : 'rgba(255,255,255,0.25)', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: name ? 'pointer' : 'not-allowed', boxShadow: name ? '0 0 20px rgba(34,197,94,0.35)' : 'none', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { if (name) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '0.25rem' }}>
                  Step 2 — Roles
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem' }}>Define the stat categories each character will have.</p>
              </div>

              {/* Role list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {roles.map(role => (
                  <div
                    key={role.key}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.75rem', transition: 'all 0.2s' }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.88rem', color: '#4ade80' }}>{role.label}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>({role.key})</span>
                      {role.description && <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem' }}>{role.description}</span>}
                    </div>
                    <button
                      onClick={() => handleRemoveRole(role.key)}
                      style={{ padding: '0.35rem', borderRadius: '0.5rem', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {roles.length === 0 && (
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    No roles defined. Add at least one!
                  </div>
                )}
              </div>

              {/* Add Role Form */}
              <form onSubmit={handleAddRole} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Add New Role</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '0.35rem' }}>Key</label>
                    <input type="text" value={newRole.key} onChange={e => setNewRole({ ...newRole, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} placeholder="speed" style={{ ...inputStyle(), fontSize: '0.82rem', padding: '0.6rem 0.875rem' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(79,140,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '0.35rem' }}>Label</label>
                    <input type="text" value={newRole.label} onChange={e => setNewRole({ ...newRole, label: e.target.value })} placeholder="Speed" style={{ ...inputStyle(), fontSize: '0.82rem', padding: '0.6rem 0.875rem' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(79,140,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ ...labelStyle, marginBottom: '0.35rem' }}>Description</label>
                    <input type="text" value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} placeholder="How fast they are" style={{ ...inputStyle(), fontSize: '0.82rem', padding: '0.6rem 0.875rem' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(79,140,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '0.75rem', border: 'none', background: 'rgba(79,140,255,0.18)', color: '#93c5fd', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.18)'; }}
                >
                  <Plus size={15} /> Add Role
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.875rem 1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button onClick={() => setStep(3)} disabled={roles.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.75rem', borderRadius: '0.875rem', border: 'none', background: roles.length > 0 ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(255,255,255,0.06)', color: roles.length > 0 ? '#fff' : 'rgba(255,255,255,0.25)', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: roles.length > 0 ? 'pointer' : 'not-allowed', boxShadow: roles.length > 0 ? '0 0 20px rgba(34,197,94,0.35)' : 'none', transition: 'all 0.2s ease' }}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ─────────────────────────────────────────── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  Step 3 — Characters
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', marginTop: '0.5rem' }}>
                  Upload a CSV or add manually. <strong style={{ color: '#4ade80' }}>{characters.length}</strong> characters staged.
                </p>
              </div>

              {/* CSV Upload Zone */}
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '2.5rem', borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  cursor: 'pointer', gap: '0.75rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.background = 'rgba(34,197,94,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <UploadCloud size={36} style={{ color: 'rgba(255,255,255,0.2)' }} />
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Upload CSV</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                  Required columns: name, imageUrl, tags, {roles.map(r => r.key).join(', ')}
                </div>
                <div style={{ marginTop: '0.25rem', padding: '0.4rem 1rem', borderRadius: '0.625rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Choose File
                </div>
                <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} />
              </label>

              {/* CSV Errors */}
              {csvErrors.length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {csvErrors.map((err, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: '#fca5a5', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                      <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} /> {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Manual Entry */}
              <form onSubmit={handleManualAdd} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Or Add Manually</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '0.35rem' }}>Name *</label>
                    <input type="text" value={manualChar.name} onChange={e => setManualChar({ ...manualChar, name: e.target.value })} required style={{ ...inputStyle(), fontSize: '0.82rem', padding: '0.6rem 0.875rem' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(79,140,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '0.35rem' }}>Image URL</label>
                    <input type="text" value={manualChar.imageUrl} onChange={e => setManualChar({ ...manualChar, imageUrl: e.target.value })} style={{ ...inputStyle(), fontSize: '0.82rem', padding: '0.6rem 0.875rem' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(79,140,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ ...labelStyle, marginBottom: '0.35rem' }}>Tags (comma separated)</label>
                    <input type="text" value={manualChar.tags} onChange={e => setManualChar({ ...manualChar, tags: e.target.value })} placeholder="Hero, Saiyan" style={{ ...inputStyle(), fontSize: '0.82rem', padding: '0.6rem 0.875rem' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(79,140,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Stat inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
                  {roles.map(role => (
                    <div key={role.key}>
                      <label style={{ ...labelStyle, marginBottom: '0.3rem', fontSize: '0.58rem' }}>{role.label}</label>
                      <input type="number" min="0" max="100" value={manualStats[role.key] || ''} onChange={e => setManualStats({ ...manualStats, [role.key]: e.target.value })} required style={{ ...inputStyle(), fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(79,140,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,140,255,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  ))}
                </div>

                <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '0.75rem', border: 'none', background: 'rgba(79,140,255,0.18)', color: '#93c5fd', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.18)'; }}
                >
                  <Plus size={15} /> Stage Character
                </button>
              </form>

              {/* Staged characters chip list */}
              {characters.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {characters.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem 0.3rem 0.5rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#4ade80' }}>{c.name}</span>
                      <button onClick={() => setCharacters(characters.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 0, transition: 'color 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600 }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.875rem 1.25rem', borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || characters.length === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.875rem 2rem', borderRadius: '0.875rem', border: 'none',
                    background: characters.length > 0 && !submitting ? 'linear-gradient(135deg, #7c3aed, #c084fc)' : 'rgba(255,255,255,0.06)',
                    color: characters.length > 0 && !submitting ? '#fff' : 'rgba(255,255,255,0.25)',
                    fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.85rem',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: characters.length > 0 && !submitting ? 'pointer' : 'not-allowed',
                    boxShadow: characters.length > 0 && !submitting ? '0 0 24px rgba(192,132,252,0.4)' : 'none',
                    transition: 'all 0.2s ease',
                    opacity: submitting ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (characters.length > 0 && !submitting) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Rocket size={16} />}
                  {submitting ? 'Publishing…' : 'Publish Verse'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
