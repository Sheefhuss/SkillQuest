import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL

export const apiClient = {
  get: async (path) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },
  post: async (path, data) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_BASE}${path}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },
  patch: async (path, data) => {
    const token = localStorage.getItem("token");
    const res = await axios.patch(`${API_BASE}${path}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },
  delete: async (path) => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },
};