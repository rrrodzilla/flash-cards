import { useNavigate } from 'react-router-dom';
import { Settings, Users, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SplashPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-yellow-200/20 to-transparent rounded-full animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-200/20 to-transparent rounded-full animate-pulse delay-1000" />
      </div>

      <div
        className={`text-center mb-12 relative z-10 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
        }`}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles size={48} className="text-yellow-300 animate-pulse" />
          <h1 className="text-6xl font-black text-white drop-shadow-lg">
            Flash Cards
          </h1>
          <Sparkles size={48} className="text-yellow-300 animate-pulse" />
        </div>
        <p className="text-2xl text-white/90 font-semibold drop-shadow">
          Multiplication Practice
        </p>
        <p className="text-lg text-white/80 mt-2 drop-shadow">
          Make learning fun!
        </p>
      </div>

      <div
        className={`flex flex-col gap-4 w-full max-w-sm relative z-10 transition-all duration-1000 delay-300 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <button
          onClick={() => navigate('/users')}
          className="flex items-center justify-center gap-3 w-full bg-white text-purple-600 px-8 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-200 min-h-[68px] border-4 border-purple-200 hover:border-purple-300"
          aria-label="Go to users page"
        >
          <Users size={32} />
          <span>Select User</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center gap-3 w-full bg-white text-blue-600 px-8 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-200 min-h-[68px] border-4 border-blue-200 hover:border-blue-300"
          aria-label="Go to settings page"
        >
          <Settings size={32} />
          <span>Settings</span>
        </button>
      </div>

      <div
        className={`mt-12 text-center text-white/70 text-sm relative z-10 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="drop-shadow">Learn multiplication tables 1-12</p>
        <p className="drop-shadow">Track your progress and improve!</p>
      </div>
    </div>
  );
}
