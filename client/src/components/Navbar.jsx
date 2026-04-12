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
      background: 'rgba(15, 23, 42, 0.8)', /* Thoda dark premium blur */
      backdropFilter: 'blur(12px)', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      width: '100%', boxSizing: 'border-box', position: 'sticky', top: 0, zIndex: 1000
    }}>
      {/* 🚀 NAYA INNER CONTAINER: Isse screen ke edges perfectly manage honge */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', width: '100%', boxSizing: 'border-box'
      }}>
        
        {/* 🚀 BRAND IDENTITY (Naya Futuristic Logo applied via className) */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <ShieldCheck size={32} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' }} />
          <span className="navbar-logo">PhishGuard AI</span>
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
  fontWeight: '500',
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
  fontWeight: 'bold',
  transition: 'all 0.3s ease'
};

const signInBtnStyle = {
  background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)', 
  color: 'white', 
  padding: '8px 24px', 
  borderRadius: '8px', 
  textDecoration: 'none', 
  fontWeight: 'bold', 
  fontSize: '0.9rem', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px',
  border: 'none',
  boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
};

export default Navbar;