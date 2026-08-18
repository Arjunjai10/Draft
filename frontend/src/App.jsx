import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { DraftSetup } from './pages/DraftSetup';
import { LiveDraft } from './pages/LiveDraft';
import { DraftJoin } from './pages/DraftJoin';
import { BattleSim } from './pages/BattleSim';
import { Landing } from './pages/Landing';

import { TournamentLanding } from './pages/TournamentLanding';
import { TournamentHost } from './pages/TournamentHost';
import { TournamentJoin } from './pages/TournamentJoin';
import { LiveBracket } from './pages/LiveBracket';
import { Gallery } from './pages/Gallery';
import { VerseDetail } from './pages/VerseDetail';
import { PublishVerse } from './pages/PublishVerse';

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/setup/dbz', label: 'Draft' },
  { to: '/join', label: 'Join' },
  { to: '/tournament', label: 'Tournament' },
  { to: '/gallery', label: 'Gallery' },
];

function NavBar() {
  const location = useLocation();

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  // Hide navbar on full-screen pages (LiveDraft, BattleSim)
  const hideNav = ['/draft/', '/battle/'].some(p => location.pathname.startsWith(p));
  if (hideNav) return null;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7,7,15,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6c63ff, #c084fc)',
              boxShadow: '0 0 16px rgba(108,99,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #a5b4fc, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.04em',
            }}
          >
            Anime Draft
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: active
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(192,132,252,0.2))'
                    : 'transparent',
                  border: active
                    ? '1px solid rgba(108,99,255,0.4)'
                    : '1px solid transparent',
                  boxShadow: active ? '0 0 12px rgba(108,99,255,0.2)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side — live indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.3rem 0.9rem',
            borderRadius: '9999px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '9999px',
              background: '#4ade80',
              boxShadow: '0 0 8px #4ade80',
              animation: 'glow-pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4ade80',
            }}
          >
            Online
          </span>
        </div>
      </nav>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-primary)',
        }}
      >
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/setup/:verseSlug" element={<DraftSetup />} />
            <Route path="/draft/:draftId" element={<LiveDraft />} />
            <Route path="/join" element={<DraftJoin />} />
            <Route path="/battle/:draftId" element={<BattleSim />} />
            <Route path="/tournament" element={<TournamentLanding />} />
            <Route path="/tournament/host" element={<TournamentHost />} />
            <Route path="/tournament/join" element={<TournamentJoin />} />
            <Route path="/tournament/:id" element={<LiveBracket />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/publish" element={<PublishVerse />} />
            <Route path="/gallery/:verseSlug" element={<VerseDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
