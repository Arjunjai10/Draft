import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Search, Library, Loader2, Users, Swords, Zap, CheckCircle, Image, TrendingUp, Clock } from 'lucide-react';
import { fetchVerses } from '../api/verses';

export const Gallery = () => {
  const [verses, setVerses] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchVerses(sort, search)
      .then(data => { if (isMounted) setVerses(data); })
      .catch(err => console.error('Failed to fetch verses:', err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
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
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--bg-base)',
        padding: '2.5rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: 0, left: '30%', width: '600px', height: '400px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            animation: 'slide-up 0.4s ease forwards',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                letterSpacing: '0.04em', lineHeight: 1.1,
              }}
            >
              Verse Gallery
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Community-created anime universes
            </p>
          </div>
          <Link
            to="/gallery/publish"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', borderRadius: '0.875rem',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: '#fff', textDecoration: 'none',
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              boxShadow: '0 0 24px rgba(34,197,94,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(34,197,94,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(34,197,94,0.35)'; }}
          >
            <UploadCloud size={16} /> Publish Verse
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '2rem',
            animation: 'slide-up 0.5s ease forwards',
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{ flex: 1, display: 'flex', gap: '0.5rem' }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search verses..."
                style={{
                  width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem',
                  borderRadius: '0.875rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#eeeeff', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={e => { e.target.style.borderColor = 'rgba(34,197,94,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.25rem', borderRadius: '0.875rem',
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)',
                color: '#4ade80', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; }}
            >
              <Search size={18} />
            </button>
          </form>

          {/* Sort Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.875rem', padding: '0.3rem', gap: '0.25rem' }}>
            {[{ val: 'new', icon: <Clock size={14} />, label: 'New' }, { val: 'top', icon: <TrendingUp size={14} />, label: 'Top' }].map(s => {
              const active = sort === s.val;
              return (
                <button
                  key={s.val}
                  onClick={() => setSort(s.val)}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.625rem',
                    background: active ? 'rgba(34,197,94,0.2)' : 'transparent',
                    border: active ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                    color: active ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.75rem',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}
                >
                  {s.icon} {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6rem 0' }}>
            <Loader2 size={44} style={{ color: '#22c55e', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
              animation: 'fade-in 0.5s ease forwards',
            }}
          >
            {verses.map(verse => (
              <Link
                key={verse._id}
                to={`/gallery/${verse.slug}`}
                style={{
                  display: 'block',
                  background: 'rgba(15,15,26,0.85)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(34,197,94,0.1), 0 20px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Image */}
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative', background: '#0f0f1a' }}>
                  {verse.coverImages && verse.coverImages[0] ? (
                    <img src={verse.coverImages[0]} alt={verse.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => { e.target.style.transform = 'scale(1.06)'; }}
                      onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                      <Image size={56} />
                    </div>
                  )}
                  {verse.isOfficial && (
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', background: 'rgba(79,140,255,0.9)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', backdropFilter: 'blur(8px)' }}>
                      <CheckCircle size={10} /> Official
                    </div>
                  )}
                  {/* Gradient overlay at bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(15,15,26,1) 0%, transparent 100%)' }} />
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem' }}>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '0.4rem', letterSpacing: '0.02em' }}>{verse.name}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {verse.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600 }}>
                        <Users size={13} /> {verse.characterCount}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600 }}>
                        <Swords size={13} /> {verse.roleCount}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fde68a', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem' }}>
                      <Zap size={12} /> {verse.powerScore || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {verses.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '6rem 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                <Library size={56} style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem' }}>No verses found.</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', marginTop: '0.5rem' }}>Try a different search or publish the first one!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
