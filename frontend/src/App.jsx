import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DraftSetup } from './pages/DraftSetup';
import { LiveDraft } from './pages/LiveDraft';
import { BattleSim } from './pages/BattleSim';
import { Landing } from './pages/Landing';

import { TournamentLanding } from './pages/TournamentLanding';
import { TournamentHost } from './pages/TournamentHost';
import { TournamentJoin } from './pages/TournamentJoin';
import { LiveBracket } from './pages/LiveBracket';
import { Gallery } from './pages/Gallery';
import { VerseDetail } from './pages/VerseDetail';
import { PublishVerse } from './pages/PublishVerse';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-hero-placeholder">
        <nav className="p-4 bg-gray-900 text-white flex gap-6 text-sm flex-wrap justify-center shadow-lg border-b border-gray-700">
          <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
          <Link to="/setup/dbz" className="hover:text-yellow-400 transition-colors">Local Draft (DBZ)</Link>
          <Link to="/tournament" className="hover:text-yellow-400 transition-colors">Tournaments</Link>
          <Link to="/gallery" className="hover:text-yellow-400 transition-colors">Gallery</Link>
        </nav>
        
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Landing />} />
            
            <Route path="/setup/:verseSlug" element={<DraftSetup />} />
            <Route path="/draft/:draftId" element={<LiveDraft />} />
            
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
