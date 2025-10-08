import { useParams, useNavigate } from "react-router-dom";
import { X, Check, AlertTriangle, Star, Eye } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUser,
  getSettings,
  createSession,
  updateSession,
  getCurrentSession,
} from "../storage";
import { generateSessionProblems } from "../algorithms/weightedRandom";
import type { Card } from "../types";
import { StorageKeys } from "../types";
import {
  NumberPad,
  Timer,
  Modal,
  Button,
  ConfettiOverlay,
  SkipLink,
  SessionPageSkeleton,
  ArrayVisualization,
} from "../components";
import { StarBurst } from "../components/StarBurst";

interface SessionCard extends Omit<Card, "userAnswer" | "isCorrect"> {
  userAnswer?: number;
  isCorrect?: boolean;
}

export default function SessionPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [cards, setCards] = useState<SessionCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answer, setAnswer] = useState("0");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [showExitModal, setShowExitModal] = useState(false);
  const [showStarBurst, setShowStarBurst] = useState(false);
  const [showStreakConfetti, setShowStreakConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [milestoneReached, setMilestoneReached] = useState<number | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [waitingForContinue, setWaitingForContinue] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  // Track which session we've initialized to prevent duplicates in Strict Mode
  const initializedSessionIdRef = useRef<string | null>(null);

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

    // Clear current session marker
    localStorage.removeItem(StorageKeys.CURRENT_SESSION);

    navigate("/session-end", {
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
      navigate("/users");
      return;
    }

    const loadedUser = getUser(userId);
    if (!loadedUser) {
      navigate("/users");
      return;
    }

    setUser(loadedUser);

    // Check if there's already a current session in progress
    // This prevents duplicate session creation in React Strict Mode
    const existingSession = getCurrentSession(userId);

    if (
      existingSession &&
      initializedSessionIdRef.current === existingSession.sessionId
    ) {
      // We've already initialized this session, skip
      return;
    }

    if (existingSession) {
      // Resume existing session
      const settings = getSettings();
      const generatedProblems = generateSessionProblems(settings, userId);
      setCards(generatedProblems);
      initializedSessionIdRef.current = existingSession.sessionId;
      setSessionId(existingSession.sessionId);
      setTotalTime(settings.timeLimit);
      setTimeRemaining(settings.timeLimit);
      startTimeRef.current = Date.now();
    } else {
      // Create new session
      const settings = getSettings();
      const generatedProblems = generateSessionProblems(settings, userId);
      setCards(generatedProblems);

      const session = createSession(userId, settings);
      localStorage.setItem(StorageKeys.CURRENT_SESSION, session.sessionId);

      initializedSessionIdRef.current = session.sessionId;
      setSessionId(session.sessionId);
      setTotalTime(settings.timeLimit);
      setTimeRemaining(settings.timeLimit);
      startTimeRef.current = Date.now();
    }

    return () => {
      // Clean up timer
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [userId, navigate]);

  // Separate effect for timer to ensure it always runs when sessionId is set
  useEffect(() => {
    // Only start timer if we have a valid session and timer is not already running
    if (!sessionId || timerRef.current !== null) {
      return;
    }

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
        timerRef.current = null;
      }
    };
  }, [sessionId, handleTimeout]);

  // Keyboard shortcut for "Show Me How" (H key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === "h" || e.key === "H") && feedback === null) {
        setShowVisualization((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [feedback]);

  // P1 feature: Check if user has seen tutorial (onboarding)
  useEffect(() => {
    if (!userId) return;

    const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${userId}`);
    if (!hasSeenTutorial && currentCardIndex === 0 && cards.length > 0) {
      setShowOnboarding(true);
    }
  }, [userId, currentCardIndex, cards.length]);

  const handleSessionComplete = useCallback(
    (completedCards: Card[]) => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const elapsedTime = Math.floor(
        (Date.now() - startTimeRef.current) / 1000,
      );
      const finalScore = completedCards.filter(
        (c) => c.isCorrect && c.countsTowardScore !== false,
      ).length;

      updateSession(sessionId, {
        cards: completedCards,
        score: finalScore,
        totalCards: cards.length,
        finishTime: elapsedTime,
        timedOut: false,
      });

      // Clear current session marker
      localStorage.removeItem(StorageKeys.CURRENT_SESSION);

      navigate("/session-end", {
        state: {
          timedOut: false,
          score: finalScore,
          totalCards: cards.length,
          finishTime: elapsedTime,
          userId,
        },
      });
    },
    [sessionId, cards.length, userId, navigate],
  );

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
      visualizationShown: showVisualization,
      countsTowardScore: !showVisualization, // Don't count if user viewed explanation
    };

    const updatedCards = [...cards];
    updatedCards[currentCardIndex] = updatedCard;
    setCards(updatedCards);

    if (isCorrect) {
      // Always show correct feedback when answer is correct
      setFeedback("correct");
      setShowStarBurst(true);

      // Only increment score and streak if visualization was NOT shown
      if (!showVisualization) {
        setScore((prev) => prev + 1);

        setStreak((prev) => {
          const newStreak = prev + 1;
          if (newStreak >= 3) {
            setShowStreakConfetti(true);
          }
          return newStreak;
        });

        const newProgress = ((currentCardIndex + 1) / cards.length) * 100;
        const milestones = [25, 50, 75, 100];
        const reachedMilestone = milestones.find(
          (m) => newProgress >= m && (currentCardIndex / cards.length) * 100 < m,
        );

        if (reachedMilestone) {
          setMilestoneReached(reachedMilestone);
          setTimeout(() => setMilestoneReached(null), 1000);
        }
      }
    } else {
      // Answer is incorrect
      setFeedback("incorrect");
      setStreak(0);
      setWaitingForContinue(true);
    }

    // Only auto-advance on correct answers
    if (isCorrect) {
      setTimeout(() => {
        setFeedback(null);
        setAnswer("0");
        setShowVisualization(false);

        if (currentCardIndex + 1 >= cards.length) {
          handleSessionComplete(updatedCards as Card[]);
        } else {
          setCurrentCardIndex((prev) => prev + 1);
        }
      }, 1500);
    }
  }, [
    answer,
    currentCardIndex,
    cards,
    feedback,
    handleSessionComplete,
    showVisualization,
  ]);

  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleContinueAfterIncorrect = () => {
    setWaitingForContinue(false);
    setFeedback(null);
    setAnswer("0");
    setShowVisualization(false);

    if (currentCardIndex + 1 >= cards.length) {
      handleSessionComplete(cards as Card[]);
    } else {
      setCurrentCardIndex((prev) => prev + 1);
    }
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

    // Clear current session marker
    localStorage.removeItem(StorageKeys.CURRENT_SESSION);

    navigate("/users");
  };

  const currentCard = cards[currentCardIndex];
  const progress =
    cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;
  const milestones = [25, 50, 75, 100];

  if (!user || !currentCard) {
    return <SessionPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <SkipLink />
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
            <div
              className="text-2xl font-black text-blue-600 tabular-nums"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Current score: ${score} out of ${cards.length}`}
            >
              {score}/{cards.length}
            </div>
            <p className="text-xs text-gray-600">Score</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-4 relative">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out ${
                milestoneReached ? "animate-milestonePulse" : ""
              }`}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={currentCardIndex + 1}
              aria-valuemin={0}
              aria-valuemax={cards.length}
              aria-label={`Progress: ${currentCardIndex + 1} of ${cards.length} cards`}
            />
          </div>

          {milestones.map((milestone) => {
            const milestonePosition = milestone;
            const isPassed = progress >= milestone;

            return (
              <div
                key={milestone}
                className="absolute top-0 transform -translate-y-1/2"
                style={{ left: `${milestonePosition}%` }}
              >
                <Star
                  size={20}
                  className={`transform -translate-x-1/2 transition-all duration-300 ${
                    isPassed
                      ? "text-yellow-500 fill-yellow-500 scale-110"
                      : "text-gray-400"
                  } ${
                    milestoneReached === milestone
                      ? "animate-milestonePulse"
                      : ""
                  }`}
                  aria-label={`${milestone}% milestone ${isPassed ? "reached" : "not reached"}`}
                />
              </div>
            );
          })}
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-col items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <div className="mb-8" aria-live="polite" aria-atomic="true">
            <Timer
              totalSeconds={totalTime}
              remainingSeconds={timeRemaining}
              variant="linear"
              size="large"
            />
          </div>

          <div
            className={`bg-white rounded-3xl shadow-2xl p-8 border-4 transition-all duration-300 relative ${
              feedback === "correct"
                ? "border-green-500 bg-green-50 animate-cardPulse"
                : feedback === "incorrect"
                  ? "border-red-500 bg-red-50 animate-shake"
                  : "border-blue-200"
            }`}
          >
            {showStarBurst && (
              <StarBurst
                isActive={showStarBurst}
                onComplete={() => setShowStarBurst(false)}
                duration={1000}
                starCount={12}
              />
            )}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-xl mb-0 font-semibold">
                What is
              </p>
              <div className="text-8xl font-black text-gray-900 mb-0 tabular-nums">
                {currentCard.problem}
              </div>
              <p className="text-gray-600 text-xl font-semibold">?</p>
            </div>

            {/* Show Me How Button */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => setShowVisualization((prev) => !prev)}
                disabled={feedback !== null}
                className="px-6 py-3 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
                aria-label="Show visual explanation of how to solve this problem"
                aria-expanded={showVisualization}
              >
                <Eye size={20} />
                {showVisualization ? "Hide Explanation" : "Show Me How"}
              </button>
            </div>

            {/* Visualization Display */}
            {showVisualization && (
              <div className="mb-6 animate-fadeIn">
                <ArrayVisualization
                  operand1={currentCard.operand1}
                  operand2={currentCard.operand2}
                  correctAnswer={currentCard.correctAnswer}
                  variant="full"
                />
              </div>
            )}

            {feedback && (
              <div className="mb-6 space-y-4">
                {feedback === "correct" ? (
                  <div
                    className="p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl bg-green-100 text-green-700"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                  >
                    <Check size={28} />
                    <span>
                      Correct! {streak >= 3 && `🔥 ${streak} in a row!`}
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className="p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl bg-red-100 text-red-700"
                      role="alert"
                      aria-live="assertive"
                      aria-atomic="true"
                    >
                      <X size={28} />
                      <span>
                        Incorrect! Answer: {currentCard.correctAnswer}
                      </span>
                    </div>

                    {/* Enhanced P1 feature: Show compact visualization on incorrect answer */}
                    <div className="animate-fadeIn">
                      <p className="text-lg font-semibold text-gray-700 mb-2 text-center">
                        Let's see why:
                      </p>
                      <ArrayVisualization
                        operand1={currentCard.operand1}
                        operand2={currentCard.operand2}
                        correctAnswer={currentCard.correctAnswer}
                        variant="compact"
                      />
                    </div>

                    {/* Continue button for incorrect answers */}
                    {waitingForContinue && (
                      <div className="mt-6 flex justify-center animate-fadeIn">
                        <Button
                          onClick={handleContinueAfterIncorrect}
                          variant="primary"
                          fullWidth
                          className="min-h-[56px] text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          aria-label="Continue to next problem"
                        >
                          Got It! 👍
                        </Button>
                      </div>
                    )}
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

      <ConfettiOverlay
        isActive={showStreakConfetti}
        duration={2000}
        pieceCount={30}
        onComplete={() => setShowStreakConfetti(false)}
      />

      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Session"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <AlertTriangle
              size={24}
              className="text-yellow-600 flex-shrink-0 mt-1"
            />
            <div>
              <p className="font-bold text-yellow-900 mb-2">Are you sure?</p>
              <p className="text-yellow-700">
                Your progress will be saved, but the session will be marked as
                incomplete.
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

      {/* P1 feature: First-time onboarding modal */}
      <Modal
        isOpen={showOnboarding}
        onClose={() => {
          localStorage.setItem(`tutorial_seen_${userId}`, "true");
          setShowOnboarding(false);
        }}
        title="💡 Helpful Tip!"
      >
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            If you're stuck on a problem, tap{" "}
            <strong className="text-purple-600">"Show Me How"</strong> to see a
            visual explanation!
          </p>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 mb-3">
              Here's an example for 3 × 4:
            </p>
            <ArrayVisualization
              operand1={3}
              operand2={4}
              correctAnswer={12}
              variant="compact"
            />
          </div>

          <Button
            onClick={() => {
              localStorage.setItem(`tutorial_seen_${userId}`, "true");
              setShowOnboarding(false);
            }}
            variant="primary"
            fullWidth
          >
            Got It! Let's Start
          </Button>
        </div>
      </Modal>
    </div>
  );
}
