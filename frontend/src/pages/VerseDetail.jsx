import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Image, CheckCircle, Zap, Users, Swords, Play, User } from 'lucide-react';
import { fetchVerseBySlug, fetchCharacters } from '../api/verses';

export const VerseDetail = () => {
  const { verseSlug } = useParams();
  const [verse, setVerse] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      fetchVerseBySlug(verseSlug),
      fetchCharacters(verseSlug),
    ]).then(([verseData, charData]) => {
      if (isMounted) { setVerse(verseData); setCharacters(charData); }
    }).catch(err => console.error('Failed to load verse data', err))
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [verseSlug]);

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-base)' }}>
        <Loader2 size={44} style={{ color: '#22c55e', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!verse) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-base)', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#ef4444' }}>Verse not found</h2>
        <Link to="/gallery" style={{ color: '#60a5fa', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}>← Back to Gallery</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient bg */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '500px', background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', position: 'relative', zIndex: 10 }}>
        {/* Back link */}
        <Link
          to="/gallery"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
            fontFamily: 'Inter, sans-serif', fontSize: '0.82rem',
            marginBottom: '1.75rem', transition: 'color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <ArrowLeft size={16} /> Back to Gallery
        </Link>

        {/* Hero Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            background: 'rgba(15,15,26,0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            marginBottom: '2.5rem',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            animation: 'slide-up 0.4s ease forwards',
          }}
        >
          {/* Cover Image */}
          <div style={{ width: '340px', flexShrink: 0, background: '#0a0a0f', position: 'relative', minHeight: '260px' }}>
            {verse.coverImages && verse.coverImages[0] ? (
              <img src={verse.coverImages[0]} alt={verse.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', minHeight: '260px' }}>
                <Image size={64} />
              </div>
            )}
            {verse.isOfficial && (
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', background: 'rgba(79,140,255,0.9)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                <CheckCircle size={12} /> Official
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(15,15,26,0.9) 0%, transparent 100%)' }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.2rem', color: '#fff', lineHeight: 1.1 }}>{verse.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fde68a', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 0 16px rgba(251,191,36,0.15)', flexShrink: 0 }}>
                  <Zap size={20} /> {verse.powerScore || 0}
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {verse.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16} /> {verse.characterCount} Characters</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Swords size={16} /> {verse.roleCount} Roles</span>
              </div>
            </div>

            <Link
              to={`/setup/${verse.slug}`}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '1rem 2rem', borderRadius: '0.875rem',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: '#fff', textDecoration: 'none',
                fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.95rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                boxShadow: '0 0 28px rgba(34,197,94,0.4)',
                transition: 'all 0.2s ease',
                marginTop: '1.5rem',
                alignSelf: 'flex-start',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(34,197,94,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(34,197,94,0.4)'; }}
            >
              <Play size={18} fill="currentColor" /> Start Draft
            </Link>
          </div>
        </div>

        {/* Character Grid */}
        <div style={{ animation: 'slide-up 0.5s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '0.04em' }}>
              Characters
              <span style={{ marginLeft: '0.6rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>({characters.length})</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
            {characters.map(char => (
              <div
                key={char._id}
                style={{
                  background: 'rgba(15,15,26,0.85)', borderRadius: '1rem',
                  padding: '0.875rem 0.625rem', textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(34,197,94,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 0.625rem', border: '2px solid rgba(255,255,255,0.08)', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {char.imageUrl ? (
                    <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={28} style={{ color: 'rgba(255,255,255,0.15)' }} />
                  )}
                </div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#eeeeff', letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{char.name}</h3>
                {char.tags?.length > 0 && (
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {char.tags.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
