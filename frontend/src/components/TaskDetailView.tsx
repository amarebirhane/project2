import React, { useState, useEffect } from 'react';
import { Task, Attachment, TaskShare } from '../types/task';
import { attachmentService } from '../services/attachmentService';
import { collaborationService } from '../services/collaborationService';
import ShareTaskModal from './ShareTaskModal';

interface TaskDetailViewProps {
  task: Task;
  onUpdate?: () => void;
  onClose: () => void;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, onUpdate, onClose }) => {
  const [attachments, setAttachments] = useState<Attachment[]>(task.attachments || []);
  const [shares, setShares] = useState<TaskShare[]>(task.shares || []);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [task.id]);

  const fetchData = async () => {
    try {
      const [attData, shareData] = await Promise.all([
        attachmentService.getTaskAttachments(task.id),
        collaborationService.getTaskCollaborators(task.id),
      ]);
      setAttachments(attData);
      setShares(shareData);
    } catch (err) {
      console.error('Failed to fetch task details', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      await attachmentService.uploadAttachment(task.id, file, (percent) => {
        setUploadProgress(percent);
      });
      fetchData();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await attachmentService.deleteAttachment(id);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block ${
              task.priority === 'high' ? 'bg-red-100 text-red-600' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>
              {task.priority} Priority
            </span>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{task.title}</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Share Task"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button onClick={onClose} className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600">
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Collaborators ({shares.length})</h3>
              <div className="flex -space-x-3 overflow-hidden">
                {shares.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">Only you have access.</p>
                ) : (
                  shares.map((share, i) => (
                    <div key={share.id} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold" title={`Collaborator ${i + 1}`}>
                      U{i + 1}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Attachments</h3>
                <label className="cursor-pointer text-blue-500 hover:text-blue-600 text-sm font-bold flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {uploading ? `Uploading ${uploadProgress}%` : 'Add File'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>

              {uploading && (
                <div className="mb-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {attachments.length === 0 ? (
                  <div className="col-span-2 p-8 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-xs font-medium">No files attached</span>
                  </div>
                ) : (
                  attachments.map((file) => (
                    <div key={file.id} className="group relative bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-600 hover:border-blue-200 transition-all">
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 cursor-pointer group-hover:no-underline"
                        title="Download file"
                      >
                        <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{file.file_name}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{(file.file_size / 1024).toFixed(1)} KB</p>
                        </div>
                      </a>
                      <button 
                        onClick={() => handleDeleteAttachment(file.id)}
                        className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-red-500 p-1 rounded-full shadow-md border border-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <ShareTaskModal 
          taskId={task.id} 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)}
          onShareSuccess={fetchData}
        />
      </div>
    </div>
  );
};

export default TaskDetailView;
