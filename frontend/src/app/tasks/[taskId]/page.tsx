"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { taskService } from "@/features/tasks/taskService";
import { Task } from "@/types/task";
import { 
  ArrowLeft, 
  Calendar, 
  Flag, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Save,
  Trash2
} from "lucide-react";
import { clsx } from "clsx";

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch a single task. For now, we'll find it in the list.
    const fetchTask = async () => {
      try {
        const tasks = await taskService.getTasks();
        const found = tasks.find(t => t.id === taskId);
        setTask(found || null);
      } catch (error) {
        console.error("Failed to fetch task", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  if (loading) return <div className="p-8 text-center"><Clock className="animate-spin inline mr-2" /> Loading task...</div>;
  if (!task) return <div className="p-8 text-center text-red-500">Task not found. <button onClick={() => router.back()} className="underline ml-2">Go back</button></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </button>

      <div className="card-premium p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <div className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              task.priority === "high" ? "bg-red-100 text-red-700" :
              task.priority === "medium" ? "bg-amber-100 text-amber-700" :
              "bg-blue-100 text-blue-700"
            )}>
              <Flag className="h-3 w-3" />
              {task.priority} Priority
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{task.title}</h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              onClick={async () => {
                if(confirm("Delete this task?")) {
                  await taskService.deleteTask(task.id);
                  router.push("/dashboard/my-tasks");
                }
              }}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Deadline</p>
              <p className="text-sm font-bold text-slate-800">
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline set"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={clsx(
              "p-2 rounded-lg",
              task.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            )}>
              {task.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Status</p>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {task.status.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Created</p>
              <p className="text-sm font-bold text-slate-800">
                {new Date(task.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Description</h3>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {task.description || "The user provided no detailed description for this task."}
          </p>
        </div>

        <div className="mt-12 flex justify-end gap-4">
          <button className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
            Edit Details
          </button>
          <button 
            onClick={async () => {
              await taskService.updateTask(task.id, { status: task.status === "completed" ? "pending" : "completed" });
              router.refresh(); // Or fetch again
            }}
            className="btn-primary"
          >
            Mark as {task.status === "completed" ? "Pending" : "Completed"}
          </button>
        </div>
      </div>
    </div>
  );
}
