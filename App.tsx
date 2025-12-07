import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StudyPage } from './pages/StudyPage';
import { GrammarPage } from './pages/GrammarPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { StatsPage } from './pages/StatsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StudyPage />} />
          <Route path="/grammar" element={<GrammarPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
