import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import {
  X,
  UserCheck,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  LogOut,
  RotateCcw,
} from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    availableUsers,
    switchUser,
    updateProfile,
    logout,
    resetEntireDatabase,
  } = useAuth();

  const [editingName, setEditingName] = useState(currentUser?.name || '');
  const [editingGrade, setEditingGrade] = useState(currentUser?.gradeLevel || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSelectUser = (id: string) => {
    switchUser(id);
    const selected = availableUsers.find((u) => u.id === id);
    if (selected) {
      setEditingName(selected.name);
      setEditingGrade(selected.gradeLevel);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      name: editingName,
      gradeLevel: editingGrade,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'Reset the entire database? All scores, badges, and submissions will be reset to zero.'
      )
    ) {
      await resetEntireDatabase();
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">User Profile & Account Settings</h2>
              <p className="text-xs text-slate-500">Active student or teacher profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Profile Info Card */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-xl bg-white border border-slate-200 object-cover"
              />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{currentUser.name}</h3>
                <p className="text-xs text-slate-500">{currentUser.gradeLevel}</p>
                {currentUser.role === 'student' && (
                  <p className="text-[11px] font-bold text-orange-600 mt-0.5">
                    {currentUser.totalMarksEarned} / 1500 Marks Earned
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Switch Existing Profile if others exist */}
          {availableUsers.length > 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Switch to Another Account
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableUsers
                  .filter((u) => u.id !== currentUser.id)
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user.id)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-left flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg bg-slate-100 object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">{user.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {user.role === 'student' ? `${user.totalMarksEarned} pts` : 'Teacher'}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Edit Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class (Class 5 to 7)
                </label>
                {currentUser.role === 'student' ? (
                  <select
                    value={editingGrade}
                    onChange={(e) => setEditingGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-hidden bg-white font-medium"
                  >
                    <option value="Class 5 (Junior Explorers)">Class 5 (Junior Explorers)</option>
                    <option value="Class 6 (Game Builders)">Class 6 (Game Builders)</option>
                    <option value="Class 7 (Logic & Physics)">Class 7 (Logic & Physics)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editingGrade}
                    onChange={(e) => setEditingGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-hidden"
                    required
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
              <span className="text-[11px] text-slate-400">{currentUser.email}</span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Database Reset Option */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Database to Zero</span>
              </span>
              <button
                type="button"
                onClick={handleResetData}
                className="text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer"
              >
                Wipe All & Start Fresh
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Resets all scores, submissions, and tasks across the server to 0.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
