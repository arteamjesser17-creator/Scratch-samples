import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import {
  Award,
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw,
  Star,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

export const ProgressAchievementsView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    tasks,
    submissions,
    getDayScore,
    getOverallStats,
    openTaskWorksheet,
    setActiveSubmission,
    setViewMode,
  } = usePlatform();

  const stats = getOverallStats();

  if (!currentUser) return null;

  // Badges Definitions
  const allBadges = [
    {
      id: 'First Green Flag',
      title: 'First Green Flag',
      description: 'Completed your first Scratch coding challenge.',
      icon: '🚩',
      unlocked: currentUser.badges.includes('First Green Flag'),
    },
    {
      id: 'Gravity Hacker',
      title: 'Gravity Hacker',
      description: 'Mastered velocity variables and ground physics.',
      icon: '🚀',
      unlocked: currentUser.badges.includes('Gravity Hacker'),
    },
    {
      id: 'Wave Defender',
      title: 'Wave Defender',
      description: 'Conquered clone lifecycle management in Tower Defense.',
      icon: '🛡️',
      unlocked: currentUser.badges.includes('Wave Defender'),
    },
    {
      id: 'Pet Whisperer',
      title: 'Pet Whisperer',
      description: 'Built a multi-stat virtual companion with broadcast care.',
      icon: '🐾',
      unlocked: currentUser.badges.includes('Pet Whisperer'),
    },
    {
      id: 'Maze Runner',
      title: 'Maze Runner',
      description: 'Engineered step rollback collision and collectible keys.',
      icon: '🧭',
      unlocked: currentUser.badges.includes('Maze Runner'),
    },
    {
      id: '100% Club',
      title: '100% Club',
      description: 'Scored a perfect 100/100 on any challenge.',
      icon: '💯',
      unlocked: currentUser.badges.includes('100% Club'),
    },
    {
      id: '5-Task Pioneer',
      title: '5-Task Pioneer',
      description: 'Completed at least 5 different challenges.',
      icon: '⭐',
      unlocked: stats.completedTasksCount >= 5,
    },
    {
      id: 'Challenge Champion',
      title: 'Challenge Champion',
      description: 'Completed all 15 tasks across all 5 days!',
      icon: '👑',
      unlocked: stats.completedTasksCount >= 15,
    },
  ];

  return (
    <div className="space-y-10 py-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Student Performance & Badges
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Progress & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track total marks earned across all 15 tasks and unlockable honors.
          </p>
        </div>

        <button
          onClick={() => setViewMode('dashboard')}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Progress Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Points Earned
          </span>
          <div className="text-2xl font-black text-slate-900">
            {stats.earnedMarks} <span className="text-sm font-normal text-slate-400">/ {stats.possibleMarks}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">{stats.percentage}% of curriculum mastered</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Completed Tasks
          </span>
          <div className="text-2xl font-black text-slate-900">
            {stats.completedTasksCount} <span className="text-sm font-normal text-slate-400">/ 15</span>
          </div>
          <p className="text-[11px] text-slate-500">{15 - stats.completedTasksCount} remaining to conquer</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Coding Streak
          </span>
          <div className="text-2xl font-black text-orange-600 flex items-center gap-1.5">
            <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
            <span>{currentUser.streakDays} Days</span>
          </div>
          <p className="text-[11px] text-slate-500">Keep solving daily challenges</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Badges Unlocked
          </span>
          <div className="text-2xl font-black text-purple-700 flex items-center gap-1.5">
            <Award className="w-6 h-6 text-purple-600" />
            <span>{allBadges.filter((b) => b.unlocked).length} / {allBadges.length}</span>
          </div>
          <p className="text-[11px] text-purple-600 font-semibold">Keep coding to unlock all</p>
        </div>
      </div>

      {/* 5-Day Performance Breakdown Chart */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          <span>Daily Score Progress (300 Marks Per Day)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((d) => {
            const dayScore = getDayScore(d);
            const percent = Math.round((dayScore.earned / dayScore.total) * 100);

            return (
              <div
                key={d}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-800">Day {d}</span>
                  <span className="text-[10px] font-bold text-orange-600">{percent}%</span>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-black text-slate-900">{dayScore.earned} pts</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-500">
                  {dayScore.completedCount} / 3 Tasks Graded
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Badges & Honors Grid */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Achievement Badges</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {allBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${
                badge.unlocked
                  ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-3xl">{badge.icon}</div>
              <h4 className="font-bold text-xs text-slate-900">{badge.title}</h4>
              <p className="text-[11px] text-slate-500 leading-tight">{badge.description}</p>
              <div className="pt-1">
                {badge.unlocked ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    Unlocked ✓
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 text-slate-600">
                    Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Attempt History Table */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          <span>Submission & Evaluation History</span>
        </h2>

        {submissions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No submissions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Task Title</th>
                  <th className="py-2.5 px-3">Day / Diff</th>
                  <th className="py-2.5 px-3">Attempt</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => {
                  const finalScore = sub.teacherAdjustment
                    ? sub.teacherAdjustment.adjustedScore
                    : sub.aiAssessment.overallScore;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{sub.taskTitle}</td>
                      <td className="py-3 px-3 text-slate-600">
                        Day {sub.day} • {sub.difficulty}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-500">#{sub.attemptNumber}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            finalScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {finalScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            sub.status === 'teacher_approved'
                              ? 'bg-purple-100 text-purple-700'
                              : sub.status === 'needs_review'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setActiveSubmission(sub);
                            setViewMode('assessment');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
