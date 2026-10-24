import React, { createContext, useContext, useEffect, useState } from 'react';
import { TaskItem, SubmissionRecord, ViewMode } from '../types';
import { useAuth } from './AuthContext';

interface PlatformContextType {
  tasks: TaskItem[];
  loadingTasks: boolean;
  viewMode: ViewMode;
  setViewMode: (view: ViewMode) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  activeSubmission: SubmissionRecord | null;
  setActiveSubmission: (sub: SubmissionRecord | null) => void;
  submissions: SubmissionRecord[];
  refreshSubmissions: () => Promise<void>;
  resumeLearning: () => void;
  openTaskWorksheet: (taskId: string) => void;
  openDayTasks: (day: number) => void;
  getDayScore: (day: number) => { earned: number; total: number; completedCount: number };
  getOverallStats: () => {
    earnedMarks: number;
    possibleMarks: number;
    percentage: number;
    completedTasksCount: number;
    totalTasksCount: number;
  };
  getTaskStatus: (taskId: string) => {
    isCompleted: boolean;
    bestScore: number;
    latestScore?: number;
    attemptsCount: number;
    isPendingProject: boolean;
  };
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<SubmissionRecord | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch submissions safely
  const refreshSubmissions = async () => {
    if (!currentUser?.id) {
      setSubmissions([]);
      return;
    }
    try {
      const res = await fetch(`/api/submissions?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
      }
    } catch (e) {
      console.error('Failed to load submissions:', e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    refreshSubmissions();
  }, [currentUser?.id]);

  const openTaskWorksheet = (taskId: string) => {
    const t = tasks.find((item) => item.id === taskId);
    if (t) {
      setSelectedDay(t.day);
    }
    setSelectedTaskId(taskId);
    setViewMode('worksheet');
  };

  const openDayTasks = (day: number) => {
    setSelectedDay(day);
    setViewMode('task_select');
  };

  const getTaskStatus = (taskId: string) => {
    const taskSubs = submissions.filter((s) => s.taskId === taskId);
    const attemptsCount = taskSubs.length;
    const bestScore = currentUser?.bestScorePerTask?.[taskId] || 0;
    const latestSub = taskSubs[0];
    const latestScore = latestSub
      ? latestSub.teacherAdjustment
        ? latestSub.teacherAdjustment.adjustedScore
        : latestSub.aiAssessment.overallScore
      : undefined;

    const isPendingProject = Boolean(latestSub?.aiAssessment?.isProjectPending);

    return {
      isCompleted: bestScore > 0,
      bestScore,
      latestScore,
      attemptsCount,
      isPendingProject,
    };
  };

  const getDayScore = (day: number) => {
    const dayTasks = tasks.filter((t) => t.day === day);
    const total = dayTasks.length * 100; // 300
    let earned = 0;
    let completedCount = 0;

    for (const t of dayTasks) {
      const score = currentUser?.bestScorePerTask?.[t.id] || 0;
      if (score > 0) {
        completedCount++;
        earned += score;
      }
    }

    return { earned, total, completedCount };
  };

  const getOverallStats = () => {
    const totalTasksCount = tasks.length || 15;
    const possibleMarks = totalTasksCount * 100; // 1500
    let earnedMarks = 0;
    let completedTasksCount = 0;

    for (const t of tasks) {
      const score = currentUser?.bestScorePerTask?.[t.id] || 0;
      if (score > 0) {
        completedTasksCount++;
        earnedMarks += score;
      }
    }

    const percentage = possibleMarks > 0 ? Math.round((earnedMarks / possibleMarks) * 100) : 0;

    return {
      earnedMarks,
      possibleMarks,
      percentage,
      completedTasksCount,
      totalTasksCount,
    };
  };

  const resumeLearning = () => {
    // Find the first task not yet completed or with score < 80
    for (const t of tasks) {
      const score = currentUser?.bestScorePerTask?.[t.id] || 0;
      if (score === 0) {
        openTaskWorksheet(t.id);
        return;
      }
    }
    // If all completed, open first task with lowest score
    let lowestTask = tasks[0];
    let minScore = 101;
    for (const t of tasks) {
      const score = currentUser?.bestScorePerTask?.[t.id] || 0;
      if (score < minScore) {
        minScore = score;
        lowestTask = t;
      }
    }
    if (lowestTask) {
      openTaskWorksheet(lowestTask.id);
    } else if (tasks.length > 0) {
      openTaskWorksheet(tasks[0].id);
    }
  };

  return (
    <PlatformContext.Provider
      value={{
        tasks,
        loadingTasks,
        viewMode,
        setViewMode,
        selectedDay,
        setSelectedDay,
        selectedTaskId,
        setSelectedTaskId,
        activeSubmission,
        setActiveSubmission,
        submissions,
        refreshSubmissions,
        resumeLearning,
        openTaskWorksheet,
        openDayTasks,
        getDayScore,
        getOverallStats,
        getTaskStatus,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
