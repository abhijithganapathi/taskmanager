import { useEffect, useState } from 'react';
import api from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function MyAppointments() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [asTherapist, setAsTherapist] = useState(false);

  const load = async (modeTherapist) => {
    const url = modeTherapist ? '/api/appointments/therapist' : '/api/appointments/me';
    const data = await api.get(url, { headers: { Authorization: `Bearer ${user.token}` } }).then(r=>r.data);
    setItems(data);
  };

  useEffect(()=>{ load(asTherapist); /* eslint-disable-next-line */ }, [asTherapist]);

  const cancel = async (id) => {
    try {
      await api.post(`/api/appointments/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      await load(asTherapist);
    } catch (e) {
      alert(e.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Appointments</h1>
        <div className="flex gap-2">
          <button className={`px-3 py-1 border rounded ${!asTherapist ? 'bg-black text-white':''}`} onClick={()=>setAsTherapist(false)}>As Patient</button>
          <button className={`px-3 py-1 border rounded ${asTherapist ? 'bg-black text-white':''}`} onClick={()=>setAsTherapist(true)}>As Therapist</button>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map(a => (
          <div key={a._id} className="border p-3 rounded flex items-center justify-between">
            <div>
              <div className="font-medium">
                {new Date(a.start).toLocaleString()} — {new Date(a.end).toLocaleTimeString()}
              </div>
              <div className="text-sm opacity-80">
                {asTherapist ? `Patient: ${a.patient?.name || a.patient?.email}` : `Therapist: ${a.therapist?.user?.name}`}
              </div>
              <div className="text-sm">Status: {a.status}</div>
            </div>
            {a.status === 'booked' && (
              <button className="px-3 py-1 border rounded" onClick={()=>cancel(a._id)}>Cancel</button>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="opacity-70">No appointments.</div>}
      </div>
    </div>
  );
}
