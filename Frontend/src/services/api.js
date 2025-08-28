
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

export const fetchPosts = async ({ page = 1, limit = 10, search = '', tag = '' } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (tag) params.tag = tag;
  const { data } = await api.get('/api/posts', { params });
  return data;
};

export const fetchPostBySlug = async (slug) => {
  const { data } = await api.get(`/api/posts/${slug}`);
  return data;
};

export const fetchTags = async () => {
  const { data } = await api.get('/api/posts/tags');
  return data;
};

export default api;