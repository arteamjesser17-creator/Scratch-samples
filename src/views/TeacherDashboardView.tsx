import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import { SubmissionRecord, UserProfile } from '../types';
import {
  GraduationCap,
  Users,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Edit3,
  X,
  FileCode,
  Sparkles,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';

export const TeacherDashboardView: React.FC = () => {
  const { currentUser, isTeacher, availableUsers } = useAuth();
  const { tasks, setViewMode } = usePlatform();

  const [allSubmissions, setAllSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [studentFilter, setStudentFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [dayFilter, setDayFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected submission for review modal
  const [reviewingSubmission, setReviewingSubmission] = useState<SubmissionRecord | null>(null);

  // Adjustment form state
  const [adjustedScore, setAdjustedScore] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [isSavingAdjustment, setIsSavingAdjustment] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const fetchClassSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setAllSubmissions(data.submissions);
      }
    } catch (e) {
      console.error('Failed to load class submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassSubmissions();
  }, []);

  const openReviewModal = (sub: SubmissionRecord) => {
    setReviewingSubmission(sub);
    const initialScore = sub.teacherAdjustment
      ? sub.teacherAdjustment.adjustedScore
      : sub.aiAssessment.overallScore;
    setAdjustedScore(initialScore);
    setAdjustmentReason(sub.teacherAdjustment?.reason || '');
    setTeacherNotes(sub.teacherAdjustment?.teacherNotes || '');
    setAdjustSuccess(false);
    setAdjustError(null);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission) return;

    if (!adjustmentReason.trim()) {
      setAdjustError('Please provide a documented reason for this score adjustment.');
      return;
    }

    setIsSavingAdjustment(true);
    setAdjustError(null);

    try {
      const res = await fetch('/api/teacher/adjust-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: reviewingSubmission.id,
          adjustedScore: Number(adjustedScore),
          reason: adjustmentReason.trim(),
          teacherNotes: teacherNotes.trim(),
          adjustedBy: currentUser?.name || 'Teacher',
        }),
      });

      const data = await res.json();
      if (data.success && data.submission) {
        setReviewingSubmission(data.submission);
        setAdjustSuccess(true);
        // Refresh local submissions list
        await fetchClassSubmissions();
        setTimeout(() => setAdjustSuccess(false), 2000);
      } else {
        setAdjustError(data.error || 'Failed to update marks.');
      }
    } catch (err: any) {
      setAdjustError(err.message || 'Error communicating with server.');
    } finally {
      setIsSavingAdjustment(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/teacher/export-csv';
  };

  // Filtered submissions
  const filtered = allSubmissions.filter((sub) => {
    if (studentFilter !== 'All' && sub.userId !== studentFilter) return false;
    if (classFilter !== 'All') {
      const studentUser = availableUsers.find((u) => u.id === sub.userId);
      if (!studentUser?.gradeLevel?.toLowerCase().includes(classFilter.toLowerCase())) return false;
    }
    if (dayFilter !== 'All' && sub.day !== Number(dayFilter)) return false;
    if (statusFilter !== 'All' && sub.status !== statusFilter) return false;
    if (diffFilter !== 'All' && sub.difficulty !== diffFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        sub.userName.toLowerCase().includes(q) ||
        sub.taskTitle.toLowerCase().includes(q) ||
        sub.userEmail.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const studentsList = availableUsers.filter((u) => u.role === 'student');
  const needsReviewCount = allSubmissions.filter((s) => s.status === 'needs_review').length;

  return (
    <div className="space-y-8 py-6 pb-24">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>Authorized Teacher Portal • Classes 5 to 7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Class Roster (Classes 5 to 7) & Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review student answers across Classes 5, 6, and 7, inspect .sb3 project code evidence, and adjust marks with recorded notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Class CSV</span>
          </button>

          <button
            onClick={() => setViewMode('worksheet_manager')}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Edit Tasks
          </button>
        </div>
      </div>

      {/* Class Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Students
          </span>
          <div className="text-2xl font-black text-slate-900">{studentsList.length}</div>
          <p className="text-[11px] text-slate-500">CS Explorers Class Roster</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Submissions Logged
          </span>
          <div className="text-2xl font-black text-slate-900">{allSubmissions.length}</div>
          <p className="text-[11px] text-slate-500">Across 15 Scratch tasks</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Flagged for Review
          </span>
          <div className="text-2xl font-black text-amber-600">{needsReviewCount}</div>
          <p className="text-[11px] text-amber-700 font-semibold">Requires teacher attention</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Approved Submissions
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {allSubmissions.filter((s) => s.status === 'teacher_approved').length}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">Verified final marks</p>
        </div>
      </div>

      {/* Student Roster Cards */}
      <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <span>Student Class Roster</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studentsList.map((stu) => {
            const completedCount = Object.keys(stu.bestScorePerTask).length;
            const percentage = Math.round((stu.totalMarksEarned / 1500) * 100);

            return (
              <div
                key={stu.id}
                onClick={() => setStudentFilter(stu.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  studentFilter === stu.id
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-400/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={stu.avatar}
                    alt={stu.name}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{stu.name}</h4>
                    <p className="text-[11px] text-slate-500">{stu.email}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Points Earned</span>
                    <div className="font-bold text-slate-900">
                      {stu.totalMarksEarned} <span className="text-slate-400 font-normal">/ 1500</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px]">Progress</span>
                    <div className="font-bold text-purple-700">
                      {completedCount}/15 ({percentage}%)
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Submissions Filter Toolbar */}
      <section className="space-y-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Student Filter */}
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold focus:outline-hidden"
            >
              <option value="All">All Students</option>
              {studentsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold focus:outline-hidden"
            >
              <option value="All">All Classes (5–7)</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
            </select>

            {/* Day Filter */}
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold focus:outline-hidden"
            >
              <option value="All">All Days</option>
              <option value="1">Day 1</option>
              <option value="2">Day 2</option>
              <option value="3">Day 3</option>
              <option value="4">Day 4</option>
              <option value="5">Day 5</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold focus:outline-hidden"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="needs_review">Needs Review</option>
              <option value="teacher_approved">Teacher Approved</option>
              <option value="ai_evaluated">AI Evaluated</option>
            </select>
          </div>

          <span className="text-slate-400 text-xs">
            Showing <strong className="text-slate-800">{filtered.length}</strong> of{' '}
            {allSubmissions.length} submissions
          </span>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading submissions...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No submissions match your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">Student</th>
                    <th className="py-3 px-4 font-bold">Task & Day</th>
                    <th className="py-3 px-4 font-bold">Difficulty</th>
                    <th className="py-3 px-4 font-bold">Attempt</th>
                    <th className="py-3 px-4 font-bold">AI Score</th>
                    <th className="py-3 px-4 font-bold">Final Marks</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((sub) => {
                    const finalScore = sub.teacherAdjustment
                      ? sub.teacherAdjustment.adjustedScore
                      : sub.aiAssessment.overallScore;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sub.userName}</div>
                          <div className="text-[10px] text-slate-400">{sub.userEmail}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sub.taskTitle}</div>
                          <div className="text-[10px] text-slate-500">Day {sub.day}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.difficulty === 'Easy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.difficulty === 'Medium'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {sub.difficulty}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-500">
                          #{sub.attemptNumber}
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {sub.aiAssessment.overallScore}/100
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900">
                          <span
                            className={`px-2 py-0.5 rounded-full font-black ${
                              finalScore >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : finalScore >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {finalScore}/100
                          </span>
                          {sub.teacherAdjustment && (
                            <span className="block text-[9px] text-purple-700 font-bold mt-0.5">
                              (Adjusted)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                              sub.status === 'teacher_approved'
                                ? 'bg-purple-100 text-purple-800'
                                : sub.status === 'needs_review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sub.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openReviewModal(sub)}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Review & Grade</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Review & Mark Adjustment Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                  Submission Moderation
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {reviewingSubmission.taskTitle} — {reviewingSubmission.userName}
                </h3>
              </div>
              <button
                onClick={() => setReviewingSubmission(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Submission Overview Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Student</span>
                  <div className="font-bold text-slate-900">{reviewingSubmission.userName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Day & Difficulty</span>
                  <div className="font-bold text-slate-900">
                    Day {reviewingSubmission.day} ({reviewingSubmission.difficulty})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">AI Proposed Score</span>
                  <div className="font-bold text-slate-900">
                    {reviewingSubmission.aiAssessment.overallScore} / 100
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Status</span>
                  <div className="font-bold text-purple-700">
                    {reviewingSubmission.status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Student Scratch Project Link / .sb3 Evidence */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Scratch Project Evidence</span>
                </h4>

                {reviewingSubmission.scratchUrl && (
                  <p className="text-slate-600">
                    <strong>Project URL: </strong>
                    <a
                      href={reviewingSubmission.scratchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-medium inline-flex items-center gap-1"
                    >
                      <span>{reviewingSubmission.scratchUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}

                {reviewingSubmission.sb3Report && reviewingSubmission.sb3Report.success ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 mt-2">
                    <div className="font-bold text-slate-800">
                      Static Block Structure Analysis: {reviewingSubmission.sb3Report.summary}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Opcodes verified: {reviewingSubmission.sb3Report.opcodesFound.slice(0, 10).join(', ')}
                    </div>
                  </div>
                ) : (
                  <p className="text-amber-700 text-xs font-medium">
                    No .sb3 archive uploaded with this submission.
                  </p>
                )}
              </div>

              {/* Student Reflection */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900">Student Code Reflection:</h4>
                <p className="text-slate-600 italic leading-relaxed">
                  "{reviewingSubmission.reflectionText || 'No reflection text provided.'}"
                </p>
              </div>

              {/* Question Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Question Answers & AI Rubric Scoring:
                </h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {reviewingSubmission.aiAssessment.questionAssessments.map((qa, i) => (
                    <div
                      key={qa.qId}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Question {i + 1}</span>
                        <span className="font-bold text-slate-700">
                          {qa.score} / {qa.maxScore} marks
                        </span>
                      </div>
                      <p className="text-slate-600">
                        <strong>Student Answer: </strong>
                        {reviewingSubmission.answers[qa.qId] || '(Blank)'}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        <strong>Feedback: </strong>
                        {qa.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Grade Adjustment Form */}
              <form
                onSubmit={handleSaveAdjustment}
                className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-purple-700" />
                    <span>Adjust Grade & Record Reason</span>
                  </h4>
                  <span className="text-xs text-purple-800 font-semibold">
                    Original AI Score: {reviewingSubmission.aiAssessment.overallScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Final Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={adjustedScore}
                      onChange={(e) => setAdjustedScore(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason for Adjustment (Required)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Awarded partial credit for clever clone workaround..."
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teacher Feedback & Next Steps (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide constructive feedback visible to the student..."
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                {adjustError && (
                  <div className="p-3 rounded-xl bg-red-100 text-red-800 text-xs font-semibold">
                    {adjustError}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  {adjustSuccess ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Grade Adjustment Saved!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Saves to student profile and updates class ledger.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={isSavingAdjustment}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {isSavingAdjustment ? 'Saving Adjustment...' : 'Approve & Save Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
