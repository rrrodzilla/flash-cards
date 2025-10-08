import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Zap, Clock, Flame } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getUser, getSessions, getSettings } from '../storage';
import type { Session } from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../components/ui/chart';
import {
  StatCard,
  AchievementBadge,
  SkipLink,
  ReportsPageSkeleton,
  SessionCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components';

export default function ReportsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

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
    const userSessions = getSessions(userId);
    setSessions(userSessions);
  }, [userId, navigate]);

  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalCards: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        avgScore: 0,
        bestScore: 0,
        avgTime: 0,
        fastestTime: 0,
        currentStreak: 0,
        totalPracticeTime: 0,
      };
    }

    const totalCards = sessions.reduce((sum, s) => sum + s.totalCards, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0);
    const totalIncorrect = totalCards - totalCorrect;
    const avgScore = totalCards > 0 ? Math.round((totalCorrect / totalCards) * 100) : 0;
    const bestScore = Math.max(
      ...sessions.map((s) => (s.totalCards > 0 ? (s.score / s.totalCards) * 100 : 0))
    );

    const completedSessions = sessions.filter((s) => !s.timedOut && s.finishTime);
    const avgTime =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.finishTime || 0), 0) /
              completedSessions.length
          )
        : 0;

    const fastestTime =
      completedSessions.length > 0
        ? Math.min(...completedSessions.map((s) => s.finishTime || Infinity))
        : 0;

    let currentStreak = 0;
    const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
    for (const session of sortedSessions) {
      if (session.score / session.totalCards >= 0.6) {
        currentStreak++;
      } else {
        break;
      }
    }

    const settings = getSettings();
    const totalPracticeTime = sessions.reduce((sum, s) => {
      if (s.finishTime) return sum + s.finishTime;
      // For timed out sessions, count the full time limit
      if (s.timedOut) return sum + settings.timeLimit;
      return sum;
    }, 0);

    return {
      totalSessions: sessions.length,
      totalCards,
      totalCorrect,
      totalIncorrect,
      avgScore,
      bestScore: Math.round(bestScore),
      avgTime,
      fastestTime,
      currentStreak,
      totalPracticeTime,
    };
  }, [sessions]);

  const achievements = useMemo(() => {
    const hasQuickLearner = sessions.some(
      (s) => s.finishTime && s.finishTime <= 300 && !s.timedOut
    );
    const hasPerfectRound = sessions.some((s) => s.score === s.totalCards && s.totalCards > 0);
    const hasDedicated = (() => {
      if (sessions.length < 5) return false;
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return sessions.filter((s) => s.timestamp >= oneWeekAgo).length >= 5;
    })();
    const hasNumberMaster = (() => {
      const recentSessions = sessions.slice(0, 3);
      if (recentSessions.length === 0) return false;
      const avgScore =
        recentSessions.reduce((sum, s) => sum + s.score / s.totalCards, 0) / recentSessions.length;
      return avgScore >= 0.95;
    })();

    return [
      {
        title: 'Quick Learner',
        description: 'Complete in under 5 min',
        icon: '⚡',
        earned: hasQuickLearner,
      },
      {
        title: 'Perfect Round',
        description: '100% score achieved',
        icon: '🏆',
        earned: hasPerfectRound,
      },
      {
        title: 'Dedicated',
        description: '5 sessions in one week',
        icon: '🎯',
        earned: hasDedicated,
      },
      {
        title: 'Number Master',
        description: 'Master all numbers',
        icon: '🌟',
        earned: hasNumberMaster,
      },
    ];
  }, [sessions]);

  const scoreChartConfig = {
    score: {
      label: 'Score',
      color: '#3B82F6',
    },
  } satisfies ChartConfig;

  const practiceChartConfig = {
    opportunities: {
      label: 'Practice Count',
      color: '#10B981',
    },
  } satisfies ChartConfig;

  const scoreOverTimeData = useMemo(() => {
    return sessions
      .slice()
      .reverse()
      .map((session, index) => {
        const score = session.totalCards > 0 ? Math.round((session.score / session.totalCards) * 100) : 0;
        const prevSession = index > 0 ? sessions[sessions.length - index] : null;
        const prevScore = prevSession && prevSession.totalCards > 0
          ? Math.round((prevSession.score / prevSession.totalCards) * 100)
          : 0;

        return {
          session: index + 1,
          score,
          improvement: prevSession ? score - prevScore : 0,
          date: new Date(session.timestamp).toLocaleDateString(),
        };
      });
  }, [sessions]);

  const practiceNumbersData = useMemo(() => {
    const numberFrequencies: Record<number, { total: number; correct: number }> = {};

    for (let i = 1; i <= 12; i++) {
      numberFrequencies[i] = { total: 0, correct: 0 };
    }

    sessions.forEach((session) => {
      session.cards.forEach((card) => {
        const freq1 = numberFrequencies[card.operand1];
        const freq2 = numberFrequencies[card.operand2];
        if (freq1) {
          freq1.total++;
          if (card.isCorrect) {
            freq1.correct++;
          }
        }
        if (freq2) {
          freq2.total++;
          if (card.isCorrect) {
            freq2.correct++;
          }
        }
      });
    });

    return Object.entries(numberFrequencies)
      .map(([num, stats]) => {
        const number = parseInt(num);
        const masteryRate = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        let status = 'Level Up!';
        let color = '#F59E0B';

        if (masteryRate >= 90) {
          status = 'Mastered!';
          color = '#10B981';
        } else if (masteryRate >= 70) {
          status = 'Practicing';
          color = '#FBBF24';
        }

        return {
          number,
          opportunities: stats.total - stats.correct,
          masteryRate,
          status,
          color,
          icon: masteryRate >= 90 ? '⭐' : masteryRate >= 70 ? '📚' : '🎯',
        };
      })
      .sort((a, b) => b.opportunities - a.opportunities);
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user) {
    return <ReportsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <SkipLink />
      <header className="bg-white shadow-sm border-b-2 border-blue-100">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate('/users')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Go back to users"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}'s Progress</h1>
            <p className="text-sm text-gray-600">Celebrating your learning journey!</p>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="p-4 max-w-6xl mx-auto">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Ready to Start!</h2>
            <p className="text-gray-500 mb-6">
              Begin your practice journey to see your amazing progress here!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<Trophy size={24} />}
                label="Your Best Score"
                value={`${stats.bestScore}%`}
                color="text-yellow-600"
                bgColor="bg-white"
                borderColor="border-yellow-200"
                subtext="Keep it up!"
              />

              <StatCard
                icon={<Zap size={24} />}
                label="Fastest Time"
                value={stats.fastestTime > 0 ? formatTime(stats.fastestTime) : '-'}
                color="text-purple-600"
                bgColor="bg-white"
                borderColor="border-purple-200"
                subtext="Lightning fast!"
              />

              <StatCard
                icon={<Flame size={24} />}
                label="Current Streak"
                value={stats.currentStreak}
                color="text-orange-600"
                bgColor="bg-white"
                borderColor="border-orange-200"
                subtext={stats.currentStreak > 0 ? 'On fire!' : 'Start one!'}
              />

              <StatCard
                icon={<Clock size={24} />}
                label="Practice Time"
                value={formatTime(stats.totalPracticeTime)}
                color="text-blue-600"
                bgColor="bg-white"
                borderColor="border-blue-200"
                subtext="Time invested"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Achievements 🏆</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.title}
                    title={achievement.title}
                    description={achievement.description}
                    icon={achievement.icon}
                    earned={achievement.earned}
                    size="medium"
                  />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Score Journey 📈</h2>
                <div className="w-full overflow-hidden">
                  <ChartContainer config={scoreChartConfig} className="h-[300px] w-full max-w-full">
                    <LineChart
                      data={scoreOverTimeData}
                      accessibilityLayer
                      margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                    >
                      <XAxis
                        dataKey="session"
                        tick={{ fontSize: 12, fontWeight: 600 }}
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fontWeight: 600 }}
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                        width={35}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(label) => `Session ${String(label)}`}
                            formatter={(value) => [`${String(value)}%`, 'Score']}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="url(#blueGradient)"
                        strokeWidth={4}
                        dot={{
                          fill: '#3B82F6',
                          r: 12,
                          strokeWidth: 3,
                          stroke: 'white',
                        }}
                        activeDot={{
                          r: 14,
                          fill: '#2563EB',
                          strokeWidth: 4,
                          stroke: 'white',
                        }}
                      />
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Numbers to Practice! 🎯</h2>
                <p className="text-sm text-gray-600 mb-4">These numbers need more adventures!</p>
                <div className="w-full overflow-hidden">
                  <ChartContainer config={practiceChartConfig} className="h-[300px] w-full max-w-full">
                    <BarChart
                      data={practiceNumbersData}
                      accessibilityLayer
                      margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                    >
                      <XAxis
                        dataKey="number"
                        tick={{ fontSize: 12, fontWeight: 600 }}
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fontWeight: 600 }}
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                        width={35}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(label) => `Number ${label}`}
                            formatter={(value, name) => {
                              if (name === 'opportunities') {
                                return [value, 'Practice Count'];
                              }
                              return [value, name];
                            }}
                          />
                        }
                      />
                      <Bar
                        dataKey="opportunities"
                        fill="url(#greenGradient)"
                        radius={[12, 12, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34D399" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Session History 📚</h2>

              {/* Mobile: Card Layout */}
              <div className="block md:hidden space-y-4">
                {sessions.map((session) => (
                  <SessionCard key={session.sessionId} session={session} />
                ))}
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-gray-200">
                      <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                        Date
                      </TableHead>
                      <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                        Score
                      </TableHead>
                      <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                        Cards
                      </TableHead>
                      <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                        Time
                      </TableHead>
                      <TableHead className="text-left py-3 px-4 font-bold text-gray-700">
                        Progress
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session, index) => {
                      const percentage =
                        session.totalCards > 0
                          ? Math.round((session.score / session.totalCards) * 100)
                          : 0;

                      const prevSession = sessions[index + 1];
                      const prevPercentage = prevSession && prevSession.totalCards > 0
                        ? Math.round((prevSession.score / prevSession.totalCards) * 100)
                        : null;

                      const improvement = prevPercentage !== null ? percentage - prevPercentage : null;

                      return (
                        <TableRow
                          key={session.sessionId}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="py-3 px-4 text-gray-900 font-semibold">
                            {formatRelativeDate(session.timestamp)}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <span
                              className={`font-bold ${
                                percentage >= 90
                                  ? 'text-green-600'
                                  : percentage >= 75
                                  ? 'text-blue-600'
                                  : percentage >= 60
                                  ? 'text-yellow-600'
                                  : 'text-orange-600'
                              }`}
                            >
                              {session.score}/{session.totalCards}
                            </span>
                            <span className="text-gray-500 ml-2">({percentage}%)</span>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-gray-900 font-semibold">
                            {session.totalCards}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-gray-900 font-semibold">
                            {session.finishTime
                              ? formatTime(session.finishTime)
                              : session.timedOut
                              ? 'Timeout'
                              : '-'}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            {session.timedOut ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                                Still Practicing
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                  Complete
                                </span>
                                {improvement !== null && improvement > 0 && (
                                  <span className="text-green-600 font-bold text-sm flex items-center">
                                    ↑ {improvement}%
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
