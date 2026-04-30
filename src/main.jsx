import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import PostView from './pages/PostView';
import PostEdit from './pages/PostEdit';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

/// Auth guard — redirect to /login if not authenticated
function RequireAuth({ children }) {
  const { user, checking } = useAuth();

  if (checking) {
    return <div className="container"><div className="spinner" /></div>;
  }

  if (!user) {
    const path = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(path)}`} replace />;
  }

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/blog">
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="post/:id" element={<PostView />} />
          <Route path="login" element={<Login />} />
          <Route
            path="new"
            element={
              <RequireAuth>
                <PostEdit />
              </RequireAuth>
            }
          />
          <Route
            path="edit/:id"
            element={
              <RequireAuth>
                <PostEdit />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
