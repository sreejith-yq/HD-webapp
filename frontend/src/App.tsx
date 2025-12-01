import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthCallback } from './pages/AuthCallback';
import { useAuthStore } from './store/auth';
import './App.css';

function Dashboard() {
  const { doctor, logout } = useAuthStore();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      {doctor ? (
        <div>
          <p>Welcome, Dr. {doctor.name}</p>
          <button
            onClick={logout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Please log in via the link sent to your WhatsApp.</p>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
