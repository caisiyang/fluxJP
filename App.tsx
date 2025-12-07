import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StudyPage } from './pages/StudyPage';
import { ContextPage } from './pages/ContextPage';
import { ProfilePage } from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StudyPage />} />
          <Route path="/context" element={<ContextPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
