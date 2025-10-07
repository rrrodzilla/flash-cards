import { useParams, useNavigate } from 'react-router-dom';
import { X, Check, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getUser, getSettings, createSession, updateSession } from '../storage';
import { generateSessionProblems } from '../algorithms/weightedRandom';
import type { Card } from '../types';
import { NumberPad, Timer, Modal, Button } from '../components';

interface SessionCard extends Omit<Card, 'userAnswer' | 'isCorrect'> {
  userAnswer?: number;
  isCorrect?: boolean;
}

export default function SessionPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [cards, setCards] = useState<SessionCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answer, setAnswer] = useState('0');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleTimeout = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalScore = score;
    const totalCards = cards.length;
    const completedCards = cards.slice(0, currentCardIndex).map((card) => ({
      ...card,
      userAnswer: card.userAnswer ?? 0,
      isCorrect: card.isCorrect ?? false,
    }));

    updateSession(sessionId, {
      cards: completedCards,
      score: finalScore,
      totalCards,
      timedOut: true,
    });

    navigate('/session-end', {
      state: {
        timedOut: true,
        score: finalScore,
        totalCards,
        userId,
      },
    });
  }, [sessionId, score, cards, currentCardIndex, userId, navigate]);

  useEffect(() => {
    if (!userId) {
      navigate('/users');
      return;
    }

    const loadedUser = getUser(userId);
    if (!loadedUser) {
      navigate('/users');
      return;
    }

    setUser(loadedUser);

    const settings = getSettings();
    const generatedProblems = generateSessionProblems(settings, userId);
    setCards(generatedProblems);

    const session = createSession(userId, settings);
    setSessionId(session.sessionId);
    setTotalTime(settings.timeLimit);
    setTimeRemaining(settings.timeLimit);
    startTimeRef.current = Date.now();

    timerRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [userId, navigate, handleTimeout]);

  const handleSessionComplete = useCallback((completedCards: Card[]) => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalScore = completedCards.filter((c) => c.isCorrect).length;

    updateSession(sessionId, {
      cards: completedCards,
      score: finalScore,
      totalCards: cards.length,
      finishTime: elapsedTime,
      timedOut: false,
    });

    navigate('/session-end', {
      state: {
        timedOut: false,
        score: finalScore,
        totalCards: cards.length,
        finishTime: elapsedTime,
        userId,
      },
    });
  }, [sessionId, cards.length, userId, navigate]);

  const handleSubmitAnswer = useCallback(() => {
    if (feedback !== null) return;

    const currentCard = cards[currentCardIndex];
    if (!currentCard) return;

    const userAnswer = parseInt(answer, 10);
    const isCorrect = userAnswer === currentCard.correctAnswer;

    const updatedCard: Card = {
      ...currentCard,
      userAnswer,
      isCorrect,
    };

    const updatedCards = [...cards];
    updatedCards[currentCardIndex] = updatedCard;
    setCards(updatedCards);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswer('0');

      if (currentCardIndex + 1 >= cards.length) {
        handleSessionComplete(updatedCards as Card[]);
      } else {
        setCurrentCardIndex((prev) => prev + 1);
      }
    }, 1000);
  }, [answer, currentCardIndex, cards, feedback, handleSessionComplete]);

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }

    const completedCards = cards.slice(0, currentCardIndex).map((card) => ({
      ...card,
      userAnswer: card.userAnswer ?? 0,
      isCorrect: card.isCorrect ?? false,
    }));

    updateSession(sessionId, {
      cards: completedCards,
      score,
      totalCards: cards.length,
      timedOut: true,
    });

    navigate('/users');
  };

  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;

  if (!user || !currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <header className="bg-white shadow-sm border-b-2 border-blue-100 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={handleExit}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-red-100 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300 text-red-600"
              aria-label="Exit session"
            >
              <X size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-600">
                Card {currentCardIndex + 1} of {cards.length}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-blue-600 tabular-nums">
              {score}/{cards.length}
            </div>
            <p className="text-xs text-gray-600">Score</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-4">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={currentCardIndex + 1}
              aria-valuemin={0}
              aria-valuemax={cards.length}
              aria-label={`Progress: ${currentCardIndex + 1} of ${cards.length} cards`}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <div className="mb-8">
            <Timer
              totalSeconds={totalTime}
              remainingSeconds={timeRemaining}
              variant="linear"
              size="large"
            />
          </div>

          <div
            className={`bg-white rounded-3xl shadow-2xl p-8 border-4 transition-all duration-300 ${
              feedback === 'correct'
                ? 'border-green-500 bg-green-50'
                : feedback === 'incorrect'
                ? 'border-red-500 bg-red-50'
                : 'border-blue-200'
            }`}
          >
            <div className="text-center mb-8">
              <p className="text-gray-600 text-xl mb-4 font-semibold">What is</p>
              <div className="text-8xl font-black text-gray-900 mb-4 tabular-nums">
                {currentCard.problem}
              </div>
              <p className="text-gray-600 text-xl font-semibold">?</p>
            </div>

            {feedback && (
              <div
                className={`mb-6 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl ${
                  feedback === 'correct'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {feedback === 'correct' ? (
                  <>
                    <Check size={28} />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <X size={28} />
                    <span>Incorrect! Answer: {currentCard.correctAnswer}</span>
                  </>
                )}
              </div>
            )}

            <NumberPad
              value={answer}
              onChange={setAnswer}
              onSubmit={handleSubmitAnswer}
              disabled={feedback !== null}
            />
          </div>
        </div>
      </main>

      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Session"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-yellow-900 mb-2">Are you sure?</p>
              <p className="text-yellow-700">
                Your progress will be saved, but the session will be marked as incomplete.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowExitModal(false)}
              variant="secondary"
              fullWidth
            >
              Continue Session
            </Button>
            <Button onClick={confirmExit} variant="danger" fullWidth>
              Exit Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
