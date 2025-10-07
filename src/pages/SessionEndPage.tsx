import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, BarChart3, Home, Trophy, Clock, AlertCircle, Crown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScoreDisplay, Button, ConfettiOverlay, SkipLink } from '../components';

interface LocationState {
  timedOut: boolean;
  score: number;
  totalCards: number;
  finishTime?: number;
  userId: string;
}

type CelebrationTier = 'perfect' | 'great' | 'good' | 'encouraging' | 'timeout';

export default function SessionEndPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (!state) {
      navigate('/users');
      return;
    }

    const percentage = state.totalCards > 0 ? (state.score / state.totalCards) * 100 : 0;

    if (!state.timedOut) {
      if (percentage === 100) {
        setShowConfetti(true);
        setShowFireworks(true);
      } else if (percentage >= 75) {
        setShowConfetti(true);
      } else if (percentage >= 60) {
        setShowSparkles(true);
      }
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { timedOut, score, totalCards, finishTime, userId } = state;
  const percentage = totalCards > 0 ? Math.round((score / totalCards) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCelebrationTier = (): CelebrationTier => {
    if (timedOut) return 'timeout';
    if (percentage === 100) return 'perfect';
    if (percentage >= 75) return 'great';
    if (percentage >= 60) return 'good';
    return 'encouraging';
  };

  const tier = getCelebrationTier();

  const getMessage = () => {
    switch (tier) {
      case 'perfect':
        return 'PERFECT SCORE!';
      case 'great':
        return 'Amazing Job!';
      case 'good':
        return 'Great Work!';
      case 'encouraging':
        return 'Keep Practicing!';
      case 'timeout':
        return "Time's Up!";
    }
  };

  const getEmoji = () => {
    switch (tier) {
      case 'perfect':
        return '👑';
      case 'great':
        return '🌟';
      case 'good':
        return '✨';
      case 'encouraging':
        return '🌱';
      case 'timeout':
        return '⏰';
    }
  };

  const getDescription = () => {
    switch (tier) {
      case 'perfect':
        return 'You got every single question correct! Outstanding!';
      case 'great':
        return 'Excellent work! You did great!';
      case 'good':
        return 'Nice job! Keep up the good work!';
      case 'encouraging':
        return "You're improving! Practice makes perfect!";
      case 'timeout':
        return 'You ran out of time, but great effort!';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      <SkipLink />
      {tier === 'perfect' && (
        <>
          <ConfettiOverlay
            isActive={showConfetti}
            duration={5000}
            pieceCount={100}
            onComplete={() => setShowConfetti(false)}
          />
          {showFireworks && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => {
                const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFA07A', '#FF69B4', '#00CED1'];
                return (
                  <div
                    key={i}
                    className="absolute text-4xl animate-fireworks"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      '--tx': `${(Math.random() - 0.5) * 300}px`,
                      '--ty': `${(Math.random() - 0.5) * 300}px`,
                      animationDelay: `${Math.random() * 2}s`,
                      color: colors[Math.floor(Math.random() * colors.length)],
                    } as React.CSSProperties}
                  >
                    ✨
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tier === 'great' && (
        <ConfettiOverlay
          isActive={showConfetti}
          duration={3000}
          pieceCount={50}
          onComplete={() => setShowConfetti(false)}
        />
      )}

      {tier === 'good' && showSparkles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div id="main-content" tabIndex={-1} className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className={`text-8xl mb-4 ${tier === 'perfect' ? 'animate-bounce' : tier === 'encouraging' ? 'animate-grow' : 'animate-pulse'}`}>
            {getEmoji()}
          </div>
          <h1 className={`text-5xl font-black mb-2 ${
            tier === 'perfect'
              ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent'
              : tier === 'great'
              ? 'text-blue-600'
              : tier === 'good'
              ? 'text-purple-600'
              : 'text-green-600'
          }`}>
            {getMessage()}
          </h1>
          <p className="text-xl text-gray-600 font-semibold">
            {getDescription()}
          </p>
        </div>

        <div className="mb-8">
          <ScoreDisplay
            score={score}
            total={totalCards}
            animate={true}
            size="large"
            showPercentage={true}
          />
        </div>

        {!timedOut && finishTime !== undefined && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-blue-200">
            <div className="flex items-center justify-center gap-3">
              <Clock size={32} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 font-semibold">Time Taken</p>
                <p className="text-3xl font-black text-blue-600 tabular-nums">
                  {formatTime(finishTime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {timedOut && (
          <div className="bg-yellow-50 rounded-2xl shadow-lg p-6 mb-8 border-2 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={28} className="text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-yellow-900 mb-1">Session Incomplete</p>
                <p className="text-yellow-700">
                  You answered {score} out of {totalCards} questions before time ran out. Keep
                  practicing to improve your speed!
                </p>
              </div>
            </div>
          </div>
        )}

        {tier === 'perfect' && (
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-2xl shadow-2xl p-8 mb-8 border-4 border-yellow-500 text-center animate-pulse">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Crown size={40} className="text-white animate-bounce" />
              <p className="text-4xl font-black text-white">FLAWLESS VICTORY!</p>
              <Crown size={40} className="text-white animate-bounce" />
            </div>
            <p className="text-white text-xl font-bold mb-2">
              Perfect score with {totalCards} correct answers!
            </p>
            <div className="flex items-center justify-center gap-2 text-white text-lg">
              <Trophy size={24} />
              <span>You are a multiplication master!</span>
              <Trophy size={24} />
            </div>
          </div>
        )}

        {tier === 'great' && (
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl shadow-xl p-6 mb-8 border-4 border-blue-500 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={32} className="text-white" />
              <p className="text-3xl font-black text-white">Fantastic!</p>
              <Sparkles size={32} className="text-white" />
            </div>
            <p className="text-white text-lg font-semibold">
              You're doing amazing! Keep it up!
            </p>
          </div>
        )}

        {tier === 'good' && (
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl shadow-xl p-6 mb-8 border-4 border-purple-500 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={28} className="text-white" />
              <p className="text-2xl font-black text-white">Nice Work!</p>
            </div>
            <p className="text-white text-lg font-semibold">
              You're making great progress!
            </p>
          </div>
        )}

        {tier === 'encouraging' && (
          <div className="bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl shadow-xl p-6 mb-8 border-4 border-green-500 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-4xl animate-grow">🌱</div>
              <p className="text-2xl font-black text-white">Growing Stronger!</p>
            </div>
            <p className="text-white text-lg font-semibold">
              Every practice session helps you improve!
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => navigate(`/session/${userId}`)}
            variant="primary"
            fullWidth
            size="large"
          >
            <RefreshCw size={24} className="inline mr-2" />
            Play Again
          </Button>

          <Button
            onClick={() => navigate(`/reports/${userId}`)}
            variant="secondary"
            fullWidth
            size="large"
          >
            <BarChart3 size={24} className="inline mr-2" />
            View Reports
          </Button>

          <Button
            onClick={() => navigate('/users')}
            variant="secondary"
            fullWidth
            size="large"
          >
            <Home size={24} className="inline mr-2" />
            Back to Users
          </Button>
        </div>
      </div>

    </div>
  );
}
