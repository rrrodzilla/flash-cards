/**
 * Tests for useSession hook.
 *
 * Note: These are basic type and structure tests.
 * For full integration testing, consider using @testing-library/react-hooks.
 */

import { useSession } from '../useSession';

// Basic smoke test - verify hook is exported
const testUseSessionExists = () => {
  if (typeof useSession !== 'function') {
    throw new Error('useSession should be a function');
  }
};

testUseSessionExists();

// Manual integration test examples (run in browser/React environment):
/*
function TestComponent() {
  const settings = {
    includedNumbers: [1, 2, 3, 4, 5],
    cardsPerSession: 10,
    timeLimit: 300,
  };

  const session = useSession({
    userId: 'test-user-id',
    settings,
    onComplete: (s) => console.log('Session completed:', s),
    onTimeout: (s) => console.log('Session timed out:', s),
  });

  return (
    <div>
      <p>Current Card: {session.currentCard?.problem}</p>
      <p>Progress: {session.progress.completed}/{session.progress.total}</p>
      <p>Is Complete: {session.isComplete ? 'Yes' : 'No'}</p>
      <button onClick={session.startSession}>Start Session</button>
      <button onClick={() => session.submitAnswer(12)}>Submit Answer (12)</button>
      <button onClick={() => session.endSession(false)}>End Session</button>
      <button onClick={session.resetSession}>Reset Session</button>
    </div>
  );
}

// Expected behavior:
// 1. Initial state: session=null, currentCard=null, progress.completed=0
// 2. After startSession(): session created, currentCard is first problem
// 3. After submitAnswer(): current card updates to next, progress increments
// 4. When all cards answered: isComplete=true, onComplete called
// 5. After endSession(true): onTimeout called
// 6. After resetSession(): back to initial state
*/
