import { useEffect, useState } from 'react';
import api from '../utils/api';
const fmt = d => { try { return new Date(d).toLocaleString(); } catch { return d; } };

export default function MyAppointments(){
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState('');

  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await api.get('/appointments/me');
        setItems(data); setErr('');
      }catch(e){ setErr(e?.response?.data?.msg || 'Failed to load'); }
      finally{ setLoading(false); }
    })();
  },[]);

  if (loading) return <div className="p-6 opacity-70">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-semibold">My Appointments</h1>
      {items.length===0 ? <div className="opacity-70">No appointments yet.</div> :
        items.map(a=>(
          <div key={a._id} className="bg-white rounded-2xl shadow p-4">
            <div className="font-medium">{fmt(a.start)} → {fmt(a.end)}</div>
            <div className="text-sm opacity-70">Status: {a.status}</div>
            {a.notes ? <div className="text-sm mt-2">{a.notes}</div> : null}
          </div>
        ))
      }
    </div>
  );
}
