import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import {
  Rocket,
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  ArrowRight,
  Flame,
  Star,
  ChevronRight,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const StudentDashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    tasks,
    resumeLearning,
    openTaskWorksheet,
    openDayTasks,
    getDayScore,
    getOverallStats,
    getTaskStatus,
    submissions,
    setActiveSubmission,
    setViewMode,
  } = usePlatform();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Completed' | 'Pending' | 'Incomplete'>('All');

  if (!currentUser) return null;

  const stats = getOverallStats();

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.objectives.some((obj) => obj.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff = selectedDifficulty === 'All' || t.difficulty === selectedDifficulty;

    const status = getTaskStatus(t.id);
    let matchesStatus = true;
    if (selectedStatus === 'Completed') matchesStatus = status.isCompleted;
    else if (selectedStatus === 'Pending') matchesStatus = status.isPendingProject;
    else if (selectedStatus === 'Incomplete') matchesStatus = !status.isCompleted;

    return matchesSearch && matchesDiff && matchesStatus;
  });

  // Recent submission
  const recentSubmission = submissions[0];

  return (
    <div className="space-y-10 py-6 pb-20">
      {/* Welcome Banner & Resume Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-400/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                {currentUser.streakDays}-Day Coding Streak!
              </span>
              <span className="text-xs text-slate-400">• {currentUser.gradeLevel}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-orange-400">{currentUser.name.split(' ')[0]}</span>!
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              You have completed <span className="text-white font-bold">{stats.completedTasksCount} of {stats.totalTasksCount} challenges</span> and earned{' '}
              <span className="text-amber-300 font-extrabold">{stats.earnedMarks} marks</span> ({stats.percentage}% of the challenge completed). Keep up the momentum!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={resumeLearning}
                className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume Learning</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('progress')}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>View Badges ({currentUser.badges.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Ring / Counter Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between min-w-[260px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Overall Progress
              </span>
              <span className="text-xs font-bold text-orange-400">{stats.percentage}%</span>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-white/10">
              <div
                className="bg-linear-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/10 text-xs">
              <div>
                <div className="text-slate-400">Total Marks</div>
                <div className="text-base font-extrabold text-white">
                  {stats.earnedMarks} <span className="text-xs text-slate-400 font-normal">/ {stats.possibleMarks}</span>
                </div>
              </div>
              <div>
                <div className="text-slate-400">Challenges</div>
                <div className="text-base font-extrabold text-white">
                  {stats.completedTasksCount} <span className="text-xs text-slate-400 font-normal">/ {stats.totalTasksCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Feedback Notification if available */}
      {recentSubmission && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Latest Graded Submission: {recentSubmission.taskTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {recentSubmission.teacherAdjustment
                    ? recentSubmission.teacherAdjustment.adjustedScore
                    : recentSubmission.aiAssessment.overallScore}{' '}
                  / 100
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xl">
                {recentSubmission.aiAssessment.strengths[0] || 'Great effort on this task!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveSubmission(recentSubmission);
              setViewMode('assessment');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>View Full Rubric & Feedback</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">5-Day Challenge Tracks</h2>
            <p className="text-xs text-slate-500">Pick any challenge to open its interactive worksheet</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks, loops, physics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-hidden"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 text-xs">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending Project</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>
        </div>

        {/* 5 Interactive Day Cards */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((dayNum) => {
            const dayTasks = tasks.filter((t) => t.day === dayNum);
            const visibleDayTasks = dayTasks.filter((t) => filteredTasks.some((ft) => ft.id === t.id));

            if (visibleDayTasks.length === 0 && (searchQuery || selectedDifficulty !== 'All' || selectedStatus !== 'All')) {
              return null;
            }

            const dayScore = getDayScore(dayNum);
            const dayPercentage = Math.round((dayScore.earned / dayScore.total) * 100);
            const dayTitle = dayTasks[0]?.dayTitle || `Day ${dayNum}`;

            return (
              <div
                key={dayNum}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5"
              >
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-black text-sm flex items-center justify-center shrink-0">
                      Day {dayNum}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{dayTitle}</h3>
                      <p className="text-xs text-slate-500">
                        {dayScore.completedCount} of 3 tasks completed • Earned {dayScore.earned} / {dayScore.total} marks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{dayScore.earned} / {dayScore.total} pts</div>
                      <div className="text-[10px] font-semibold text-emerald-600">{dayPercentage}% done</div>
                    </div>
                    <div className="w-24 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all"
                        style={{ width: `${dayPercentage}%` }}
                      />
                    </div>
                    <button
                      onClick={() => openDayTasks(dayNum)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3 Task Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dayTasks.map((task) => {
                    const status = getTaskStatus(task.id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => openTaskWorksheet(task.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                          status.isCompleted
                            ? 'bg-slate-50/70 border-slate-200 hover:border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-orange-400 hover:shadow-orange-500/5'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Difficulty chip & Score Badge */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                task.difficulty === 'Easy'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : task.difficulty === 'Medium'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {task.difficulty}
                            </span>

                            {status.isCompleted ? (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{status.bestScore}/100</span>
                              </div>
                            ) : status.isPendingProject ? (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Project Pending</span>
                              </div>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-400">
                                100 pts
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                            {task.title}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {task.tagline}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 font-medium">
                            ⏱ {task.estimatedTime}
                          </span>
                          <span className="font-bold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            {status.isCompleted ? 'Review & Improve' : 'Start Task'}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
