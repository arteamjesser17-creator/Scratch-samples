import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import {
  Code2,
  Calendar,
  Layers,
  Award,
  GraduationCap,
  Sparkles,
  Flame,
  UserCheck,
  ChevronRight,
  BookOpen,
  LogOut,
  User,
} from 'lucide-react';

interface NavbarProps {
  onOpenUserModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUserModal }) => {
  const { currentUser, isTeacher, logout } = useAuth();
  const { viewMode, setViewMode, getOverallStats } = usePlatform();
  const stats = getOverallStats();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                  ScratchMaster
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-orange-100 text-orange-700">
                  AI 5-Day
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Master Scratch in 5 Days • 15 Tasks
              </p>
            </div>
          </div>

          {currentUser ? (
            <>
              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'dashboard'
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setViewMode('day_select')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'day_select' || viewMode === 'task_select'
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>5-Day Journey</span>
                </button>

                <button
                  onClick={() => setViewMode('progress')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'progress'
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Achievements</span>
                </button>

                {isTeacher && (
                  <>
                    <button
                      onClick={() => setViewMode('teacher_dashboard')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                        viewMode === 'teacher_dashboard'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50/70'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Teacher Portal</span>
                    </button>

                    <button
                      onClick={() => setViewMode('worksheet_manager')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                        viewMode === 'worksheet_manager'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Manage Tasks</span>
                    </button>
                  </>
                )}
              </nav>

              {/* User Profile Pill & Actions */}
              <div className="flex items-center gap-3">
                {!isTeacher && (
                  <div className="hidden lg:flex items-center gap-3 pr-2 border-r border-slate-200">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{currentUser.streakDays} Day Streak</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">
                        {stats.earnedMarks}{' '}
                        <span className="text-slate-400 font-normal">/ {stats.possibleMarks}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        {stats.percentage}% Mastered
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={onOpenUserModal}
                  className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer text-left"
                  title="Click to view profile, switch accounts, or reset data"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 object-cover"
                  />
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      {isTeacher && (
                        <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 text-[9px] font-bold">
                          Teacher
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">{currentUser.gradeLevel}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Log out & return to student login"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500 font-semibold">
              Ready to code Scratch? Enter your name below to begin.
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
