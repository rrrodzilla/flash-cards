import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Modal } from './Modal';
import { Timer } from './Timer';
import { NumberPad } from './NumberPad';
import { ScoreDisplay } from './ScoreDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { ProgressBar } from './ProgressBar';
import { ConfettiOverlay } from './ConfettiOverlay';
import { Toast } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * ComponentDemo
 *
 * A comprehensive demo page showcasing all UI components.
 * Used for testing and visual verification during development.
 */
export const ComponentDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [numberPadValue, setNumberPadValue] = useState('0');
  const [inputValue, setInputValue] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ show: false, message: '', type: 'info' });

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Component Library Demo
            </h1>
            <p className="text-gray-600">
              Testing all production-ready UI components
            </p>
          </header>

          {/* Buttons */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Buttons</h2>
            <Card padding="large">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" size="small">
                    Small Primary
                  </Button>
                  <Button variant="secondary" size="medium">
                    Medium Secondary
                  </Button>
                  <Button variant="danger" size="large">
                    Large Danger
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" loading>
                    Loading
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                  <Button variant="primary" fullWidth>
                    Full Width
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Inputs</h2>
            <Card padding="large">
              <div className="space-y-4">
                <Input
                  label="Your Name"
                  placeholder="Enter your name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  fullWidth
                />
                <Input
                  label="With Error"
                  placeholder="Enter something"
                  error="This field is required"
                  fullWidth
                />
                <Input
                  label="With Helper Text"
                  placeholder="Enter your age"
                  helperText="Must be between 8 and 12"
                  fullWidth
                />
                <Input
                  label="Disabled"
                  placeholder="Can't type here"
                  disabled
                  fullWidth
                />
              </div>
            </Card>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="flat" padding="medium">
                <h3 className="font-bold text-lg mb-2">Flat Card</h3>
                <p className="text-gray-600">No shadow</p>
              </Card>
              <Card variant="elevated" padding="medium">
                <h3 className="font-bold text-lg mb-2">Elevated Card</h3>
                <p className="text-gray-600">With shadow</p>
              </Card>
              <Card variant="outlined" padding="medium">
                <h3 className="font-bold text-lg mb-2">Outlined Card</h3>
                <p className="text-gray-600">With border</p>
              </Card>
            </div>
            <div className="mt-4">
              <Card
                variant="elevated"
                padding="large"
                onClick={() => alert('Card clicked!')}
              >
                <h3 className="font-bold text-lg mb-2">Interactive Card</h3>
                <p className="text-gray-600">Click me!</p>
              </Card>
            </div>
          </section>

          {/* Modal */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Modal</h2>
            <Card padding="large">
              <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
              <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Example Modal"
              >
                <p className="text-gray-700 mb-4">
                  This is a modal dialog with focus management and keyboard navigation.
                </p>
                <Button onClick={() => setModalOpen(false)} fullWidth>
                  Close Modal
                </Button>
              </Modal>
            </Card>
          </section>

          {/* Timer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Timer</h2>
            <Card padding="large">
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold mb-4">Linear Timer</h3>
                  <Timer
                    totalSeconds={300}
                    remainingSeconds={180}
                    variant="linear"
                    size="medium"
                  />
                </div>
                <div>
                  <h3 className="font-bold mb-4">Circular Timer</h3>
                  <div className="flex justify-center">
                    <Timer
                      totalSeconds={300}
                      remainingSeconds={45}
                      variant="circular"
                      size="large"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* NumberPad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Number Pad</h2>
            <Card padding="large">
              <NumberPad
                value={numberPadValue}
                onChange={setNumberPadValue}
                onSubmit={() => alert(`Submitted: ${numberPadValue}`)}
              />
            </Card>
          </section>

          {/* ScoreDisplay */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Score Display</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreDisplay score={18} total={20} size="medium" />
              <ScoreDisplay score={12} total={20} size="medium" />
            </div>
          </section>

          {/* ProgressBar */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Progress Bar</h2>
            <Card padding="large">
              <div className="space-y-4">
                <ProgressBar current={7} max={20} variant="default" />
                <ProgressBar current={15} max={20} variant="success" />
                <ProgressBar current={18} max={20} variant="warning" />
                <ProgressBar current={20} max={20} variant="danger" showPercentage />
              </div>
            </Card>
          </section>

          {/* LoadingSpinner */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Spinner</h2>
            <Card padding="large">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <LoadingSpinner size="small" color="primary" message="Loading..." />
                <LoadingSpinner size="medium" color="secondary" message="Processing..." />
                <LoadingSpinner size="large" color="primary" message="Please wait..." />
              </div>
            </Card>
          </section>

          {/* Toast & Confetti */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Toast & Confetti
            </h2>
            <Card padding="large">
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() =>
                    setToast({ show: true, message: 'Success!', type: 'success' })
                  }
                  variant="primary"
                >
                  Show Success Toast
                </Button>
                <Button
                  onClick={() =>
                    setToast({ show: true, message: 'Error occurred!', type: 'error' })
                  }
                  variant="danger"
                >
                  Show Error Toast
                </Button>
                <Button
                  onClick={() => setShowConfetti(true)}
                  variant="secondary"
                >
                  Trigger Confetti
                </Button>
              </div>
            </Card>
          </section>

          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.show}
            onDismiss={() => setToast({ ...toast, show: false })}
          />

          <ConfettiOverlay
            isActive={showConfetti}
            onComplete={() => setShowConfetti(false)}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};
