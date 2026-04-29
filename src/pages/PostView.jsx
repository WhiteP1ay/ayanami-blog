import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { api } from '../api/client';

// Configure marked
marked.setOptions({
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return code;
  },
});

export default function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.getPost(id)
      .then(data => setPost(data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deletePost(id);
      navigate('/');
    } catch (err) {
      alert('删除失败：' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="spinner" /></div>;
  }

  if (!post) return null;

  const htmlContent = marked(post.content || '');

  return (
    <div className="container">
      <article className="post-view">
        <div className="post-view-header">
          <h1 className="post-view-title">{post.title}</h1>
          <div className="post-view-meta">
            <span>
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </span>
            <div className="post-view-actions">
              <Link to={`/edit/${post.id}`} className="btn btn-outline btn-sm">
                ✏️ 编辑
              </Link>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowDelete(true)}
              >
                🗑️ 删除
              </button>
            </div>
          </div>
        </div>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="emoji">💭</div>
            <h3>确定删除这篇文章？</h3>
            <p>删了就没了哦</p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowDelete(false)}
              >
                取消
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
