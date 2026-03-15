"use client";

import React from "react";
import { Task } from "@/types/task";
import Link from "next/link";
import { 
  Calendar, 
  Flag, 
  MoreVertical, 
  Trash2, 
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { clsx } from "clsx";
import TaskDetailView from "./TaskDetailView";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: string) => void;
}

const priorityColors = {
  low: "text-blue-500 bg-blue-50",
  medium: "text-amber-500 bg-amber-50",
  high: "text-red-500 bg-red-50",
};

const statusIcons = {
  pending: Clock,
  in_progress: AlertTriangle,
  completed: CheckCircle2,
};

export default function TaskCard({ task, onDelete, onEdit, onStatusChange }: TaskCardProps) {
  const [showOptions, setShowOptions] = React.useState(false);
  const [showDetail, setShowDetail] = React.useState(false);
  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Clock;

  return (
    <div className="card-premium group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={clsx(
            "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1",
            priorityColors[task.priority as keyof typeof priorityColors]
          )}>
            <Flag className="h-3 w-3" />
            {task.priority}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-all"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 animate-fade-in">
                <button 
                  onClick={() => { onEdit(task); setShowOptions(false); }}
                  className="flex w-full items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" /> Edit
                </button>
                <button 
                  onClick={() => { onDelete(task.id); setShowOptions(false); }}
                  className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="cursor-pointer" onClick={() => setShowDetail(true)}>
          <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">
            {task.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-slate-400 text-xs">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
          </div>
          
          <button 
            onClick={() => onStatusChange(task.id, task.status === "completed" ? "pending" : "completed")}
            className={clsx(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
              task.status === "completed" 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-slate-100 text-slate-600 hover:bg-primary-100 hover:text-primary-700"
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {task.status.replace("_", " ")}
          </button>
        </div>
      </div>

      {showDetail && (
        <TaskDetailView 
          task={task} 
          onClose={() => setShowDetail(false)} 
        />
      )}
    </div>
  );
}
