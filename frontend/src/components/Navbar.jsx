import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = () => { logout(); nav('/login'); };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-semibold tracking-tight">Therapy</Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-700">
            <Link to="/">Therapists</Link>
            {user && <Link to="/availability">Manage Availability</Link>}
            {user && <Link to="/appointments">My Appointments</Link>}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {!user && <Link to="/login" className="text-sm">Login</Link>}
          {!user && <Link to="/register" className="px-3 py-1.5 rounded-lg border text-sm">Register</Link>}
          {user && <span className="text-sm text-gray-600">{user.name || user.email}</span>}
          {user && <button onClick={onLogout} className="px-3 py-1.5 rounded-lg border text-sm">Logout</button>}
        </div>
      </div>
    </header>
  );
}
