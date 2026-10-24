import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DaySelectionView: React.FC = () => {
  const { tasks, openDayTasks, getDayScore, setViewMode } = usePlatform();

  const daysInfo = [
    {
      day: 1,
      title: 'Foundations of Motion & Events',
      theme: 'Coordinate math, glide vs move, event loops, and velocity physics.',
      color: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-100 text-emerald-800',
      tag: 'Day 1 — Beginner to Intermediate',
    },
    {
      day: 2,
      title: 'Variables, Loops & Interactions',
      theme: 'Global vs local variables, broadcasts, decay timers, and wall collision rollback.',
      color: 'from-blue-500 to-cyan-600',
      badge: 'bg-blue-100 text-blue-800',
      tag: 'Day 2 — Intermediate',
    },
    {
      day: 3,
      title: 'Game Mechanics & Physics',
      theme: 'Gravity acceleration, dynamic rotation angles, clones, and precision hitboxes.',
      color: 'from-indigo-500 to-purple-600',
      badge: 'bg-indigo-100 text-indigo-800',
      tag: 'Day 3 — Arcade Action',
    },
    {
      day: 4,
      title: 'Logic, Conditions & Data Lists',
      theme: 'Data lists, string evaluation, 2D reflection velocity, and cooldown throttles.',
      color: 'from-amber-500 to-orange-600',
      badge: 'bg-amber-100 text-amber-800',
      tag: 'Day 4 — Advanced Game Systems',
    },
    {
      day: 5,
      title: 'Visual Effects, Sound & Polish',
      theme: 'Scratch Pen extension, trigonometric geometry, color shader cycles, and UI bounds.',
      color: 'from-pink-500 to-rose-600',
      badge: 'bg-pink-100 text-pink-800',
      tag: 'Day 5 — Creative Engineering',
    },
  ];

  return (
    <div className="space-y-8 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
            5-Day Structured Challenge
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select a Challenge Day
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Progress through all 5 days to complete the 1500-mark curriculum.
          </p>
        </div>

        <button
          onClick={() => setViewMode('dashboard')}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Day Cards Roadmap */}
      <div className="space-y-5">
        {daysInfo.map((info) => {
          const dayTasks = tasks.filter((t) => t.day === info.day);
          const score = getDayScore(info.day);
          const percent = Math.round((score.earned / score.total) * 100);

          return (
            <div
              key={info.day}
              onClick={() => openDayTasks(info.day)}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Day Badge & Narrative */}
              <div className="flex items-start gap-5">
                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-tr ${info.color} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                >
                  D{info.day}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${info.badge}`}>
                      {info.tag}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">• 300 marks</span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-orange-600 transition-colors">
                    Day {info.day}: {info.title}
                  </h3>

                  <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                    {info.theme}
                  </p>

                  {/* Task list preview */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {dayTasks.map((t) => (
                      <span
                        key={t.id}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {t.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Day Score & Launch Action */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Earned Marks</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {score.earned} <span className="text-xs text-slate-400 font-normal">/ {score.total}</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600">
                    {score.completedCount}/3 tasks completed ({percent}%)
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-orange-500 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
