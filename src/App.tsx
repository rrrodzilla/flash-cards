import { Routes, Route } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import SessionPage from './pages/SessionPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/session/:userId" element={<SessionPage />} />
        <Route path="/reports/:userId" element={<ReportsPage />} />
      </Routes>
    </div>
  );
}

export default App;
