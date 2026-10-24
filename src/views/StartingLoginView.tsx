import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  Sparkles,
  ArrowRight,
  User,
  GraduationCap,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  RotateCcw,
  Flame,
} from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'bot-1', label: 'Robo Coder', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=RoboCoder' },
  { id: 'cat-1', label: 'Scratch Cat', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ScratchCat' },
  { id: 'astro-1', label: 'Star Voyager', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=StarVoyager' },
  { id: 'pixel-1', label: 'Pixel Wizard', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelWizard' },
  { id: 'spark-1', label: 'Circuit Kid', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CircuitKid' },
];

export const StartingLoginView: React.FC = () => {
  const { loginOrRegister, availableUsers, switchUser, resetEntireDatabase } = useAuth();

  const [mode, setMode] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [gradeLevel, setGradeLevel] = useState('Class 5');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const existingStudents = availableUsers.filter((u) => u.role === 'student');
  const existingTeachers = availableUsers.filter((u) => u.role === 'teacher');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name to start.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await loginOrRegister({
        name: name.trim(),
        role: mode,
        avatar: selectedAvatar,
        gradeLevel: mode === 'teacher' ? 'CS Educator' : gradeLevel,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickResume = (userId: string) => {
    switchUser(userId);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset the entire server database? All scores and submissions will be reset to 0.')) {
      await resetEntireDatabase();
      setName('');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/25 mb-1">
            <Code2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            ScratchMaster AI
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The 5-Day Coding Challenge • 15 Tasks • 1500 Marks
          </p>
        </div>

        {/* Main Login / Register Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Mode Tabs (Student vs Teacher) */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('student');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'student'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('teacher');
                setErrorMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'teacher'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Teacher Portal</span>
            </button>
          </div>

          <form onSubmit={handleStart} className="p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                {mode === 'student' ? 'Start Your Scratch Journey' : 'Teacher Access'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'student'
                  ? 'Enter your name to begin fresh with 0 marks. All progress will be saved in your database.'
                  : 'Sign in to review student worksheets, moderate marks, and export class CSVs.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {mode === 'student' ? 'Your Name' : 'Teacher Name'}
              </label>
              <input
                type="text"
                placeholder={mode === 'student' ? 'e.g. Aryan' : 'e.g. Ms. Henderson'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:bg-white focus:outline-hidden font-medium"
                required
                autoFocus
              />
            </div>

            {mode === 'student' && (
              <>
                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Choose Your Avatar</label>
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.url)}
                        className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          selectedAvatar === av.url
                            ? 'border-orange-500 bg-orange-50 shadow-xs ring-2 ring-orange-400/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img src={av.url} alt={av.label} className="w-10 h-10 object-contain" />
                        <span className="text-[9px] font-bold text-slate-600 truncate mt-1 w-full">
                          {av.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class Selector for Classes 5 to 7 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">Select Your Class</label>
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      For Classes 5 to 7
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Class 5', title: 'Class 5', subtitle: 'Junior Explorers' },
                      { id: 'Class 6', title: 'Class 6', subtitle: 'Game Builders' },
                      { id: 'Class 7', title: 'Class 7', subtitle: 'Logic & Physics' },
                    ].map((cls) => {
                      const isSelected = gradeLevel.startsWith(cls.id);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => setGradeLevel(`${cls.id} (${cls.subtitle})`)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/80 shadow-xs ring-2 ring-orange-400/20 text-orange-950'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <span className="font-extrabold text-sm">{cls.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {cls.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'student'
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25'
              }`}
            >
              <span>{isLoading ? 'Setting up Profile...' : mode === 'student' ? 'Start My Coding Challenge (0/1500 Pts)' : 'Access Teacher Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Returning Profiles Quick Switch */}
          {((mode === 'student' && existingStudents.length > 0) ||
            (mode === 'teacher' && existingTeachers.length > 0)) && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Or Resume Existing Profile:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(mode === 'student' ? existingStudents : existingTeachers).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickResume(u.id)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/40 text-left flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-lg bg-slate-100 object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {u.role === 'student' ? `${u.totalMarksEarned} / 1500 pts` : 'Teacher'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Database & Reset Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Persistent database storage active</span>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="text-[11px] text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database to Zero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
