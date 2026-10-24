import React from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Rocket,
  CheckCircle,
  Code2,
  FileCode,
  Shield,
  Award,
  ChevronRight,
  BrainCircuit,
  GraduationCap,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setViewMode, tasks, openTaskWorksheet, openDayTasks } = usePlatform();
  const { switchUser, availableUsers } = useAuth();

  const handleStartAsStudent = () => {
    switchUser('student-aryan');
    setViewMode('dashboard');
  };

  const handleStartAsTeacher = () => {
    const teacher = availableUsers.find((u) => u.role === 'teacher');
    if (teacher) switchUser(teacher.id);
    setViewMode('teacher_dashboard');
  };

  return (
    <div className="space-y-16 py-6 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-slate-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Official 5-Day Scratch Mastery Challenge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Code Games. Learn AI. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-amber-300 to-yellow-200">
              Master Scratch in 5 Days.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            A comprehensive, project-driven learning platform designed for aspiring coders.
            Tackle 15 structured projects from <span className="text-white font-semibold">Chase the Mouse</span> to <span className="text-white font-semibold">Tower Defense</span> and <span className="text-white font-semibold">Geometry Dash</span> with real-time AI code analysis and rubric grading.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleStartAsStudent}
              className="px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Rocket className="w-4 h-4" />
              <span>Enter Student Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleStartAsTeacher}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Teacher Review Portal</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <div className="text-2xl font-extrabold text-orange-400">5 Days</div>
              <div className="text-xs text-slate-400">Structured Curriculum</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-300">15 Tasks</div>
              <div className="text-xs text-slate-400">Easy, Medium, Hard</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">1500 Marks</div>
              <div className="text-xs text-slate-400">100 Marks Per Task</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-indigo-300">Gemini AI</div>
              <div className="text-xs text-slate-400">Rubric & .sb3 Inspection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Overview (5 Days, 15 Tasks) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
              The Learning Journey
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              5 Days • 15 Complete Challenges
            </h2>
          </div>
          <button
            onClick={() => setViewMode('day_select')}
            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View Interactive Journey Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((dayNum) => {
            const dayTasks = tasks.filter((t) => t.day === dayNum);
            const dayTitle = dayTasks[0]?.dayTitle?.split(':')[1]?.trim() || `Day ${dayNum}`;
            return (
              <div
                key={dayNum}
                onClick={() => openDayTasks(dayNum)}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-extrabold text-xs flex items-center justify-center">
                      D{dayNum}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">300 pts</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                    {dayTitle}
                  </h3>
                  <div className="mt-3 space-y-1.5">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="text-xs p-1.5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <span className="truncate text-slate-700 font-medium">{t.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1 rounded ${
                            t.difficulty === 'Easy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.difficulty === 'Medium'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {t.difficulty[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-orange-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore Day</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Gemini AI Assessment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Submissions are evaluated with multi-tier rubrics across written questions (40%), project code (50%), and technical reflection (10%) with actionable feedback.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <FileCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Deep .sb3 Project Inspection</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload your Scratch project file to unpack sprite trees, block opcodes, variables, clone lifecycles, and broadcast messages with verified static analysis.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Teacher Moderation & CSV</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Teachers can review AI assessments, inspect student block code, adjust marks with documented reasoning, and export whole-class performance data to CSV.
          </p>
        </div>
      </section>
    </div>
  );
};
