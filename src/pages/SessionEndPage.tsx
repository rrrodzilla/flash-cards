import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, BarChart3, Home, Trophy, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScoreDisplay, Button } from '../components';

interface LocationState {
  timedOut: boolean;
  score: number;
  totalCards: number;
  finishTime?: number;
  userId: string;
}

export default function SessionEndPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!state) {
      navigate('/users');
      return;
    }

    if (!state.timedOut && state.score / state.totalCards >= 0.75) {
      setShowConfetti(true);
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

  const getMessage = () => {
    if (timedOut) {
      return "Time's Up!";
    }

    if (percentage >= 90) return 'Outstanding!';
    if (percentage >= 75) return 'Excellent Work!';
    if (percentage >= 60) return 'Good Job!';
    return 'Keep Practicing!';
  };

  const getEmoji = () => {
    if (timedOut) return '⏰';
    if (percentage >= 90) return '🏆';
    if (percentage >= 75) return '🌟';
    if (percentage >= 60) return '👍';
    return '💪';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {showConfetti && !timedOut && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti-animation">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: [
                    '#FF6B6B',
                    '#4ECDC4',
                    '#45B7D1',
                    '#FFA07A',
                    '#98D8C8',
                    '#F7DC6F',
                    '#BB8FCE',
                    '#85C1E9',
                  ][Math.floor(Math.random() * 8)],
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce">{getEmoji()}</div>
          <h1 className="text-5xl font-black text-gray-900 mb-2">
            {getMessage()}
          </h1>
          {timedOut ? (
            <p className="text-xl text-gray-600 font-semibold">
              You ran out of time, but great effort!
            </p>
          ) : (
            <p className="text-xl text-gray-600 font-semibold">
              Session completed successfully!
            </p>
          )}
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

        {!timedOut && percentage === 100 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-2xl p-6 mb-8 border-4 border-yellow-500 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy size={32} className="text-white" />
              <p className="text-3xl font-black text-white">Perfect Score!</p>
              <Trophy size={32} className="text-white" />
            </div>
            <p className="text-white text-lg font-semibold">
              You got every single question correct!
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

      <style>{`
        .confetti-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          opacity: 0;
          animation: confetti-fall 3s linear infinite;
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
