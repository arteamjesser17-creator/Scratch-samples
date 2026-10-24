import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Play,
  Layers,
  Sparkles,
  ChevronRight,
  Code2,
  FileText,
} from 'lucide-react';

export const TaskSelectionView: React.FC = () => {
  const {
    tasks,
    selectedDay,
    setSelectedDay,
    setViewMode,
    openTaskWorksheet,
    getTaskStatus,
    getDayScore,
  } = usePlatform();

  const dayTasks = tasks.filter((t) => t.day === selectedDay);
  const dayScore = getDayScore(selectedDay);
  const dayTitle = dayTasks[0]?.dayTitle || `Day ${selectedDay}`;

  return (
    <div className="space-y-8 py-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('day_select')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Back to Days"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Challenge Track • Day {selectedDay}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {dayTitle}
            </h1>
          </div>
        </div>

        {/* Day Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDay === d
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Day {d}
            </button>
          ))}
        </div>
      </div>

      {/* Day Progress Summary Card */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-orange-50 to-amber-50 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-orange-950">
            Day {selectedDay} Progress: {dayScore.earned} of {dayScore.total} Marks Earned
          </h2>
          <p className="text-xs text-orange-800">
            Complete the Easy (40/50/10), Medium (40/50/10), and Hard (40/50/10) tasks below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-orange-900">
            {dayScore.completedCount} / 3 Tasks Done
          </span>
          <div className="w-28 bg-white/80 rounded-full h-2.5 overflow-hidden border border-orange-300">
            <div
              className="bg-orange-500 h-full rounded-full transition-all"
              style={{ width: `${Math.round((dayScore.earned / dayScore.total) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Detailed Task Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {dayTasks.map((task) => {
          const status = getTaskStatus(task.id);

          return (
            <div
              key={task.id}
              className={`rounded-3xl border bg-white shadow-xs hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden ${
                status.isCompleted ? 'border-emerald-200' : 'border-slate-200 hover:border-orange-400'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      task.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.difficulty === 'Medium'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {task.difficulty} Challenge
                  </span>

                  {status.isCompleted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{status.bestScore} / 100</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">100 Marks</span>
                  )}
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{task.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.tagline}</p>
                </div>

                {/* Objectives Checklist Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Core Learning Objectives:
                  </span>
                  <ul className="space-y-1.5">
                    {task.objectives.slice(0, 3).map((obj, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                        <span className="leading-tight">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Concepts Preview */}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {task.expectedBlocks.labels.slice(0, 3).map((label, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button Card Footer */}
              <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{task.estimatedTime}</span>
                </span>

                <button
                  onClick={() => openTaskWorksheet(task.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                    status.isCompleted
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{status.isCompleted ? 'Review / Improve' : 'Open Worksheet'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
