import { useState } from 'react';
import api from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data);
      nav('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-items-center">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-6 mt-10">
        <h1 className="text-2xl font-semibold mb-1">Login</h1>
        <p className="text-sm text-gray-600 mb-6">Welcome back.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2"
            name="email" type="email" placeholder="Email" onChange={onChange}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            name="password" type="password" placeholder="Password" onChange={onChange}
          />
          <button
            className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-sm text-gray-600 mt-4">
          No account? <Link to="/register" className="underline">Create one</Link>
        </div>
      </div>
    </div>
  );
}
