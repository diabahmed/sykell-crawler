import axios from "axios";

// Get the backend URL from environment variables, with a fallback for local dev
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is crucial for sending cookies
});

// Crawl API functions
export const crawlApi = {
  rerun: async (crawlId: number) => {
    const response = await apiClient.post(`/crawls/${crawlId}/rerun`);
    return response.data;
  },

  delete: async (crawlId: number) => {
    const response = await apiClient.delete(`/crawls/${crawlId}`);
    return response.data;
  },

  deleteBulk: async (crawlIds: number[]) => {
    const response = await apiClient.delete("/crawls/bulk", {
      data: { ids: crawlIds },
    });
    return response.data;
  },
};

export default apiClient;
