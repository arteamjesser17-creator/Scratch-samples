import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';
import { ParsedSb3Report } from '../types';
import {
  ArrowLeft,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Send,
  Loader2,
  FileCode,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Check,
} from 'lucide-react';

export const WorksheetView: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setViewMode,
    setActiveSubmission,
    refreshSubmissions,
  } = usePlatform();
  const { currentUser } = useAuth();

  const task = tasks.find((t) => t.id === selectedTaskId);

  // Form State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scratchUrl, setScratchUrl] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [sb3Report, setSb3Report] = useState<ParsedSb3Report | null>(null);
  const [isUploadingSb3, setIsUploadingSb3] = useState(false);
  const [sb3Error, setSb3Error] = useState<string | null>(null);

  // Progressive Hint State: qId -> revealed count (0, 1, 2, 3)
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!task) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500 text-sm">No task selected.</p>
        <button
          onClick={() => setViewMode('dashboard')}
          className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Handle URL Validation
  const isValidScratchUrl =
    scratchUrl.trim().length > 0 &&
    /scratch\.mit\.edu\/projects\/\d+/.test(scratchUrl.trim());

  // Handle Progressive Hint Reveal
  const handleRevealNextHint = (qId: string) => {
    setRevealedHints((prev) => {
      const current = prev[qId] || 0;
      return { ...prev, [qId]: Math.min(3, current + 1) };
    });
  };

  // Handle .sb3 File Upload
  const handleSb3FileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.sb3')) {
      setSb3Error('Please upload a valid Scratch project file (.sb3 extension).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setSb3Error('File size is too large (maximum 20MB limit).');
      return;
    }

    setSb3Error(null);
    setIsUploadingSb3(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Convert to base64
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      const res = await fetch('/api/parse-sb3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data,
          fileName: file.name,
          taskId: task.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setSb3Report(data.report);
      } else {
        setSb3Error(data.error || 'Failed to inspect Scratch project archive.');
      }
    } catch (err: any) {
      setSb3Error(err.message || 'Error processing .sb3 file.');
    } finally {
      setIsUploadingSb3(false);
    }
  };

  // Submit Worksheet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation checks
    const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim().length > 0).length;
    if (answeredCount < 3) {
      setSubmitError('Please answer at least 3 of the 5 questions before submitting for AI assessment.');
      return;
    }

    if (!currentUser) {
      setSubmitError('Please sign in before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          taskId: task.id,
          answers,
          scratchUrl: scratchUrl.trim() || undefined,
          sb3Report: sb3Report || undefined,
          reflectionText: reflectionText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.submission) {
        await refreshSubmissions();
        setActiveSubmission(data.submission);
        setViewMode('assessment');
      } else {
        setSubmitError(data.error || 'Assessment service encountered an issue.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit worksheet to AI evaluator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-6 pb-24 max-w-4xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setViewMode('task_select')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Day {task.day} Tasks</span>
        </button>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            task.difficulty === 'Easy'
              ? 'bg-emerald-100 text-emerald-800'
              : task.difficulty === 'Medium'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          Day {task.day} • {task.difficulty} Challenge
        </span>
      </div>

      {/* Task Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {task.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {task.projectDescription}
            </p>
          </div>

          {/* Open in Scratch CTA */}
          <a
            href={task.starterUrl || 'https://scratch.mit.edu/projects/editor/'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 shrink-0 self-start transition-all cursor-pointer"
          >
            <span>Open in Scratch</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* 100 Marks Breakdown Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
            <div className="font-bold text-amber-900 flex items-center justify-between">
              <span>1. Worksheet Questions</span>
              <span className="text-amber-700">40 Marks</span>
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">5 questions • 8 marks each</p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs">
            <div className="font-bold text-blue-900 flex items-center justify-between">
              <span>2. Scratch Project</span>
              <span className="text-blue-700">50 Marks</span>
            </div>
            <p className="text-[11px] text-blue-800 mt-0.5">Project link or .sb3 static inspection</p>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs">
            <div className="font-bold text-purple-900 flex items-center justify-between">
              <span>3. Code Reflection</span>
              <span className="text-purple-700">10 Marks</span>
            </div>
            <p className="text-[11px] text-purple-800 mt-0.5">Explain loop & debugging steps</p>
          </div>
        </div>
      </div>

      {/* Challenge Guide & Step-by-Step Instructions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 text-xs font-black flex items-center justify-center">
            ✦
          </span>
          <span>Step-by-Step Challenge Instructions</span>
        </h2>

        <div className="space-y-4">
          {task.challengeSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <h3 className="font-bold text-sm text-slate-900">{step.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">{step.instruction}</p>
              <div className="pl-7 pt-1">
                <span className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200 text-orange-700 font-medium inline-block">
                  💡 Tip: {step.scratchBlocksTip}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Five Task-Specific Questions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Part 1: Concept & Logic Worksheet (40 Marks)
              </h2>
              <p className="text-xs text-slate-500">
                Answer each of the 5 task-specific questions (8 marks each). Use hints if needed!
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
              40 Pts Max
            </span>
          </div>

          <div className="space-y-6">
            {task.questions.map((q, idx) => {
              const currentHintCount = revealedHints[q.id] || 0;
              const hasOptions = Array.isArray(q.options) && q.options.length > 0;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {q.type.replace('_', ' ')} • {q.maxMarks} marks
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                          {q.question}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Input Options (Radio buttons for MCQs, or Textarea for open explanations) */}
                  {hasOptions ? (
                    <div className="space-y-2 pl-8">
                      {q.options!.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                            answers[q.id] === opt
                              ? 'bg-orange-50 border-orange-400 text-orange-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            className="mt-0.5 text-orange-600 focus:ring-orange-400"
                          />
                          <span className="leading-relaxed">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-8">
                      <textarea
                        rows={3}
                        placeholder="Write your explanation in your own words..."
                        value={answers[q.id] || ''}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-hidden"
                      />
                    </div>
                  )}

                  {/* Progressive 3-Tier Hints */}
                  <div className="pl-8 pt-1 space-y-2">
                    {/* Render already revealed hints */}
                    {Array.from({ length: currentHintCount }).map((_, hintIdx) => (
                      <div
                        key={hintIdx}
                        className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Hint {hintIdx + 1}: </span>
                          <span>{q.hints[hintIdx]}</span>
                        </div>
                      </div>
                    ))}

                    {/* Button to reveal next hint */}
                    {currentHintCount < 3 && (
                      <button
                        type="button"
                        onClick={() => handleRevealNextHint(q.id)}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>
                          {currentHintCount === 0
                            ? 'Need a clue? Reveal Hint 1'
                            : `Reveal Hint ${currentHintCount + 1} of 3`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Scratch Project Submission & .sb3 Static Inspection */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Part 2: Scratch Project Evidence (50 Marks)
              </h2>
              <p className="text-xs text-slate-500">
                Paste your shared Scratch project URL or upload your exported .sb3 project file.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
              50 Pts Max
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option A: Scratch URL Input */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Method A: Shared Scratch Project URL
              </label>
              <input
                type="url"
                placeholder="https://scratch.mit.edu/projects/123456789"
                value={scratchUrl}
                onChange={(e) => setScratchUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-hidden"
              />
              <div className="flex items-center justify-between text-[11px]">
                {isValidScratchUrl ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid Scratch URL recognized
                  </span>
                ) : scratchUrl ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Must match scratch.mit.edu/projects/[id]
                  </span>
                ) : (
                  <span className="text-slate-400">Share your project on Scratch and paste link</span>
                )}
              </div>
            </div>

            {/* Option B: .sb3 Upload */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Method B: Upload .sb3 Project File (Recommended)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".sb3"
                  onChange={handleSb3FileChange}
                  disabled={isUploadingSb3}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
                />
                {isUploadingSb3 && (
                  <div className="absolute right-3 top-2 flex items-center gap-1.5 text-xs text-orange-600 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing code blocks...</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                In Scratch: Click <span className="font-semibold text-slate-700">File → Save to your computer</span>, then drop here.
              </p>
            </div>
          </div>

          {/* SB3 Error */}
          {sb3Error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{sb3Error}</span>
            </div>
          )}

          {/* SB3 Report Display if parsed */}
          {sb3Report && sb3Report.success && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Static Block Structure Analysis Completed</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs">
                  {sb3Report.staticAnalysisScore} / 50 pts
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-slate-400">Total Blocks</span>
                  <div className="font-extrabold text-sm text-slate-900">{sb3Report.totalBlocks}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-slate-400">Sprites</span>
                  <div className="font-extrabold text-sm text-slate-900">{sb3Report.spriteCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-slate-400">Variables</span>
                  <div className="font-extrabold text-sm text-slate-900">{sb3Report.variablesFound.length}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-slate-400">Costumes</span>
                  <div className="font-extrabold text-sm text-slate-900">{sb3Report.costumeCount}</div>
                </div>
              </div>

              {/* Requirement Checks */}
              <div className="space-y-1.5 pt-1">
                {sb3Report.requirementChecks.map((chk, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    {chk.passed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <span className="text-slate-700">
                      <strong className="text-slate-900">{chk.name}:</strong> {chk.detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* Static Analysis Notice */}
              <p className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/60 leading-normal">
                {sb3Report.staticNotice}
              </p>
            </div>
          )}

          {/* Pending Project Notification */}
          {!scratchUrl && !sb3Report && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Project Submission is Optional for Now: </span>
                <span>
                  You can submit worksheet answers first to claim provisional points (up to 50 marks).
                  The 50 project marks will be marked as <strong className="font-semibold">pending</strong> until you attach a Scratch project URL or .sb3 file.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Technical Reflection & Bug Hunt */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Part 3: Code Reflection & Debugging Journey (10 Marks)
              </h2>
              <p className="text-xs text-slate-500">
                Explain your game loop and the trickiest bug you diagnosed and solved.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800">
              10 Pts Max
            </span>
          </div>

          <p className="text-xs text-slate-700 font-medium">{task.reflectionPrompt}</p>

          <textarea
            rows={4}
            placeholder="Describe your scripts: How did you implement your game loop? What bug occurred during testing and how did you resolve it?"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full p-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-hidden leading-relaxed"
          />
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="text-sm font-bold">Ready for Evaluation?</div>
            <p className="text-xs text-slate-400">
              Your submission will be evaluated by Google Gemini AI against official Scratch rubrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode('task_select')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Worksheet & Code (100 Marks)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
