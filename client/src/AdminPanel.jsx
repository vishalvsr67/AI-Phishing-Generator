import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Activity, UserCircle, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './App.css';

const AdminPanel = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔑 Get token for admin verification
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsersList(response.data);
      } catch (error) {
        console.error("Admin Fetch Error:", error);
        toast.error(error.response?.data?.error || "Failed to load user database");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // 🔥 Delete User Function
  const handleDeleteUser = async (userId, username) => {
    const confirmDelete = window.confirm(`⚠️ WARNING: Are you sure you want to permanently delete user '${username}'?`);
    
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // UI se us user ko turant hata do bina refresh kiye
      setUsersList(usersList.filter(user => user._id !== userId));
      toast.success(`User ${username} terminated successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to terminate user.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="app-container">
      <div className="glass-card" style={{ maxWidth: '1000px', width: '100%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
          <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '15px', borderRadius: '12px' }}>
             <ShieldCheck size={35} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>Creator Control Center</h1>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>System Administrator Dashboard</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Users size={24} color="#38bdf8" />
          <h2 style={{ color: '#e2e8f0', margin: 0 }}>Registered Personnel</h2>
          <span style={{ background: '#1e293b', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold', marginLeft: 'auto' }}>
            Total: {usersList.length}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#94a3b8' }}>
            <Activity className="animate-spin" size={30} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {usersList.map((user) => (
              <motion.div 
                key={user._id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <UserCircle size={40} color={user.role === 'admin' ? '#818cf8' : '#94a3b8'} />
                  <div>
                    {/* 👑 Crown Hataya Yahan Se */}
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
                      {user.username}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
                      <Calendar size={12} />
                      Joined: {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{
                    background: user.role === 'admin' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(56, 189, 248, 0.1)',
                    color: user.role === 'admin' ? '#818cf8' : '#38bdf8',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: `1px solid ${user.role === 'admin' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
                  }}>
                    {user.role}
                  </span>

                  {/* DELETE BUTTON */}
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDeleteUser(user._id, user.username)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                      title="Terminate User"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default AdminPanel;