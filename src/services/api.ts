import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    uploadId: number;
    originalName: string;
    rowCount: number;
    headers: string[];
    rows: any[][];
  };
}

export interface DataItem {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  uploaded_at: string;
  row_count: number;
  status: string;
  rows: Record<string, string>[];
}

export const uploadPDF = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getAllData = async (): Promise<DataItem[]> => {
  const response = await api.get<{ success: boolean; count: number; data: DataItem[] }>('/api/data');
  return response.data.data; // Extract the data array from the wrapper
};

export const getDataById = async (id: number): Promise<DataItem> => {
  const response = await api.get<DataItem>(`/api/data/${id}`);
  return response.data;
};

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await api.get('/api/health');
  return response.data;
};
