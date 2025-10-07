# Weighted Randomization Algorithm

This directory contains the weighted randomization algorithm implementation for the Flash Cards application, using a max binary heap data structure.

## Files

### heap.ts
Full implementation of a Max Binary Heap data structure.

**Key Features:**
- Generic implementation supporting any value type with numeric priority
- O(log n) insertion and extraction operations
- O(1) peek and size operations
- Maintains max-heap property where parent priority >= children priorities

**API:**
- `insert(value: T, priority: number)`: Add element with priority
- `extractMax()`: Remove and return highest priority element
- `peek()`: View highest priority element without removing
- `size()`: Get number of elements
- `isEmpty()`: Check if heap is empty
- `getAll()`: Get all values (unordered)
- `clear()`: Remove all elements

### weightedRandom.ts
Weighted randomization algorithm for flash card generation.

**Key Features:**
- Analyzes wrong answers from past 3 sessions
- Weights numbers based on error frequency
- Pure random fallback when no wrong answers exist
- Generates unique problems per session
- Ensures problems respect included numbers setting

**API:**

#### `analyzeWrongAnswers(sessions: Session[]): Map<number, number>`
Analyzes sessions and counts frequency of each number (1-12) in wrong answers.
- Both operands of wrong answers are counted
- Returns Map of number to frequency count
- Numbers not appearing in wrong answers have frequency 0

#### `generateWeightedProblem(includedNumbers: number[], wrongAnswerFrequencies: Map<number, number>): {operand1: number, operand2: number}`
Generates a single problem with weighted randomization.
- Numbers with higher wrong answer frequency appear more often
- Falls back to pure random if no wrong answers
- Both operands guaranteed to be from includedNumbers

#### `generateSessionProblems(settings: Settings, userId: string): Omit<Card, 'userAnswer' | 'isCorrect'>[]`
Generates complete set of problems for a session.
- Gets last 3 sessions for user from storage
- Analyzes wrong answer patterns
- Generates cardsPerSession unique problems
- Shuffles final problem set for randomness
- Returns cards with problem, operands, and correctAnswer filled

## Algorithm Details

### Max Heap Implementation
The heap is implemented as a complete binary tree stored in an array:
- Parent of node at index i: `Math.floor((i - 1) / 2)`
- Left child of node at index i: `2 * i + 1`
- Right child of node at index i: `2 * i + 2`

Heap operations maintain the max-heap property through:
- **heapifyUp**: After insertion, bubble element up until heap property restored
- **heapifyDown**: After extraction, sink element down until heap property restored

### Weighted Random Selection
Uses a weighted probability distribution:
1. For each number, calculate weight = frequency + 1
   - Adding 1 ensures numbers with 0 frequency still have some chance
2. Calculate total weight = sum of all weights
3. Generate random value in range [0, totalWeight)
4. Iterate through numbers, subtracting weights, return when random <= 0

This ensures:
- Numbers with higher frequency have proportionally higher selection probability
- All numbers maintain some minimum selection probability
- Distribution is continuous and fair

### Problem Generation Strategy
1. Get last 3 sessions for user
2. Analyze wrong answers to build frequency map
3. For each required card:
   - Generate weighted problem using frequency map
   - Check for duplicate (exact same problem)
   - Retry if duplicate found (max attempts to prevent infinite loop)
4. If can't generate enough unique problems, fill remainder with pure random
5. Shuffle all problems for random order

### Edge Cases Handled
- Empty sessions array (no history) → pure random
- All answers correct in recent sessions → pure random
- Small includedNumbers set → may have duplicates, fills with random
- Invalid settings → throws descriptive errors
- Corrupted storage data → handled by storage layer

## Example Usage

```typescript
import { generateSessionProblems } from './algorithms/weightedRandom';
import { getSettings } from './storage';

// Generate problems for a user
const settings = getSettings();
const userId = 'user-123';
const problems = generateSessionProblems(settings, userId);

// problems is an array of card templates:
// [
//   { problem: '2×8', operand1: 2, operand2: 8, correctAnswer: 16 },
//   { problem: '3×7', operand1: 3, operand2: 7, correctAnswer: 21 },
//   ...
// ]
```

## Performance Characteristics

- **Heap Operations**: O(log n) for insert/extract, O(1) for peek/size
- **Analyze Wrong Answers**: O(s × c) where s = sessions, c = cards per session
- **Generate Problem**: O(n) where n = included numbers count
- **Generate Session**: O(m × n) where m = cards per session, n = included numbers
- **Space Complexity**: O(n) for heap, O(m) for problem set

## Testing Recommendations

To verify the algorithm works correctly:

1. **Test Heap Operations**
   - Insert elements and verify max is extracted first
   - Test with equal priorities
   - Test empty heap edge cases

2. **Test Wrong Answer Analysis**
   - Verify frequency counting is accurate
   - Test with no wrong answers
   - Test with all wrong answers

3. **Test Weighted Randomization**
   - Verify higher frequency numbers appear more often (statistical test)
   - Test pure random fallback
   - Verify all numbers can be selected

4. **Test Problem Generation**
   - Verify uniqueness constraint
   - Verify correct number of problems generated
   - Verify all problems use includedNumbers
   - Test edge cases (single number included, etc.)

## Integration Points

The algorithm integrates with:
- **Storage Layer** (`src/storage/index.ts`): Retrieves session history
- **Type System** (`src/types/index.ts`): Uses Session, Settings, Card types
- **Session Component**: Consumes generated problems for quiz session
- **Reports**: Wrong answer data used for statistics display
