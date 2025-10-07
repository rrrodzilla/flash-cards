import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SessionPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate('/users')}
            className="touch-target p-2 hover:bg-gray-100 rounded-lg transition-smooth"
            aria-label="Go back to users"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Flash Card Session</h1>
        </div>
      </header>

      <main className="p-4">
        <p className="text-gray-600">Session page for user: {userId}</p>
        <p className="text-gray-600 mt-2">To be implemented</p>
      </main>
    </div>
  );
}
