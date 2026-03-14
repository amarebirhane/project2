"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { taskService } from "@/features/tasks/taskService";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import { Plus, Search, Filter, Loader2 } from "lucide-react";

export default function TaskList() {
  const { tasks, loading, refreshTasks, deleteTask: apiDeleteTask, updateTask: apiUpdateTask } = useTasks();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await apiDeleteTask(id);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await apiUpdateTask(id, { status });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                         task.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-sm text-slate-500">Track and manage your productivity pipeline</p>
        </div>
        <button 
          onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between card-premium p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="input-base pl-10"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["all", "pending", "in_progress", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                filter === f 
                  ? "bg-primary-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDelete={handleDelete}
              onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="card-premium h-64 flex flex-col items-center justify-center text-center p-8">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Filter className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-800">No tasks found</p>
          <p className="text-slate-500 max-w-sm">Try adjusting your filters or search terms, or create a new task to get started.</p>
        </div>
      )}

      {isFormOpen && (
        <TaskForm 
          task={editingTask}
          onSave={() => { setIsFormOpen(false); fetchTasks(); }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
