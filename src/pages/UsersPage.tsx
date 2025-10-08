import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, BarChart3, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser, getSessions, StorageError } from '../storage';
import type { User } from '../types';
import { Input, Button, Modal, SkipLink, UserCardSkeleton } from '../components';
import { useApp } from '../context';

export default function UsersPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadUsers = () => {
    const loadedUsers = getUsers();
    setUsers(loadedUsers);
  };

  useEffect(() => {
    loadUsers();
    setTimeout(() => setInitialLoading(false), 300);
  }, []);

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = createUser(newUserName.trim());
      setUsers([...users, user]);
      setNewUserName('');
      setIsAddModalOpen(false);
    } catch (err) {
      if (err instanceof StorageError) {
        setError(err.message);
      } else {
        setError('Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmed(false);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = () => {
    if (!userToDelete || !deleteConfirmed) return;

    const success = deleteUser(userToDelete.id);

    if (success) {
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setDeleteConfirmed(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    navigate(`/session/${user.id}`);
  };

  const handleViewReports = (user: User) => {
    navigate(`/reports/${user.id}`);
  };

  const getUserStats = (userId: string) => {
    const sessions = getSessions(userId);
    const totalSessions = sessions.length;
    const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0);
    const totalCards = sessions.reduce((sum, s) => sum + s.totalCards, 0);
    const avgScore = totalCards > 0 ? Math.round((totalCorrect / totalCards) * 100) : 0;

    return { totalSessions, avgScore };
  };

  const getUserAvatar = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-teal-400 to-teal-600',
    ];

    const charCode = name.charCodeAt(0) || 0;
    const colorIndex = charCode % colors.length;
    const initial = name.charAt(0).toUpperCase();

    return (
      <div className={`w-16 h-16 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
        {initial}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <SkipLink />
      <header className="bg-white shadow-sm border-b-2 border-blue-100">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate('/')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Go back to home"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Select User</h1>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="p-4 max-w-4xl mx-auto">
        {users.length > 0 && (
          <div className="mb-6">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              fullWidth
              size="large"
            >
              <UserPlus size={24} className="inline mr-2" />
              Add New User
            </Button>
          </div>
        )}

        {initialLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 flex gap-4 justify-center items-center">
              <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎯</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🌟</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎮</span>
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-3">Let's create your first player! 🌟</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">Choose a name and start your math adventure!</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              size="large"
              className="animate-bounce"
            >
              <UserPlus size={24} className="inline mr-2" />
              Create First Player
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => {
              const stats = getUserStats(user.id);

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border-2 border-gray-100"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {getUserAvatar(user.name)}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg">🏅</span>
                        <p className="text-sm text-gray-600 font-medium">
                          {stats.totalSessions} session{stats.totalSessions !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {stats.totalSessions > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-gray-200"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - stats.avgScore / 100)}`}
                                className={`${
                                  stats.avgScore >= 80
                                    ? 'text-green-500'
                                    : stats.avgScore >= 60
                                    ? 'text-blue-500'
                                    : 'text-orange-500'
                                } transition-all duration-500`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-700">
                                {stats.avgScore}%
                              </span>
                            </div>
                          </div>
                          {stats.avgScore >= 80 && (
                            <span className="text-xl animate-bounce">🏆</span>
                          )}
                          <p className="text-sm font-semibold text-blue-600">
                            Average Score
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectUser(user)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 min-h-[52px] focus:outline-none focus:ring-4 focus:ring-green-300"
                        aria-label={`Start session for ${user.name}`}
                      >
                        <Play size={20} />
                        <span>Start</span>
                      </button>

                      <button
                        onClick={() => handleViewReports(user)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 min-h-[52px] focus:outline-none focus:ring-4 focus:ring-blue-300"
                        aria-label={`View reports for ${user.name}`}
                      >
                        <BarChart3 size={20} />
                      </button>
                    </div>

                    <button
                      onClick={() => confirmDelete(user)}
                      className="w-full flex items-center justify-center gap-1 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label={`Delete ${user.name}`}
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewUserName('');
          setError('');
        }}
        title="Add New User"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newUserName}
            onChange={(e) => {
              setNewUserName(e.target.value);
              setError('');
            }}
            placeholder="Enter user name"
            error={error}
            fullWidth
            inputSize="large"
            maxLength={100}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUser();
              }
            }}
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                setNewUserName('');
                setError('');
              }}
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!newUserName.trim()}
            >
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
          setDeleteConfirmed(false);
        }}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-700 text-lg">
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
          </p>
          <p className="text-sm text-red-600 font-semibold">
            This will also delete all session data for this user. This action cannot be undone.
          </p>

          {!deleteConfirmed ? (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                  setDeleteConfirmed(false);
                }}
                variant="secondary"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={() => setDeleteConfirmed(true)}
                variant="danger"
                fullWidth
              >
                Yes, Delete
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <p className="text-red-800 font-bold text-center text-lg mb-2">
                  Are you absolutely sure?
                </p>
                <p className="text-red-700 text-sm text-center">
                  Click "Confirm Delete" below to permanently remove {userToDelete?.name} and all their data.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteConfirmed(false)}
                  variant="secondary"
                  fullWidth
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  variant="danger"
                  fullWidth
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
