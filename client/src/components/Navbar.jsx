import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, LayoutDashboard, LogOut, Key, Settings, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  
  // 🛡️ Get auth status and user details from localStorage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    // 🧹 Clear all security credentials from the vault
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 2rem', background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      width: '100%', boxSizing: 'border-box', position: 'sticky', top: 0, zIndex: 1000
    }}>
      {/* Brand Identity */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8', textDecoration: 'none' }}>
        <ShieldCheck size={28} />
        <span>PhishGuard AI</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            {/* Standard User Links */}
            <Link to="/engine" style={navLinkStyle}>
               <Database size={18} /> Scenario Engine
            </Link>
            <Link to="/dashboard" style={navLinkStyle}>
               <LayoutDashboard size={18} /> Threat Logs
            </Link>

            {/* 👑 EXCLUSIVE: Admin/Creator Panel Link */}
            {userRole === 'admin' && (
              <Link to="/admin/users" style={{ ...navLinkStyle, color: '#818cf8', fontWeight: '600' }}>
                <Settings size={18} /> Admin Panel
              </Link>
            )}

            {/* Profile Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', borderLeft: '1px solid #334155', paddingLeft: '15px' }}>
              <UserCircle size={20} color="#38bdf8" />
              <span style={{ fontWeight: '500' }}>{username || 'Commander'}</span>
            </div>

            <button onClick={handleLogout} style={logoutBtnStyle}>
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          /* Authentication Access */
          <Link to="/login" style={signInBtnStyle}>
             <Key size={16} /> Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

// 🎨 Professional Inline Styles
const navLinkStyle = {
  color: '#e2e8f0', 
  textDecoration: 'none', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '5px', 
  fontSize: '0.9rem',
  transition: 'color 0.2s ease'
};

const logoutBtnStyle = {
  background: 'transparent', 
  border: '1px solid #ef4444', 
  color: '#ef4444', 
  padding: '6px 12px', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '5px', 
  fontSize: '0.8rem', 
  marginLeft: '5px',
  transition: 'all 0.3s ease'
};

const signInBtnStyle = {
  background: '#38bdf8', 
  color: '#0f172a', 
  padding: '8px 20px', 
  borderRadius: '6px', 
  textDecoration: 'none', 
  fontWeight: 'bold', 
  fontSize: '0.9rem', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px',
  boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
};

export default Navbar;