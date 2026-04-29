import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, hasToken, setToken } from '../api/client';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTokenSetup, setShowTokenSetup] = useState(!hasToken());
  const [tokenInput, setTokenInput] = useState('');

  useEffect(() => {
    if (!hasToken()) return;
    api.getPosts()
      .then(data => setPosts(data))
      .catch(err => {
        if (err.message.includes('401') || err.message.includes('403')) {
          setShowTokenSetup(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      setToken(tokenInput.trim());
      setShowTokenSetup(false);
      setLoading(true);
      api.getPosts()
        .then(data => setPosts(data))
        .finally(() => setLoading(false));
    }
  };

  if (showTokenSetup) {
    return (
      <div className="container">
        <div className="token-setup">
          <div className="emoji">🔐</div>
          <h2>需要访问令牌</h2>
          <p>输入你的 Bearer Token 来连接后端</p>
          <form onSubmit={handleTokenSubmit}>
            <input
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="粘贴 Token..."
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
            >
              确认
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container"><div className="spinner" /></div>;
  }

  return (
    <div className="container">
      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📝</div>
          <h2>还没有文章</h2>
          <p>
            点击右上角的 <Link to="/new">写点什么</Link> 开始吧
          </p>
        </div>
      ) : (
        <div className="post-list">
          {posts.map(post => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="post-card"
              style={{ display: 'block' }}
            >
              {post.cover_url && (
                <img src={post.cover_url} alt="" className="post-card-thumb" />
              )}
              <div className="post-card-header">
                <h2 className="post-card-title">{post.title}</h2>
                <span className="post-card-date">
                  {post.created_at ? new Date(post.created_at).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  }) : ''}
                </span>
              </div>
              {post.excerpt && (
                <p className="post-card-excerpt">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
