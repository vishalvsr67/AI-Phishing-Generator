import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, LayoutDashboard, LogOut, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 2rem', background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      width: '100%', boxSizing: 'border-box'
    }}>
      {/* Logo ab Landing page pe le jayega */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8', textDecoration: 'none' }}>
        <ShieldCheck size={28} />
        <span>PhishGuard AI</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            {/* Engine Link Updated */}
            <Link to="/engine" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
               <Database size={18} /> Scenario Engine
            </Link>
            <Link to="/dashboard" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
               <LayoutDashboard size={18} /> Threat Logs
            </Link>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', marginLeft: '10px' }}>
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          /* Agar login nahi hai, toh Login button dikhao */
          <Link to="/login" style={{ background: '#38bdf8', color: '#0f172a', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
             <Key size={16} /> Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;