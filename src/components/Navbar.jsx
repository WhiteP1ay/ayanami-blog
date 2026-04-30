import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="emoji">🌸</span>
        <span>ayanami</span>
      </Link>

      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="菜单"
      >
        <span /><span /><span />
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={closeMenu}>文章</Link>
        {user ? (
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { navigate('/new'); closeMenu(); }}
            >
              ✏️ 写点什么
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { logout(); closeMenu(); }}
            >
              退出
            </button>
          </>
        ) : (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { navigate('/login'); closeMenu(); }}
          >
            登录
          </button>
        )}
      </div>
    </nav>
  );
}
