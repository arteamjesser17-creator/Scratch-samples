import fs from 'fs';
import path from 'path';
import { ALL_TASKS, TaskItem } from './data/tasksData';
import { AiAssessmentResult } from './aiGrader';
import { ParsedSb3Report } from './sb3Parser';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string;
  gradeLevel: string;
  streakDays: number;
  totalMarksEarned: number; // 0 initially
  bestScorePerTask: Record<string, number>; // initially empty {}
  badges: string[]; // initially empty []
  createdAt?: string;
}

export interface SubmissionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  taskId: string;
  taskTitle: string;
  day: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answers: Record<string, string>;
  scratchUrl?: string;
  sb3Report?: ParsedSb3Report | null;
  reflectionText: string;
  attemptNumber: number;
  submittedAt: string;
  aiAssessment: AiAssessmentResult;
  teacherAdjustment?: {
    originalScore: number;
    adjustedScore: number;
    reason: string;
    teacherNotes: string;
    adjustedBy: string;
    adjustedAt: string;
  };
  status: 'ai_evaluated' | 'needs_review' | 'teacher_approved';
}

interface DatabaseSchema {
  users: Record<string, UserProfile>;
  tasks: Record<string, TaskItem>;
  submissions: SubmissionRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), '.server-data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  const tasksMap: Record<string, TaskItem> = {};
  for (const t of ALL_TASKS) {
    tasksMap[t.id] = t;
  }

  // Teacher account available for grading
  const users: Record<string, UserProfile> = {
    'teacher-henderson': {
      id: 'teacher-henderson',
      name: 'Ms. Henderson',
      email: 'henderson@csacademy.edu',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henderson',
      gradeLevel: 'CS Lead & Scratch Mentor (Classes 5–7)',
      streakDays: 1,
      totalMarksEarned: 0,
      bestScorePerTask: {},
      badges: ['Certified Educator'],
      createdAt: new Date().toISOString(),
    },
  };

  return {
    users,
    tasks: tasksMap,
    submissions: [], // Zero pre-filled submissions
  };
}

class StorageEngine {
  private db: DatabaseSchema;

  constructor() {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        // Ensure all 15 tasks are synced
        for (const t of ALL_TASKS) {
          if (!this.db.tasks[t.id]) {
            this.db.tasks[t.id] = t;
          }
        }
      } catch {
        this.db = getInitialDatabase();
        this.save();
      }
    } else {
      this.db = getInitialDatabase();
      this.save();
    }
  }

  private save() {
    try {
      ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database to disk:', e);
    }
  }

  resetAll(): void {
    this.db = getInitialDatabase();
    this.save();
  }

  getTasks(): TaskItem[] {
    return Object.values(this.db.tasks);
  }

  getTask(id: string): TaskItem | undefined {
    return this.db.tasks[id];
  }

  updateTask(id: string, updates: Partial<TaskItem>): TaskItem | undefined {
    if (!this.db.tasks[id]) return undefined;
    this.db.tasks[id] = { ...this.db.tasks[id], ...updates };
    this.save();
    return this.db.tasks[id];
  }

  getUsers(): UserProfile[] {
    return Object.values(this.db.users);
  }

  getUser(id: string): UserProfile | undefined {
    return this.db.users[id];
  }

  saveUser(user: UserProfile): UserProfile {
    this.db.users[user.id] = user;
    this.save();
    return user;
  }

  findOrCreateUser(params: {
    name: string;
    role?: 'student' | 'teacher';
    email?: string;
    avatar?: string;
    gradeLevel?: string;
  }): UserProfile {
    const trimmedName = params.name.trim();
    const role = params.role || 'student';

    // Normalize an ID from name, e.g. "Aryan Sharma" -> "student-aryan-sharma"
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const userId = `${role}-${slug || 'user'}`;

    // Check if user already exists by ID or by exact name match
    if (this.db.users[userId]) {
      return this.db.users[userId];
    }

    const existingByName = Object.values(this.db.users).find(
      (u) => u.name.toLowerCase() === trimmedName.toLowerCase() && u.role === role
    );
    if (existingByName) {
      return existingByName;
    }

    // Create a pristine user record with exactly 0 scores, 0 badges, 0 completed tasks
    const newUser: UserProfile = {
      id: userId,
      name: trimmedName,
      email: params.email || `${slug || 'student'}@scratchmaster.app`,
      role,
      avatar:
        params.avatar ||
        (role === 'teacher'
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`),
      gradeLevel: params.gradeLevel || (role === 'teacher' ? 'CS Educator (Classes 5–7)' : 'Class 5 (Junior Explorers)'),
      streakDays: 1,
      totalMarksEarned: 0, // Starts at 0
      bestScorePerTask: {}, // Starts empty
      badges: [], // Starts empty
      createdAt: new Date().toISOString(),
    };

    this.db.users[newUser.id] = newUser;
    this.save();
    return newUser;
  }

  getSubmissions(filter?: { userId?: string; taskId?: string; day?: number }): SubmissionRecord[] {
    let list = this.db.submissions;
    if (filter?.userId) list = list.filter((s) => s.userId === filter.userId);
    if (filter?.taskId) list = list.filter((s) => s.taskId === filter.taskId);
    if (filter?.day) list = list.filter((s) => s.day === filter.day);
    return list;
  }

  getSubmission(id: string): SubmissionRecord | undefined {
    return this.db.submissions.find((s) => s.id === id);
  }

  addSubmission(record: SubmissionRecord): SubmissionRecord {
    this.db.submissions.unshift(record);

    // Update user stats and best score in database
    const user = this.db.users[record.userId];
    if (user) {
      const currentBest = user.bestScorePerTask[record.taskId] || 0;
      const finalScore = record.teacherAdjustment
        ? record.teacherAdjustment.adjustedScore
        : record.aiAssessment.overallScore;

      if (finalScore > currentBest) {
        user.bestScorePerTask[record.taskId] = finalScore;
      }

      // Recompute total marks earned (sum of real best scores)
      user.totalMarksEarned = Object.values(user.bestScorePerTask).reduce((a, b) => a + b, 0);

      // Check genuine badge unlock thresholds
      const completedCount = Object.keys(user.bestScorePerTask).length;
      if (completedCount >= 1 && !user.badges.includes('First Green Flag')) {
        user.badges.push('First Green Flag');
      }
      if (completedCount >= 5 && !user.badges.includes('5-Task Pioneer')) {
        user.badges.push('5-Task Pioneer');
      }
      if (completedCount >= 15 && !user.badges.includes('Challenge Champion')) {
        user.badges.push('Challenge Champion');
      }
      if (finalScore === 100 && !user.badges.includes('100% Club')) {
        user.badges.push('100% Club');
      }
      this.db.users[user.id] = user;
    }

    this.save();
    return record;
  }

  adjustGrade(
    submissionId: string,
    adjustedScore: number,
    reason: string,
    teacherNotes: string,
    adjustedBy: string
  ): SubmissionRecord | undefined {
    const sub = this.db.submissions.find((s) => s.id === submissionId);
    if (!sub) return undefined;

    const originalScore = sub.teacherAdjustment
      ? sub.teacherAdjustment.adjustedScore
      : sub.aiAssessment.overallScore;

    sub.teacherAdjustment = {
      originalScore,
      adjustedScore: Math.max(0, Math.min(100, adjustedScore)),
      reason,
      teacherNotes,
      adjustedBy,
      adjustedAt: new Date().toISOString(),
    };
    sub.status = 'teacher_approved';

    // Recalculate best score for user
    const user = this.db.users[sub.userId];
    if (user) {
      const taskSubs = this.db.submissions.filter(
        (s) => s.userId === sub.userId && s.taskId === sub.taskId
      );
      const best = Math.max(
        ...taskSubs.map((s) =>
          s.teacherAdjustment ? s.teacherAdjustment.adjustedScore : s.aiAssessment.overallScore
        )
      );
      user.bestScorePerTask[sub.taskId] = best;
      user.totalMarksEarned = Object.values(user.bestScorePerTask).reduce((a, b) => a + b, 0);
      this.db.users[user.id] = user;
    }

    this.save();
    return sub;
  }
}

export const storage = new StorageEngine();
