import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';
import { TaskItem } from '../types';
import {
  BookOpen,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export const WorksheetManagementView: React.FC = () => {
  const { tasks, setViewMode } = usePlatform();
  const { isTeacher } = useAuth();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const currentTask = tasks.find((t) => t.id === selectedTaskId);

  // Form State for editing
  const [title, setTitle] = useState(currentTask?.title || '');
  const [tagline, setTagline] = useState(currentTask?.tagline || '');
  const [projectDescription, setProjectDescription] = useState(
    currentTask?.projectDescription || ''
  );
  const [starterUrl, setStarterUrl] = useState(currentTask?.starterUrl || '');
  const [estimatedTime, setEstimatedTime] = useState(currentTask?.estimatedTime || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    const t = tasks.find((item) => item.id === taskId);
    if (t) {
      setTitle(t.title);
      setTagline(t.tagline);
      setProjectDescription(t.projectDescription);
      setStarterUrl(t.starterUrl);
      setEstimatedTime(t.estimatedTime);
    }
    setSaveSuccess(false);
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/tasks/${currentTask.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          tagline,
          projectDescription,
          starterUrl,
          estimatedTime,
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setErrorMsg(data.error || 'Failed to update worksheet.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while saving worksheet.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 py-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('teacher_dashboard')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Teacher Curriculum Controls
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Worksheet & Task Management
            </h1>
          </div>
        </div>

        <button
          onClick={() => setViewMode('dashboard')}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold self-start sm:self-auto cursor-pointer"
        >
          Exit to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Task Selection Sidebar */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Select Challenge (15 Total)
          </h3>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
            {tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTask(t.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  selectedTaskId === t.id
                    ? 'bg-purple-50 text-purple-800 border border-purple-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">D{t.day}</span>
                  <span>{t.title}</span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    t.difficulty === 'Easy'
                      ? 'bg-emerald-100 text-emerald-800'
                      : t.difficulty === 'Medium'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {t.difficulty}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Task Editor Form */}
        <div className="lg:col-span-3 space-y-6">
          {currentTask && (
            <form
              onSubmit={handleSave}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-purple-700">
                    Day {currentTask.day} • {currentTask.difficulty}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">Editing Task Details</h2>
                </div>

                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Changes Saved!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Task Edits'}</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-hidden font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Completion Time
                  </label>
                  <input
                    type="text"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Brief Summary
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Description
                </label>
                <textarea
                  rows={4}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-hidden leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Starter Project / Tutorial URL
                </label>
                <input
                  type="url"
                  value={starterUrl}
                  onChange={(e) => setStarterUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-hidden font-mono"
                  required
                />
              </div>

              {/* View 5 Questions & Hints Preview */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Included Questions & Rubric Keys:
                </h3>
                <div className="space-y-3">
                  {currentTask.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Q{idx + 1}: {q.question}
                        </span>
                        <span className="font-bold text-slate-600 text-[11px]">
                          {q.maxMarks} marks
                        </span>
                      </div>
                      <p className="text-slate-600">
                        <strong className="text-slate-700">Expected Key: </strong>
                        {q.correctAnswer}
                      </p>
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <strong>Progressive Hints: </strong>
                        1. {q.hints[0]} • 2. {q.hints[1]} • 3. {q.hints[2]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
