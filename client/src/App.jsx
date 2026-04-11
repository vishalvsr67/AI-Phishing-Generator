import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ScenarioEngine from './ScenarioEngine'; 
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Landing from './pages/Landing';
import AdminPanel from './AdminPanel'; // 🔥 NAYA: Admin Panel Import kiya
import './App.css'; 

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* PRIVATE ROUTES (Require Login) */}
            <Route path="/engine" element={<PrivateRoute><ScenarioEngine /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            
            {/* 🔥 NAYA: Admin Route */}
            <Route path="/admin/users" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          </Routes>
        </main>
        <Toaster 
          position="bottom-right" 
          toastOptions={{ 
            style: { 
              background: '#1e293b', 
              color: '#fff', 
              border: '1px solid #475569' 
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App;