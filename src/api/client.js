const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getToken() {
  return localStorage.getItem('blog_token') || '';
}

export function setToken(token) {
  localStorage.setItem('blog_token', token);
}

export function clearToken() {
  localStorage.removeItem('blog_token');
}

export function hasToken() {
  return !!getToken();
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${getToken()}`,
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Posts
  getPosts() {
    return request('/posts');
  },
  getPost(id) {
    return request(`/posts/${id}`);
  },
  createPost(data) {
    return request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updatePost(id, data) {
    return request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deletePost(id) {
    return request(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
  // Image upload
  uploadImage(file) {
    const form = new FormData();
    form.append('file', file);
    return request('/upload', {
      method: 'POST',
      body: form,
    });
  },
};
