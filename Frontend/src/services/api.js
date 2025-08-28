import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true, // send cookies by default
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      localStorage.setItem("token", token);
    } catch {
      // ignore storage unavailability (SSR/private mode)
    }
  } else {
    delete api.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem("token");
    } catch {
      // ignore storage unavailability
    }
  }
};

// Initialize Authorization header from storage on first load
try {
  const existing = localStorage.getItem("token");
  if (existing) setAuthToken(existing);
} catch {
  // ignore storage unavailability
}

export const fetchPosts = async ({
  page = 1,
  limit = 10,
  search = "",
  tag = "",
} = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (tag) params.tag = tag;
  const { data } = await api.get("/api/posts", { params });
  return data;
};

export const fetchPostBySlug = async (slug) => {
  const { data } = await api.get(`/api/posts/${slug}`);
  return data;
};

export const fetchTags = async () => {
  const { data } = await api.get("/api/posts/tags");
  return data;
};

// Auth APIs
export const signup = async ({ name, email, password }) => {
  const { data } = await api.post("/api/auth/signup", {
    name,
    email,
    password,
  });
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post("/api/auth/login", { email, password });
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const logout = async () => {
  await api.post("/api/auth/logout");
  setAuthToken(null);
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/api/auth/me");
  return data?.user;
};

// Authoring APIs
export const getMyPosts = async () => {
  const { data } = await api.get("/api/posts/mine");
  return data?.data || [];
};

export const getPostForEdit = async (id) => {
  const { data } = await api.get(`/api/posts/${id}/edit`);
  return data;
};

export const createPost = async (payload) => {
  const { data } = await api.post("/api/posts", payload);
  return data; // { id, slug }
};

export const updatePost = async (id, payload) => {
  const { data } = await api.patch(`/api/posts/${id}`, payload);
  return data; // { id, slug }
};

export const deletePost = async (id) => {
  await api.delete(`/api/posts/${id}`);
};

// Upload APIs
export const uploadImage = async (file) => {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post("/api/upload/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { url, filename }
};

export default api;
