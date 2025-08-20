import { useEffect, useState } from 'react';
import api from '../axiosConfig';
import { Link } from 'react-router-dom';

export default function Therapists() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/api/therapists').then(res => setItems(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Therapists</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(t => (
          <Link key={t._id} to={`/therapists/${t._id}`} className="border p-4 rounded-xl hover:shadow">
            <div className="flex gap-4">
              <img alt="" src={t.photoUrl || 'https://via.placeholder.com/80'} className="w-20 h-20 rounded-full object-cover" />
              <div>
                <div className="font-medium">{t.user?.name}</div>
                <div className="text-sm opacity-80">{t.specialties?.join(', ')}</div>
                <div className="text-sm">${t.ratePerHour}/hr</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
