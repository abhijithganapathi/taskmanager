import { useState } from 'react';
import api from '../utils/api';
const addMinutes = (d, m) => new Date(new Date(d).getTime() + m*60000);

export default function BookSession(){
  const [startLocal, setStartLocal] = useState('');
  const [duration, setDuration] = useState(50);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e)=>{
    e.preventDefault();
    setMsg('');
    if (!startLocal) { setMsg('Pick a start time'); return; }
    const start = new Date(startLocal);
    const end = addMinutes(start, Number(duration));
    try{
      await api.post('/appointments', { start: start.toISOString(), end: end.toISOString(), notes });
      setMsg('Session booked! Check My Appointments.');
      setNotes('');
    }catch(err){
      setMsg(err?.response?.data?.msg || 'Booking failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Book a Session</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start time</label>
          <input type="datetime-local" className="border rounded-xl p-3 w-full"
                 value={startLocal} onChange={e=>setStartLocal(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input type="number" min="10" className="border rounded-xl p-3 w-full"
                 value={duration} onChange={e=>setDuration(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea className="border rounded-xl p-3 w-full" rows="3"
                    value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
        <button className="px-4 py-2 rounded-xl bg-blue-600 text-white">Book</button>
        {msg && <div className="text-sm mt-2">{msg}</div>}
      </form>
    </div>
  );
}
