import { useNavigate } from 'react-router-dom';
import { Settings, Users } from 'lucide-react';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-500 to-blue-600">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Flash Cards</h1>
        <p className="text-xl text-blue-100">Multiplication Practice</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center justify-center gap-3 w-full bg-white text-blue-600 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-blue-50 active:bg-blue-100 transition-smooth touch-target"
          aria-label="Go to users page"
        >
          <Users size={28} />
          <span>Users</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center gap-3 w-full bg-white text-blue-600 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-blue-50 active:bg-blue-100 transition-smooth touch-target"
          aria-label="Go to settings page"
        >
          <Settings size={28} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
