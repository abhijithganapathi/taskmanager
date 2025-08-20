import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function TherapistProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ bio:'', specialties:'', ratePerHour:0, languages:'', photoUrl:'' });

  const load = async () => {
    const p = await api.get(`/api/therapists/${id}`).then(r=>r.data);
    setProfile(p);
    setForm({
      bio: p.bio || '',
      specialties: (p.specialties||[]).join(', '),
      ratePerHour: p.ratePerHour || 0,
      languages: (p.languages||[]).join(', '),
      photoUrl: p.photoUrl || ''
    });
    const s = await api.get(`/api/availability?therapist=${id}`).then(r=>r.data);
    setSlots(s);
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [id]);

  const isMe = user && profile?.user?._id === user.id;

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bio: form.bio,
        specialties: form.specialties.split(',').map(s=>s.trim()).filter(Boolean),
        languages: form.languages.split(',').map(s=>s.trim()).filter(Boolean),
        ratePerHour: Number(form.ratePerHour),
        photoUrl: form.photoUrl
      };
      await api.post('/api/therapists/me', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEdit(false);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const book = async (slotId) => {
    try {
      await api.post('/api/appointments/book', { slotId }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Booked!');
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Booking failed');
    }
  };

  if (!profile) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-6">
        <img alt="" src={profile.photoUrl || 'https://via.placeholder.com/120'} className="w-28 h-28 rounded-full object-cover" />
        <div>
          <h1 className="text-2xl font-semibold">{profile.user?.name}</h1>
          <div className="opacity-80">{profile.specialties?.join(', ')}</div>
          <div className="opacity-80">${profile.ratePerHour}/hr</div>
          <p className="mt-2">{profile.bio}</p>
          <div className="opacity-80 text-sm mt-1">Languages: {profile.languages?.join(', ') || '-'}</div>
          {isMe && (
            <button className="mt-3 px-3 py-2 border rounded" onClick={()=>setEdit(v=>!v)}>
              {edit ? 'Close edit' : 'Edit profile'}
            </button>
          )}
        </div>
      </div>

      {edit && isMe && (
        <form onSubmit={saveProfile} className="grid gap-3 border p-4 rounded-xl">
          <input className="border p-2 rounded" placeholder="Photo URL" value={form.photoUrl} onChange={e=>setForm(f=>({...f, photoUrl:e.target.value}))}/>
          <textarea className="border p-2 rounded" placeholder="Bio" value={form.bio} onChange={e=>setForm(f=>({...f, bio:e.target.value}))}/>
          <input className="border p-2 rounded" placeholder="Specialties (comma separated)" value={form.specialties} onChange={e=>setForm(f=>({...f, specialties:e.target.value}))}/>
          <input className="border p-2 rounded" placeholder="Languages (comma separated)" value={form.languages} onChange={e=>setForm(f=>({...f, languages:e.target.value}))}/>
          <input className="border p-2 rounded" type="number" placeholder="Rate per hour" value={form.ratePerHour} onChange={e=>setForm(f=>({...f, ratePerHour:e.target.value}))}/>
          <button className="bg-black text-white px-4 py-2 rounded">Save</button>
        </form>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-3">Available slots</h2>
        <div className="grid gap-2">
          {slots.length === 0 && <div className="opacity-70">No open slots.</div>}
          {slots.map(s => (
            <div key={s._id} className="flex items-center justify-between border p-3 rounded">
              <div>
                <div className="font-medium">
                  {new Date(s.start).toLocaleString()} — {new Date(s.end).toLocaleTimeString()}
                </div>
                {s.isBooked && <div className="text-sm text-red-600">Booked</div>}
              </div>
              {!s.isBooked && user && <button className="px-3 py-2 border rounded" onClick={()=>book(s._id)}>Book</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
