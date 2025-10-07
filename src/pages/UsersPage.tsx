import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function UsersPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate('/')}
            className="touch-target p-2 hover:bg-gray-100 rounded-lg transition-smooth"
            aria-label="Go back to home"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
      </header>

      <main className="p-4">
        <p className="text-gray-600">Users page - to be implemented</p>
      </main>
    </div>
  );
}
