import express from 'express';
import { storage } from './storage';
import { parseSb3Buffer } from './sb3Parser';
import { assessSubmission } from './aiGrader';

export const apiRouter = express.Router();
apiRouter.use(express.json({ limit: '25mb' }));

// 1. Get all tasks
apiRouter.get('/tasks', (req, res) => {
  try {
    const tasks = storage.getTasks();
    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get single task
apiRouter.get('/tasks/:id', (req, res) => {
  try {
    const task = storage.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Edit task worksheet (Teacher action)
apiRouter.post('/tasks/:id/edit', (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    const updated = storage.updateTask(taskId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, task: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Parse .sb3 Project File
apiRouter.post('/parse-sb3', async (req, res) => {
  try {
    const { base64Data, fileName, taskId } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'No file data received.' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > 20 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File size exceeds maximum 20MB limit.' });
    }

    let expectedConfig;
    if (taskId) {
      const task = storage.getTask(taskId);
      if (task) {
        expectedConfig = task.expectedBlocks;
      }
    }

    const report = await parseSb3Buffer(buffer, fileName || 'project.sb3', expectedConfig);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Submit Worksheet for AI Assessment
apiRouter.post('/assess', async (req, res) => {
  try {
    const { userId, taskId, answers, scratchUrl, sb3Report, reflectionText } = req.body;

    if (!userId || !taskId) {
      return res.status(400).json({ success: false, error: 'Missing userId or taskId.' });
    }

    const task = storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const user = storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Determine attempt number
    const previousAttempts = storage.getSubmissions({ userId, taskId });
    const attemptNumber = previousAttempts.length + 1;

    // Run AI / Rubric Assessment
    const aiAssessment = await assessSubmission({
      task,
      answers: answers || {},
      scratchUrl,
      sb3Report,
      reflectionText: reflectionText || '',
    });

    // Save submission record
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record = storage.addSubmission({
      id: submissionId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      taskId: task.id,
      taskTitle: task.title,
      day: task.day,
      difficulty: task.difficulty,
      answers: answers || {},
      scratchUrl,
      sb3Report,
      reflectionText: reflectionText || '',
      attemptNumber,
      submittedAt: new Date().toISOString(),
      aiAssessment,
      status: aiAssessment.teacherReviewFlagged ? 'needs_review' : 'ai_evaluated',
    });

    res.json({
      success: true,
      submission: record,
      user: storage.getUser(userId),
    });
  } catch (err: any) {
    console.error('Assessment API error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get submissions
apiRouter.get('/submissions', (req, res) => {
  try {
    const { userId, taskId, day } = req.query;
    const filter: any = {};
    if (userId) filter.userId = String(userId);
    if (taskId) filter.taskId = String(taskId);
    if (day) filter.day = Number(day);

    const submissions = storage.getSubmissions(filter);
    res.json({ success: true, submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Get single submission
apiRouter.get('/submissions/:id', (req, res) => {
  try {
    const submission = storage.getSubmission(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    res.json({ success: true, submission });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Teacher adjust grade
apiRouter.post('/teacher/adjust-grade', (req, res) => {
  try {
    const { submissionId, adjustedScore, reason, teacherNotes, adjustedBy } = req.body;
    if (!submissionId || adjustedScore === undefined || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing submissionId, adjustedScore, or reason for adjustment.',
      });
    }

    const updated = storage.adjustGrade(
      submissionId,
      Number(adjustedScore),
      String(reason),
      String(teacherNotes || ''),
      String(adjustedBy || 'Teacher')
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Submission not found.' });
    }

    res.json({ success: true, submission: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Export Class Results to CSV
apiRouter.get('/teacher/export-csv', (req, res) => {
  try {
    const submissions = storage.getSubmissions();
    const headers = [
      'Submission ID',
      'Student Name',
      'Student Email',
      'Day',
      'Task Title',
      'Difficulty',
      'Attempt',
      'AI Overall Score',
      'Worksheet Score (/40)',
      'Project Score (/50)',
      'Reflection Score (/10)',
      'Teacher Adjusted Score',
      'Adjustment Reason',
      'Status',
      'Submitted At',
      'Scratch URL',
    ];

    const rows = submissions.map((s) => [
      s.id,
      `"${s.userName.replace(/"/g, '""')}"`,
      `"${s.userEmail}"`,
      s.day,
      `"${s.taskTitle.replace(/"/g, '""')}"`,
      s.difficulty,
      s.attemptNumber,
      s.aiAssessment.overallScore,
      s.aiAssessment.worksheetScore,
      s.aiAssessment.projectScore,
      s.aiAssessment.reflectionScore,
      s.teacherAdjustment ? s.teacherAdjustment.adjustedScore : '',
      `"${(s.teacherAdjustment?.reason || '').replace(/"/g, '""')}"`,
      s.status,
      s.submittedAt,
      `"${s.scratchUrl || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ScratchMaster_Class_Grades_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Users List & Profile Management
apiRouter.get('/users', (req, res) => {
  try {
    const users = storage.getUsers();
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/users/:id', (req, res) => {
  try {
    const user = storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/users/:id', (req, res) => {
  try {
    const user = storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const updated = storage.saveUser({ ...user, ...req.body });
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Student & Teacher Login or Register
apiRouter.post('/auth/login-or-register', (req, res) => {
  try {
    const { name, role, email, avatar, gradeLevel } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Please enter your name.' });
    }

    const user = storage.findOrCreateUser({
      name: name.trim(),
      role: role || 'student',
      email: email?.trim(),
      avatar,
      gradeLevel: gradeLevel?.trim(),
    });

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Reset All Data to Zero (User requested)
apiRouter.post('/auth/reset-all', (req, res) => {
  try {
    storage.resetAll();
    res.json({ success: true, message: 'All database scores and records reset to zero.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

