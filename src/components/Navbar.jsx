import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="emoji">🌸</span>
        <span>ayanami</span>
      </Link>
      <div className="navbar-links">
        <Link to="/">文章</Link>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/new')}>
          ✏️ 写点什么
        </button>
      </div>
    </nav>
  );
}
