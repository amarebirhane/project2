"use client";

import React, { useState, useEffect } from "react";
import { Task, Category } from "@/types/task";
import { taskService } from "@/features/tasks/taskService";
import { X, Save, AlertCircle } from "lucide-react";
import { getErrorMessage } from "@/utils/errorHandler";

interface TaskFormProps {
  task?: Task | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [status, setStatus] = useState(task?.status || "pending");
  const [deadline, setDeadline] = useState(task?.deadline?.split('T')[0] || "");
  const [categoryId, setCategoryId] = useState(task?.category_id || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    taskService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const taskData = {
        title,
        description,
        priority,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        category_id: categoryId || undefined,
      };

      if (task) {
        await taskService.updateTask(task.id, taskData);
      } else {
        await taskService.createTask(taskData);
      }
      onSave();
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to save task."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="card-premium w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Task Title</label>
            <input
              required
              className="input-base"
              placeholder="e.g. Design System Implementation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              className="input-base min-h-[100px] py-3"
              placeholder="What needs to be done?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Priority</label>
              <select 
                className="input-base bg-white" 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select 
                className="input-base bg-white"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Deadline</label>
            <input
              type="date"
              className="input-base"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
