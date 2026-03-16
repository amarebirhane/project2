import api from "@/services/api";

export const backupService = {
  getBackups: async () => {
    const response = await api.get<string[]>("/backup/list");
    return response.data;
  },

  createBackup: async () => {
    const response = await api.post("/backup/create");
    return response.data;
  },

  deleteBackup: async (filename: string) => {
    await api.delete(`/backup/${filename}`);
  },

  getDownloadUrl: (filename: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    return `${API_URL}/backup/download/${filename}`;
  }
};
