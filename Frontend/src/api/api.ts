import axios from 'axios';
import { QueryResponse } from '../types';


// export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'; // Replace with your API base URL
export const API_BASE_URL =  'http://localhost:8000';     // Replace with your API base URL



const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const uploadPDF = async (file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  };

export const queryPDF = async (query: string): Promise<QueryResponse> => {
    try {
      const response = await api.post('/api/query', { query });
      return response.data;
    } catch (error) {
      console.error('Error querying PDF:', error);
      throw error;
    }
};