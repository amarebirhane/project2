import api from "@/services/api";
import { Task, TaskCreate, TaskUpdate, Category } from "@/types/task";

export const taskService = {
  getTasks: async (skip = 0, limit = 100) => {
    const response = await api.get<Task[]>("/tasks/", { params: { skip, limit } });
    return response.data;
  },

  createTask: async (task: TaskCreate) => {
    const response = await api.post<Task>("/tasks/", task);
    return response.data;
  },

  updateTask: async (id: string, task: TaskUpdate) => {
    const response = await api.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },

  getCategories: async () => {
    const response = await api.get<Category[]>("/categories/");
    return response.data;
  },

  createCategory: async (name: string) => {
    const response = await api.post<Category>("/categories/", { name });
    return response.data;
  },
};
