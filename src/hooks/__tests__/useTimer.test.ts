/**
 * Tests for useTimer hook.
 *
 * Note: These are basic type and structure tests.
 * For full integration testing, consider using @testing-library/react-hooks.
 */

import { useTimer, useStopwatch } from '../useTimer';

// Basic smoke test - verify hooks are exported
const testUseTimerExists = () => {
  if (typeof useTimer !== 'function') {
    throw new Error('useTimer should be a function');
  }
};

const testUseStopwatchExists = () => {
  if (typeof useStopwatch !== 'function') {
    throw new Error('useStopwatch should be a function');
  }
};

testUseTimerExists();
testUseStopwatchExists();

// Manual integration test examples (run in browser/React environment):
/*
function TestComponent() {
  const timer = useTimer({
    initialTime: 60,
    onComplete: () => console.log('Timer completed!'),
    autoStart: false,
  });

  return (
    <div>
      <p>Time Left: {timer.timeLeft}s</p>
      <p>Is Running: {timer.isRunning ? 'Yes' : 'No'}</p>
      <p>Is Paused: {timer.isPaused ? 'Yes' : 'No'}</p>
      <button onClick={timer.start}>Start</button>
      <button onClick={timer.pause}>Pause</button>
      <button onClick={timer.resume}>Resume</button>
      <button onClick={timer.reset}>Reset</button>
    </div>
  );
}

// Expected behavior:
// 1. Initial state: timeLeft=60, isRunning=false, isPaused=false
// 2. After start(): isRunning=true, timeLeft counts down
// 3. After pause(): isRunning=false, isPaused=true, timeLeft stops
// 4. After resume(): isRunning=true, isPaused=false, timeLeft continues
// 5. After reset(): timeLeft=60, isRunning=false, isPaused=false
// 6. When timeLeft reaches 0: onComplete is called, isRunning=false
*/
