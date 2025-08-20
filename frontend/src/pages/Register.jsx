import { useState } from 'react';
import api from '../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', form);
      nav('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-items-center">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-6 mt-10">
        <h1 className="text-2xl font-semibold mb-1">Create account</h1>
        <p className="text-sm text-gray-600 mb-6">Book therapy sessions in minutes.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded-lg px-3 py-2" name="name" placeholder="Full name" onChange={onChange} />
          <input className="w-full border rounded-lg px-3 py-2" name="email" type="email" placeholder="Email" onChange={onChange} />
          <input className="w-full border rounded-lg px-3 py-2" name="password" type="password" placeholder="Password" onChange={onChange} />
          <button className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <div className="text-sm text-gray-600 mt-4">
          Already have an account? <Link to="/login" className="underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
