import React, { useState } from 'react';
import { Download, Trash2, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export const ProfileSettings: React.FC = () => {
  const { user, updateName, updateUserPreferences, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [theme, setTheme] = useState<'light' | 'dark' | 'calm'>(user?.preferences?.theme || 'calm');
  const [timezone, setTimezone] = useState(user?.preferences?.timezone || 'UTC');
  const [aiContextSharing, setAiContextSharing] = useState(user?.preferences?.aiContextSharing ?? true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await updateName(name.trim());
    }
    await updateUserPreferences({
      theme,
      timezone,
      aiContextSharing,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('mindmate_auth_token') || 'usr_sarah_101';
      const res = await fetch('/api/v1/users/me/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmate-data-export-${user?.id || 'sarah'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to permanently delete your account and all associated mood, habit, and journal records? This action is irreversible.')) {
      await api.deleteAccount();
      logout();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Account Control</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#163327] mt-1">
          Profile & Privacy Preferences
        </h2>
        <p className="text-sm text-[#4E6B5D] mt-1">
          Control your identity, data retention, and how the AI Companion processes context.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDE7] shadow-sm space-y-8">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-medium bg-[#F9FAF8] border border-[#D8E4DC] rounded-xl p-3 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1.5">
                Email Address (Account Owner)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs font-medium bg-[#F0F3F1] border border-stone-200 rounded-xl p-3 text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#F0F4F1]">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1.5">
                Preferred Interface Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'calm')}
                className="w-full text-xs font-medium bg-[#F9FAF8] border border-[#D8E4DC] rounded-xl p-3 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
              >
                <option value="calm">MindMate Calm (Default Sage)</option>
                <option value="light">Pure Minimal Light</option>
                <option value="dark">Deep Sanctuary Slate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs font-medium bg-[#F9FAF8] border border-[#D8E4DC] rounded-xl p-3 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>

          {/* AI Context Sharing Setting */}
          <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#E0EBE3] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2D5A46]" />
                <span className="text-xs font-bold text-[#163327]">
                  AI Reflection Context Sharing
                </span>
              </div>
              <p className="text-xs text-[#527061] leading-relaxed">
                Allow the AI Reflection Companion to receive recent mood and habit trends to personalize mindfulness prompts. When disabled, the AI operates in strict stateless isolation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAiContextSharing(!aiContextSharing)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                aiContextSharing ? 'bg-[#2D5A46]' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  aiContextSharing ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved ? (
              <span className="text-xs text-[#2D5A46] font-semibold">
                ✓ Preferences updated successfully
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] rounded-xl shadow-xs transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>

        {/* Data Portability & GDPR Compliance */}
        <div className="pt-8 border-t border-[#F0F4F1] space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2D5A46]" />
            <h3 className="text-sm font-bold text-[#163327]">Data Sovereignty & Portability</h3>
          </div>
          <p className="text-xs text-[#527061] leading-relaxed">
            Download an unencrypted snapshot of your personal wellness records. You can import or inspect your full history at any time.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#2D5A46] bg-[#EAF2EC] hover:bg-[#D8E6DC] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Full JSON Export</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
