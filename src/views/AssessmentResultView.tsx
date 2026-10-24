import React, { useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  FileCode,
  ShieldCheck,
  Check,
  Flame,
} from 'lucide-react';

export const AssessmentResultView: React.FC = () => {
  const {
    activeSubmission,
    tasks,
    openTaskWorksheet,
    setViewMode,
  } = usePlatform();

  const task = tasks.find((t) => t.id === activeSubmission?.taskId);

  useEffect(() => {
    if (activeSubmission) {
      const finalScore = activeSubmission.teacherAdjustment
        ? activeSubmission.teacherAdjustment.adjustedScore
        : activeSubmission.aiAssessment.overallScore;
      if (finalScore >= 80) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [activeSubmission]);

  if (!activeSubmission) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-slate-500 text-sm">No active assessment to display.</p>
        <button
          onClick={() => setViewMode('dashboard')}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { aiAssessment, teacherAdjustment } = activeSubmission;
  const finalScore = teacherAdjustment ? teacherAdjustment.adjustedScore : aiAssessment.overallScore;

  return (
    <div className="space-y-8 py-6 pb-24 max-w-4xl mx-auto">
      {/* Top Banner & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setViewMode('dashboard')}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
        >
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Attempt #{activeSubmission.attemptNumber}</span>
          <span
            className={`text-xs font-bold px-3 py-0.5 rounded-full ${
              activeSubmission.status === 'teacher_approved'
                ? 'bg-purple-100 text-purple-800'
                : activeSubmission.status === 'needs_review'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {activeSubmission.status === 'teacher_approved'
              ? 'Teacher Approved'
              : activeSubmission.status === 'needs_review'
              ? 'Flagged for Review'
              : 'AI Evaluated'}
          </span>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Rubric Evaluation Results</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {activeSubmission.taskTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluated by <strong className="text-white">{aiAssessment.engineUsed}</strong> based on Scratch coding standards, question logic accuracy, and project execution.
          </p>

          {/* Teacher Adjustment Alert if modified */}
          {teacherAdjustment && (
            <div className="p-3 rounded-xl bg-purple-900/60 border border-purple-400/40 text-xs space-y-1">
              <div className="font-bold text-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <span>Teacher Adjusted Marks: {teacherAdjustment.adjustedScore}/100</span>
              </div>
              <p className="text-purple-300 text-[11px]">
                Reason: "{teacherAdjustment.reason}" — Reviewed by {teacherAdjustment.adjustedBy}
              </p>
            </div>
          )}
        </div>

        {/* Circular Marks Gauge */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center shrink-0 min-w-[200px] text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Overall Task Score
          </span>
          <div className="text-5xl font-black text-white tracking-tight">
            {finalScore}
            <span className="text-xl text-slate-400 font-normal"> / 100</span>
          </div>
          <span
            className={`text-xs font-bold px-3 py-0.5 rounded-full ${
              finalScore >= 80
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                : finalScore >= 50
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                : 'bg-red-500/20 text-red-300 border border-red-400/30'
            }`}
          >
            {finalScore >= 90
              ? 'Exemplary Mastery 🏆'
              : finalScore >= 80
              ? 'Proficient Coder ⭐'
              : finalScore >= 50
              ? 'Provisional Score 📝'
              : 'Needs Practice 💡'}
          </span>
        </div>
      </div>

      {/* 3-Part Marks Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Worksheet Questions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Worksheet Questions
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {aiAssessment.worksheetScore} / 40
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${(aiAssessment.worksheetScore / 40) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            5 concept and debugging questions.
          </p>
        </div>

        {/* Scratch Project */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Scratch Project
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {aiAssessment.isProjectPending ? (
                <span className="text-amber-600 font-bold text-xs">Pending (0/50)</span>
              ) : (
                `${aiAssessment.projectScore} / 50`
              )}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                aiAssessment.isProjectPending ? 'bg-amber-400' : 'bg-blue-500'
              }`}
              style={{
                width: aiAssessment.isProjectPending
                  ? '0%'
                  : `${(aiAssessment.projectScore / 50) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            {aiAssessment.isProjectPending
              ? 'Submit Scratch URL to unlock 50 marks.'
              : 'Evaluated from project blocks & logic.'}
          </p>
        </div>

        {/* Reflection */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Code Reflection
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {aiAssessment.reflectionScore} / 10
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${(aiAssessment.reflectionScore / 10) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Problem-solving and debugging insights.
          </p>
        </div>
      </div>

      {/* Strengths & Actionable Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Strengths</span>
          </h3>
          <ul className="space-y-2">
            {aiAssessment.strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Actionable Next Steps</span>
          </h3>
          <ul className="space-y-2">
            {aiAssessment.actionableImprovements.map((imp, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question by Question Feedback */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-600" />
          <span>Worksheet Question Rubric Breakdown</span>
        </h3>

        <div className="space-y-4">
          {aiAssessment.questionAssessments.map((qa, index) => {
            const originalQuestion = task?.questions.find((q) => q.id === qa.qId);
            return (
              <div
                key={qa.qId}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      Q{index + 1}
                    </span>
                    <span className="font-bold text-slate-900 leading-snug">
                      {originalQuestion?.question || `Question ${index + 1}`}
                    </span>
                  </div>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      qa.score >= 7
                        ? 'bg-emerald-100 text-emerald-800'
                        : qa.score >= 4
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {qa.score} / {qa.maxScore} pts
                  </span>
                </div>

                <div className="pl-7 space-y-1">
                  <p className="text-slate-600">
                    <strong className="text-slate-700">Your Answer: </strong>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      {activeSubmission.answers[qa.qId] || '(Blank)'}
                    </span>
                  </p>
                  <p className="text-slate-600">
                    <strong className="text-slate-700">Rubric Feedback: </strong>
                    {qa.feedback}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SB3 Inspection Report if present */}
      {activeSubmission.sb3Report && (
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>Uploaded .sb3 Project Static Structure Findings</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {activeSubmission.sb3Report.fileName}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400">Total Code Blocks</span>
              <div className="font-extrabold text-sm text-slate-900">
                {activeSubmission.sb3Report.totalBlocks}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400">Sprites Declared</span>
              <div className="font-extrabold text-sm text-slate-900">
                {activeSubmission.sb3Report.spriteCount}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400">Variables Found</span>
              <div className="font-extrabold text-sm text-slate-900">
                {activeSubmission.sb3Report.variablesFound.length}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400">Clones Used</span>
              <div className="font-extrabold text-sm text-slate-900">
                {activeSubmission.sb3Report.hasClones ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 pt-1 leading-normal">
            {activeSubmission.sb3Report.staticNotice}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          onClick={() => openTaskWorksheet(activeSubmission.taskId)}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again & Improve Score</span>
        </button>

        <button
          onClick={() => setViewMode('dashboard')}
          className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-500/25 transition-all cursor-pointer"
        >
          <span>Continue 5-Day Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
