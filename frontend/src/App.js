import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Therapists from './pages/Therapists';
import TherapistProfile from './pages/TherapistProfile';
import ManageAvailability from './pages/ManageAvailability';
import MyAppointments from './pages/MyAppointments'; // 👈 correct casing, no .jsx at end

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Therapists />} />
        <Route path="/therapists/:id" element={<TherapistProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* No ProtectedRoute since you said you don't want guards */}
        <Route path="/availability" element={<ManageAvailability />} />
        <Route path="/appointments" element={<MyAppointments />} />

        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </>
  );
}
