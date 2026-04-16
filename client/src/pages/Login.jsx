import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User, KeyRound, Activity, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return toast.error("Credentials required to access the terminal.");
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/signup';

    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        username,
        password
      });

      if (isLogin) {
        // Implementation of Role-Based Session Management via Local Storage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('role', response.data.role); 

        toast.success(`Welcome back, Commander ${response.data.username}`);
        navigate('/dashboard'); 
      } else {
        toast.success("Account Initialized! You can now authenticate.");
        setIsLogin(true); 
        setPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Authentication Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
      {/* Ambient Background Elements */}
      <div className="bg-glow-orb blue-orb"></div>
      <div className="bg-glow-orb purple-orb"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel"
        style={{ 
          padding: '40px', 
          width: '100%',
          maxWidth: '450px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="lock-icon-wrapper" style={{ marginBottom: '15px' }}>
            <Lock size={35} color="#ef4444" style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))' }} />
          </div>
          <h2 className="navbar-logo" style={{ fontSize: '2rem', marginBottom: '10px' }}>
            {isLogin ? 'System Access' : 'Create Identity'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {isLogin ? 'Enter credentials to unlock full engine access' : 'Register your operator credentials'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label"><User size={14} /> Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="modern-input" 
                placeholder="operator_name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '15px' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label"><KeyRound size={14} /> Passcode</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="modern-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '15px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-glow-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
          >
            {loading ? <Activity className="animate-spin" size={20} /> : (isLogin ? 'Initialize Access' : 'Register Operator')}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
          >
            {isLogin ? "New Operator? Register Access" : "Existing Operator? Login here"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
  
export default Login;