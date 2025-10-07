import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSettings, updateSettings, clearAllData, StorageError } from '../storage';
import type { Settings } from '../types';
import { Button, Modal } from '../components';
import { useApp } from '../context';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { setSettings: setAppSettings } = useApp();
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentSettings = getSettings();
    setSettings(currentSettings);
  }, []);

  const toggleNumber = (num: number) => {
    const newIncludedNumbers = settings.includedNumbers.includes(num)
      ? settings.includedNumbers.filter((n) => n !== num)
      : [...settings.includedNumbers, num].sort((a, b) => a - b);

    setSettings({
      ...settings,
      includedNumbers: newIncludedNumbers,
    });
    setError('');
  };

  const handleCardsPerSessionChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setSettings({
        ...settings,
        cardsPerSession: num,
      });
      setError('');
    }
  };

  const handleTimeLimitChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setSettings({
        ...settings,
        timeLimit: num * 60,
      });
      setError('');
    }
  };

  const handleSave = () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedSettings = updateSettings(settings);
      setAppSettings(updatedSettings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof StorageError) {
        setError(err.message);
      } else {
        setError('Failed to save settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = () => {
    clearAllData();
    setIsClearDataModalOpen(false);
    navigate('/');
  };

  const selectAll = () => {
    setSettings({
      ...settings,
      includedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    });
  };

  const selectNone = () => {
    setSettings({
      ...settings,
      includedNumbers: [],
    });
  };

  const isNumberSelected = (num: number) => settings.includedNumbers.includes(num);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm border-b-2 border-blue-100">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate('/')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Go back to home"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2">
            <Save size={20} />
            {success}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Number Selection
          </h2>
          <p className="text-gray-600 mb-4">
            Choose which multiplication tables to practice (1-12):
          </p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAll}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-all active:scale-95"
            >
              Select All
            </button>
            <button
              onClick={selectNone}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all active:scale-95"
            >
              Select None
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`min-h-[60px] rounded-xl font-bold text-2xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                  isNumberSelected(num)
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl focus:ring-green-300'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 focus:ring-gray-300'
                }`}
                aria-label={`Toggle number ${num}`}
                aria-pressed={isNumberSelected(num)}
              >
                {num}
              </button>
            ))}
          </div>

          {settings.includedNumbers.length === 0 && (
            <p className="mt-4 text-sm text-red-600 font-semibold">
              Please select at least one number
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Session Settings
          </h2>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="cardsPerSession"
                className="block text-lg font-bold text-gray-800 mb-2"
              >
                Cards per Session: {settings.cardsPerSession}
              </label>
              <input
                id="cardsPerSession"
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.cardsPerSession}
                onChange={(e) => handleCardsPerSessionChange(e.target.value)}
                className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-label="Cards per session"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>10</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="timeLimit"
                className="block text-lg font-bold text-gray-800 mb-2"
              >
                Time Limit: {Math.floor(settings.timeLimit / 60)} minute
                {Math.floor(settings.timeLimit / 60) !== 1 ? 's' : ''}
              </label>
              <input
                id="timeLimit"
                type="range"
                min="1"
                max="30"
                step="1"
                value={Math.floor(settings.timeLimit / 60)}
                onChange={(e) => handleTimeLimitChange(e.target.value)}
                className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                aria-label="Time limit in minutes"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>1 min</span>
                <span>30 min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSave}
            variant="primary"
            fullWidth
            size="large"
            loading={loading}
            disabled={settings.includedNumbers.length === 0}
          >
            <Save size={24} className="inline mr-2" />
            Save Settings
          </Button>

          <Button
            onClick={() => setIsClearDataModalOpen(true)}
            variant="danger"
            fullWidth
            size="large"
          >
            <Trash2 size={24} className="inline mr-2" />
            Clear All Data
          </Button>
        </div>
      </main>

      <Modal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        title="Clear All Data"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-red-900 mb-2">Warning!</p>
              <p className="text-red-700">
                This will permanently delete ALL users, sessions, and settings. This action cannot be undone.
              </p>
            </div>
          </div>

          <p className="text-gray-700 font-semibold">
            Are you absolutely sure you want to continue?
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setIsClearDataModalOpen(false)}
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAllData}
              variant="danger"
              fullWidth
            >
              Yes, Clear Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
