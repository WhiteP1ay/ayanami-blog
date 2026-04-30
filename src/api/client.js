const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// // Node IDs for backend folder routing
// const POSTS_NODE = 10;
// const UPLOAD_NODE = 11;

/// Core fetch wrapper — cookie session auth via credentials: 'include'
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { ...options.headers };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }

  return res.json();
}

/// For mutation endpoints that return {success, error} instead of data
async function mutation(path, options) {
  const result = await request(path, options);
  // ActionVoidResult: {success: true} on success, {success: false, error: string} on failure
  if (result && result.success === false) {
    throw new Error(result.error || '操作失败');
  }
  return result;
}

export const api = {
  // Auth — cookie session
  login(username, password) {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  logout() {
    return request('/logout', { method: 'POST' });
  },
  checkAuth() {
    return request('/auth/me');
  },

  // Posts — read (no auth required)
  getPosts() {
    return request('/posts');
  },
  getPost(id) {
    return request(`/posts/${id}`);
  },

  // Posts — write (admin session required)
  createPost({ title, content }) {
    return mutation('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content}),
    });
  },
  updatePost(id, { title, content }) {
    return mutation(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
  },
  deletePost(id) {
    return mutation(`/posts/${id}`, {
      method: 'DELETE',
    });
  },

  // Image upload
  uploadImage(file) {
    const form = new FormData();
    form.append('file', file);
    // form.append('nodeId', String(UPLOAD_NODE));
    return request('/upload', {
      method: 'POST',
      body: form,
    });
  },
};
