import { useNavigate } from 'react-router-dom';
import { Settings, Users, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SkipLink } from '../components';

export default function SplashPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden relative">
      <SkipLink />
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
          <Sparkles
            size={48}
            className="text-yellow-300 animate-[spin_3s_ease-in-out_infinite,pulse_2s_ease-in-out_infinite,float_3s_ease-in-out_infinite] origin-center"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              animationDelay: '0s',
            }}
          />
          <h1 className="text-6xl font-black text-white" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            Flash Cards
          </h1>
          <Sparkles
            size={48}
            className="text-yellow-300 animate-[spin_3s_ease-in-out_infinite,pulse_2s_ease-in-out_infinite,float_3s_ease-in-out_infinite] origin-center"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              animationDelay: '0.6s',
              transform: 'scale(1.2)',
            }}
          />
        </div>
        <p className="text-2xl text-white/90 font-semibold" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          Multiplication Practice
        </p>
        <p className="text-lg text-white/80 mt-2" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          Make learning fun!
        </p>
      </div>

      <div
        id="main-content"
        tabIndex={-1}
        className={`flex flex-col gap-4 w-full max-w-sm relative z-10 transition-all duration-1000 delay-300 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <button
          onClick={() => navigate('/users')}
          className="flex items-center justify-center gap-3 w-full bg-gradient-to-br from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-10 py-6 rounded-3xl text-2xl font-black shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-200 min-h-[80px] border-4 border-white/30 animate-[pulse_2s_ease-in-out_infinite]"
          aria-label="Go to users page"
        >
          <Users size={36} />
          <span>Start Playing! 🎮</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center gap-2 w-full bg-white text-gray-700 px-6 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-102 active:scale-95 transition-all duration-200 min-h-[60px] border-2 border-gray-200 hover:border-gray-300"
          aria-label="Go to settings page"
        >
          <Settings size={24} />
          <span>⚙️ Settings</span>
        </button>
      </div>

      <div
        className={`mt-12 text-center text-white/70 text-sm relative z-10 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>Learn multiplication tables 1-12</p>
        <p style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>Track your progress and improve!</p>
      </div>
    </div>
  );
}
