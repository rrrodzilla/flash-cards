import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import SplashPage from './pages/SplashPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import SessionPage from './pages/SessionPage';
import SessionEndPage from './pages/SessionEndPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/session/:userId" element={<SessionPage />} />
          <Route path="/session-end" element={<SessionEndPage />} />
          <Route path="/reports/:userId" element={<ReportsPage />} />
        </Routes>
      </div>
    </AppProvider>
  );
}

export default App;
