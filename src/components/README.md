# Component Library

A complete, production-ready component library optimized for mobile users aged 8-12. Built with React, TypeScript, and Tailwind CSS v4.

## Features

- **Mobile-First Design**: All components optimized for touch interactions
- **Touch-Friendly**: Minimum 44px touch targets on all interactive elements
- **Accessible**: Full ARIA labels, keyboard navigation, and screen reader support
- **Kid-Friendly**: Bright, colorful design with fun animations
- **TypeScript**: Fully typed with comprehensive prop interfaces
- **Production-Ready**: Zero linting errors, zero TypeScript errors

## Components

### 1. Button

A versatile button component with multiple variants and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' (default: 'primary')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `loading`: boolean (default: false)
- `fullWidth`: boolean (default: false)
- `disabled`: boolean
- All standard HTML button attributes

**Features:**
- Minimum 44px height on all sizes
- Loading state with spinner animation
- Active scale animation on press
- Focus ring for keyboard navigation
- Gradient backgrounds with hover effects

**Example:**
```tsx
<Button variant="primary" size="large" onClick={handleClick}>
  Start Game
</Button>

<Button variant="danger" loading={isLoading}>
  Delete
</Button>
```

### 2. Input

A text/number input component with validation and error states.

**Props:**
- `label`: string (optional)
- `error`: string (optional)
- `helperText`: string (optional)
- `fullWidth`: boolean (default: false)
- `inputSize`: 'small' | 'medium' | 'large' (default: 'medium')
- All standard HTML input attributes

**Features:**
- Minimum 44px height
- Error state with icon and message
- Helper text support
- Large, easy-to-tap input area
- Automatic ID generation for accessibility

**Example:**
```tsx
<Input
  label="Your Name"
  type="text"
  placeholder="Enter your name"
  helperText="This will be displayed on your report"
/>

<Input
  label="Time Limit"
  type="number"
  min={60}
  max={600}
  error="Time must be between 60 and 600 seconds"
/>
```

### 3. Card

A container component with elevation and padding variants.

**Props:**
- `variant`: 'flat' | 'elevated' | 'outlined' (default: 'elevated')
- `padding`: 'none' | 'small' | 'medium' | 'large' (default: 'medium')
- `onClick`: function (optional, makes card interactive)
- `children`: React.ReactNode

**Features:**
- Rounded corners (24px radius)
- Shadow variants for depth
- Interactive state when onClick provided
- Smooth hover animations

**Example:**
```tsx
<Card variant="elevated" padding="large">
  <h2>Your Score</h2>
  <p>Great job!</p>
</Card>

<Card variant="outlined" padding="medium" onClick={handleUserSelect}>
  <p>Select User</p>
</Card>
```

### 4. Modal

A full-featured modal dialog with accessibility and animations.

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string (optional)
- `showCloseButton`: boolean (default: true)
- `closeOnBackdropClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `children`: React.ReactNode

**Features:**
- Full-screen overlay with backdrop blur
- Focus trap (Tab navigation stays within modal)
- Escape key to close
- Click outside to close
- Restores focus on close
- Fade-in and slide-up animations
- Accessible with ARIA attributes

**Example:**
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Settings"
>
  <p>Configure your game settings here.</p>
  <Button onClick={() => setShowModal(false)}>Done</Button>
</Modal>
```

### 5. Timer

A visual timer component with progress bar or circular display.

**Props:**
- `totalSeconds`: number
- `remainingSeconds`: number
- `isPaused`: boolean (default: false)
- `variant`: 'linear' | 'circular' (default: 'linear')
- `showNumbers`: boolean (default: true)
- `size`: 'small' | 'medium' | 'large' (default: 'medium')

**Features:**
- Color-coded by urgency (green → yellow → red)
- Pulse animation when critical (≤10% remaining)
- Linear progress bar or circular SVG timer
- Large, readable numbers
- Accessible with ARIA live regions

**Example:**
```tsx
<Timer
  totalSeconds={300}
  remainingSeconds={45}
  variant="linear"
  size="large"
/>

<Timer
  totalSeconds={300}
  remainingSeconds={180}
  variant="circular"
  size="medium"
/>
```

### 6. NumberPad

A numeric keypad for answer input with keyboard support.

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `onSubmit`: function (optional)
- `maxLength`: number (default: 3)
- `disabled`: boolean (default: false)

**Features:**
- Large touch-friendly buttons (64px height)
- Display area showing current value
- Backspace and clear buttons
- Submit button (when onSubmit provided)
- Full keyboard support (0-9, Backspace, Enter, Escape)
- Colorful gradient buttons
- Tactile visual feedback

**Example:**
```tsx
const [answer, setAnswer] = useState('0');

<NumberPad
  value={answer}
  onChange={setAnswer}
  onSubmit={handleSubmit}
  maxLength={3}
/>
```

### 7. ScoreDisplay

An animated score display with celebratory elements.

**Props:**
- `score`: number
- `total`: number
- `animate`: boolean (default: true)
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `showPercentage`: boolean (default: true)

**Features:**
- Animated number counting
- Color-coded by performance (green for 90%+, blue for 75%+, etc.)
- Emoji feedback
- Encouraging messages
- Stars for perfect scores (90%+)
- Bounce animation on load

**Example:**
```tsx
<ScoreDisplay
  score={18}
  total={20}
  animate={true}
  size="large"
/>
```

### 8. LoadingSpinner

A kid-friendly loading animation.

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `color`: 'primary' | 'secondary' | 'white' (default: 'primary')
- `message`: string (optional)
- `fullScreen`: boolean (default: false)

**Features:**
- Spinning circular animation
- Pulsing center dot
- Optional loading message
- Full-screen overlay mode
- ARIA busy state for screen readers

**Example:**
```tsx
<LoadingSpinner size="large" message="Loading your game..." />

<LoadingSpinner fullScreen message="Please wait..." />
```

## Usage

Import components from the barrel export:

```tsx
import {
  Button,
  Input,
  Card,
  Modal,
  Timer,
  NumberPad,
  ScoreDisplay,
  LoadingSpinner,
} from './components';
```

## Accessibility Features

All components include:
- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** (visible focus rings)
- **Semantic HTML** elements
- **Touch-friendly** sizing (44px minimum)
- **Color contrast** compliance
- **Live regions** for dynamic content

## Mobile Optimizations

- **Touch targets**: All interactive elements ≥44px
- **Tap highlight**: Disabled for custom touch feedback
- **Active states**: Scale animations on press
- **Touch action**: Manipulation mode to prevent delays
- **Viewport**: Optimized for mobile screens
- **Performance**: Hardware-accelerated animations

## Design System

### Colors
- **Primary**: Blue gradients (#3b82f6 → #2563eb)
- **Secondary**: Purple gradients (#a855f7 → #7e22ce)
- **Danger**: Red gradients (#ef4444 → #dc2626)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)

### Typography
- **Font**: System fonts for fast loading
- **Sizes**: Large, readable text for kids
- **Weight**: Bold for emphasis

### Spacing
- **Touch targets**: 44px minimum
- **Padding**: 4px, 8px, 12px, 16px, 24px, 32px
- **Gaps**: Consistent spacing throughout

### Animations
- **Duration**: 200-1000ms
- **Easing**: ease-in-out, ease-out
- **Transform**: Scale, translate
- **Opacity**: Fade effects
