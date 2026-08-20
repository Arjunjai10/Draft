import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVerseBySlug, fetchCharacters } from '../api/verses';
import { createDraft } from '../api/drafts';
import { ArrowLeft, Loader2, Play, Ban, X, Sliders, Users, Cpu, Globe, Settings2 } from 'lucide-react';

const MODE_OPTIONS = [
  { val: 'cpu', label: 'vs CPU', sub: 'Medium difficulty', icon: <Cpu size={18} /> },
  { val: 'local', label: 'Local', sub: 'Pass & play', icon: <Users size={18} /> },
  { val: 'online', label: 'Online', sub: 'Invite a friend', icon: <Globe size={18} /> },
];

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
      fetchCharacters(verseSlug),
    ]).then(([v, chars]) => {
      setVerse(v);
      setCharacters(chars);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [verseSlug]);

  const handleStartDraft = async () => {
    try {
      const draftConfig = {
        verseId: verse._id, mode,
        players: [],
        passes: parseInt(passes, 10),
        excludedCharacters: Array.from(excludedCharacterIds),
      };
      if (mode === 'cpu') {
        draftConfig.players = [{ id: 'player1', name: 'Player 1' }, { id: 'cpu1', name: 'CPU', isCPU: true, cpuDifficulty: 'medium' }];
      } else if (mode === 'local') {
        draftConfig.players = [{ id: 'player1', name: 'Player 1' }, { id: 'player2', name: 'Player 2' }];
      } else if (mode === 'online') {
        draftConfig.players = [{ id: 'player1', name: 'Player 1' }];
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

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <Loader2 size={36} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
    </div>
  );
  if (!verse) return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <p style={{ color: '#ef4444', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Verse not found</p>
    </div>
  );

  const poolSize = characters.length - excludedCharacterIds.size;

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* Ambient */}
      <div style={{ position: 'absolute', top: '0%', left: '30%', width: '600px', height: '600px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0%', right: '20%', width: '500px', height: '500px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

      <div
        style={{
          width: '100%', maxWidth: '600px',
          background: 'rgba(15,15,26,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: '1.75rem',
          padding: '2.5rem',
          boxShadow: '0 0 50px rgba(108,99,255,0.1), 0 24px 80px rgba(0,0,0,0.6)',
          animation: 'slide-up 0.4s ease forwards',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.6rem', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', background: 'linear-gradient(135deg, #fde68a, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '0.04em' }}>
              Draft Setup
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {verse.name}
            </p>
          </div>
          <div style={{ width: '40px' }} />
        </div>

        {/* Mode Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.85rem' }}>
            Opponent
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            {MODE_OPTIONS.map(opt => {
              const active = mode === opt.val;
              return (
                <button
                  key={opt.val}
                  onClick={() => setMode(opt.val)}
                  style={{
                    padding: '1rem 0.5rem', borderRadius: '1rem',
                    border: active ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: active ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 0 16px rgba(108,99,255,0.2)' : 'none',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>{React.cloneElement(opt.icon, { size: 22 })}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.2rem' }}>{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Config Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Passes', val: passes, set: setPasses, opts: [...Array(10)].map((_, i) => ({ val: i + 1, label: i + 1 })) },
            { label: 'Draft Style', val: draftStyle, set: setDraftStyle, opts: [{ val: 'standard', label: 'Standard' }, { val: 'snake', label: 'Snake' }] },
            { label: 'Max Power', val: maxPower, set: setMaxPower, opts: [{ val: 'no-limit', label: 'No Limit' }, { val: 'balanced', label: 'Balanced' }, { val: 'competitive', label: 'Competitive' }] },
          ].map(field => (
            <div key={field.label}>
              <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>{field.label}</label>
              <select
                value={field.val}
                onChange={e => field.set(e.target.value)}
                style={{
                  width: '100%', padding: '0.7rem 0.875rem', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#eeeeff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  cursor: 'pointer', appearance: 'none',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(251,191,36,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              >
                {field.opts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            </div>
          ))}

          {/* Exclude Characters */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
              Character Pool
            </label>
            <button
              onClick={() => setShowExcludeModal(true)}
              style={{
                width: '100%', padding: '0.7rem 0.875rem', borderRadius: '0.75rem',
                background: excludedCharacterIds.size > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                border: excludedCharacterIds.size > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
                color: excludedCharacterIds.size > 0 ? '#fca5a5' : 'rgba(255,255,255,0.45)',
                fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
              }}
            >
              <Settings2 size={14} />
              {excludedCharacterIds.size > 0 ? `${excludedCharacterIds.size} excluded` : `${poolSize} in pool`}
            </button>
          </div>
        </div>

        {/* Pool info line */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', marginBottom: '1.5rem' }} />

        {/* Start CTA */}
        <button
          onClick={handleStartDraft}
          style={{
            width: '100%', padding: '1rem', borderRadius: '0.875rem', border: 'none',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#0a0a0f', fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer', boxShadow: '0 0 28px rgba(251,191,36,0.45)',
            transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(251,191,36,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(251,191,36,0.45)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
        >
          <Play size={18} fill="currentColor" /> Start Draft
        </button>
      </div>

      {/* Exclude Characters Modal */}
      {showExcludeModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
            animation: 'fade-in 0.2s ease forwards',
          }}
        >
          <div
            style={{
              background: 'rgba(12,12,22,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1.5rem',
              width: '100%', maxWidth: '800px', maxHeight: '85vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
              animation: 'slide-up 0.3s ease forwards',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>Exclude Characters</h3>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', marginTop: '0.2rem' }}>Click to toggle exclusion from the draft pool</p>
              </div>
              <button onClick={() => setShowExcludeModal(false)} style={{ padding: '0.5rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem' }}>
              {characters.map(char => {
                const isExcluded = excludedCharacterIds.has(char._id);
                return (
                  <div
                    key={char._id}
                    onClick={() => toggleExclude(char._id)}
                    style={{
                      cursor: 'pointer', borderRadius: '0.875rem',
                      padding: '0.75rem 0.5rem', textAlign: 'center',
                      border: isExcluded ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      background: isExcluded ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 0.5rem', border: isExcluded ? '2px solid rgba(239,68,68,0.5)' : '2px solid rgba(255,255,255,0.08)', background: '#0a0a0f', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isExcluded ? 0.4 : 1 }} />
                      ) : (
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'rgba(255,255,255,0.2)' }}>{char.name.substring(0, 2)}</span>
                      )}
                      {isExcluded && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.5)' }}>
                          <Ban size={20} style={{ color: '#fff' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.02em', color: isExcluded ? '#fca5a5' : 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {char.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#fca5a5' }}>
                {excludedCharacterIds.size} excluded · {poolSize} in pool
              </span>
              <button
                onClick={() => setShowExcludeModal(false)}
                style={{ padding: '0.7rem 1.75rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #2563eb, #4f8cff)', color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 0 16px rgba(79,140,255,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
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
