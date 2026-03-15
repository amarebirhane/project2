import React, { useState, useEffect } from 'react';
import { collaborationService } from '../services/collaborationService';
import userService from '../services/userService';
import { TaskShare } from '../types/task';
import { User } from '../types/user';

interface ShareTaskModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: () => void;
}

const ShareTaskModal: React.FC<ShareTaskModalProps> = ({ taskId, isOpen, onClose, onShareSuccess }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<"read" | "write">("read");
  const [collaborators, setCollaborators] = useState<TaskShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen, taskId]);

  const fetchCollaborators = async () => {
    try {
      const data = await collaborationService.getTaskCollaborators(taskId);
      setCollaborators(data);
    } catch (err) {
      console.error('Failed to fetch collaborators', err);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // For simplicity, we assume we can look up user by email or the backend handles it.
      // In this version, we'll need the userId. Let's assume the user enters an email 
      // and we have a search endpoint or we just use a placeholder for now.
      // Ideally, userService should have a searchUserByEmail.
      
      // For now, let's just use a prompt or assume the user exists.
      // Real implementation would search for the user first.
      alert('In a real app, this would search for the user by email first.');
      
      // Dummy user ID for demonstration if search isn't ready
      const dummyUserId = "00000000-0000-0000-0000-000000000000"; 
      
      await collaborationService.shareTask(taskId, dummyUserId, permission);
      setEmail('');
      fetchCollaborators();
      onShareSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to share task');
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async (shareId: string) => {
    if (!window.confirm('Remove this collaborator?')) return;
    try {
      await collaborationService.unshareTask(shareId);
      fetchCollaborators();
    } catch (err) {
      alert('Failed to remove collaborator');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permission</label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as any)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="read">Can View (Read Only)</option>
              <option value="write">Can Edit (Write)</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Sharing...' : 'Invite Collaborator'}
          </button>
        </form>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Current Collaborators</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {collaborators.length === 0 ? (
              <p className="text-gray-400 italic text-sm">No collaborators yet.</p>
            ) : (
              collaborators.map((collab) => (
                <div key={collab.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">User ID: {collab.user_id.substring(0, 8)}...</p>
                    <p className="text-xs text-gray-500">{collab.permission === 'write' ? 'Can Edit' : 'Read Only'}</p>
                  </div>
                  <button
                    onClick={() => handleUnshare(collab.id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareTaskModal;
