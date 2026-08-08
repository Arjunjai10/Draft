import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DraftSetup } from './pages/DraftSetup';
import { LiveDraft } from './pages/LiveDraft';
import { BattleSim } from './pages/BattleSim';
import { Landing } from './pages/Landing';
import { SettingsModal } from './components/settings/SettingsModal';

import { TournamentLanding } from './pages/TournamentLanding';
import { TournamentHost } from './pages/TournamentHost';
import { TournamentJoin } from './pages/TournamentJoin';
import { LiveBracket } from './pages/LiveBracket';
const Gallery = () => <div className="p-8 text-center"><h2 className="text-2xl">Verse Gallery</h2></div>;
const VerseDetail = () => <div className="p-8 text-center"><h2 className="text-2xl">Verse Detail</h2></div>;
const PublishVerse = () => <div className="p-8 text-center"><h2 className="text-2xl">Publish Verse</h2></div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-hero-placeholder">
        <nav className="p-4 bg-gray-800 flex gap-4 text-sm flex-wrap justify-center shadow-md">
          <Link to="/" className="hover:text-blue-400">Home</Link>
          <Link to="/draft/dbz" className="hover:text-blue-400">Draft Setup (DBZ)</Link>
          <Link to="/draft/dbz/play" className="hover:text-blue-400">Live Draft</Link>
          <Link to="/battle/123" className="hover:text-blue-400">Battle Sim</Link>
          <Link to="/tournament" className="hover:text-blue-400">Tournament</Link>
          <Link to="/gallery" className="hover:text-blue-400">Gallery</Link>
        </nav>
        
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Landing />} />
            
            <Route path="/draft/:verseSlug" element={<DraftSetup />} />
            <Route path="/draft/:verseSlug/play" element={<LiveDraft />} />
            
            <Route path="/battle/:sessionId" element={<BattleSim />} />
            
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
