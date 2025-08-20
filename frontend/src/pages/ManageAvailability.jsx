import { useEffect, useState } from 'react';
import api from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function ManageAvailability() {
  const { user } = useAuth();
  const [meTherapist, setMeTherapist] = useState(null);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ start: '', end: '' });

  const load = async () => {
    const list = await api.get('/api/therapists').then(r=>r.data);
    const mine = list.find(t => t.user?._id === user.id);
    setMeTherapist(mine || null);
    if (mine) {
      const s = await api.get(`/api/availability?therapist=${mine._id}`).then(r=>r.data);
      setSlots(s);
    }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/availability', { start: form.start, end: form.end }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setForm({ start:'', end:'' });
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
  };

  const removeSlot = async (id) => {
    try {
      await api.delete(`/api/availability/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  if (!meTherapist) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-2">Manage Availability</h1>
        <p className="opacity-80">Create your therapist profile first (open your profile on the Therapists page and click “Edit profile”).</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Manage Availability</h1>

      <form onSubmit={addSlot} className="grid gap-2 border p-4 rounded">
        <label>Start</label>
        <input className="border p-2 rounded" type="datetime-local"
          value={form.start} onChange={e=>setForm(f=>({...f, start:e.target.value}))}/>
        <label>End</label>
        <input className="border p-2 rounded" type="datetime-local"
          value={form.end} onChange={e=>setForm(f=>({...f, end:e.target.value}))}/>
        <button className="bg-black text-white px-4 py-2 rounded mt-2">Add slot</button>
      </form>

      <div className="grid gap-2">
        {slots.map(s => (
          <div key={s._id} className="flex items-center justify-between border p-3 rounded">
            <div>{new Date(s.start).toLocaleString()} — {new Date(s.end).toLocaleTimeString()} {s.isBooked && <span className="text-red-600">(booked)</span>}</div>
            {!s.isBooked && <button className="px-3 py-1 border rounded" onClick={()=>removeSlot(s._id)}>Delete</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
