export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Category {
  id: string;
  name: string;
  user_id: string;
}

export interface TaskShare {
  id: string;
  task_id: string;
  user_id: string;
  permission: "read" | "write";
  shared_at: string;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string;
  user_id: string;
  category_id?: string;
  created_at: string;
  category?: Category;
  shares?: TaskShare[];
  attachments?: Attachment[];
}

export type TaskCreate = Omit<Task, "id" | "created_at" | "category" | "user_id">;
export type TaskUpdate = Partial<TaskCreate>;
