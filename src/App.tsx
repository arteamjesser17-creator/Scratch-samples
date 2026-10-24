/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { Navbar } from './components/Navbar';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { StartingLoginView } from './views/StartingLoginView';
import { LandingView } from './views/LandingView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { DaySelectionView } from './views/DaySelectionView';
import { TaskSelectionView } from './views/TaskSelectionView';
import { WorksheetView } from './views/WorksheetView';
import { AssessmentResultView } from './views/AssessmentResultView';
import { ProgressAchievementsView } from './views/ProgressAchievementsView';
import { TeacherDashboardView } from './views/TeacherDashboardView';
import { WorksheetManagementView } from './views/WorksheetManagementView';
import { Code2, ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const { viewMode } = usePlatform();
  const { currentUser } = useAuth();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // If student or teacher is not logged in, render the clean starting login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar onOpenUserModal={() => setIsUserModalOpen(true)} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <StartingLoginView />
        </main>
        <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900">ScratchMaster AI</span>
              <span>• Zero State Initialization • Persistent Database</span>
            </div>
            <span>Scratch is a project of the Lifelong Kindergarten Group at the MIT Media Lab.</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar onOpenUserModal={() => setIsUserModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {viewMode === 'landing' && <LandingView />}
        {viewMode === 'dashboard' && <StudentDashboardView />}
        {viewMode === 'day_select' && <DaySelectionView />}
        {viewMode === 'task_select' && <TaskSelectionView />}
        {viewMode === 'worksheet' && <WorksheetView />}
        {viewMode === 'assessment' && <AssessmentResultView />}
        {viewMode === 'progress' && <ProgressAchievementsView />}
        {viewMode === 'teacher_dashboard' && <TeacherDashboardView />}
        {viewMode === 'worksheet_manager' && <WorksheetManagementView />}
      </main>

      {/* Profile & Switcher Modal */}
      <UserSwitcherModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-900">ScratchMaster AI</span>
            <span>• 5-Day Coding Challenge</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-center sm:text-right text-[11px]">
            <span>Scratch is a project of the Lifelong Kindergarten Group at the MIT Media Lab.</span>
            <a
              href="https://scratch.mit.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              <span>scratch.mit.edu</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <AppContent />
      </PlatformProvider>
    </AuthProvider>
  );
}
