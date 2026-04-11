import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User, KeyRound, Activity } from 'lucide-react';
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
        // VIP Pass (Token) ko browser ki tijori (localStorage) mein save kar lo
        localStorage.setItem('token', response.data.token);
        toast.success(`Welcome back, Commander ${response.data.username}`);
        navigate('/dashboard'); // Login hote hi Dashboard pe phek do
      } else {
        toast.success("Admin Account Created! You can now login.");
        setIsLogin(true); // Signup ke baad waapis login screen pe le aao
        setPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Authentication Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          background: 'rgba(15, 23, 42, 0.8)', 
          padding: '40px', 
          borderRadius: '16px', 
          border: '1px solid #334155',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <ShieldCheck size={50} color="#38bdf8" style={{ margin: '0 auto', marginBottom: '10px' }} />
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>
            {isLogin ? 'System Access' : 'Create Admin'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>
            {isLogin ? 'Enter credentials to access threat logs' : 'Register a new master security key'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '15px' }} />
            <input 
              type="text" 
              placeholder="Admin Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 45px', background: '#0b1120', 
                border: '1px solid #334155', borderRadius: '8px', color: 'white', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <KeyRound size={18} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '15px' }} />
            <input 
              type="password" 
              placeholder="Passcode" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 45px', background: '#0b1120', 
                border: '1px solid #334155', borderRadius: '8px', color: 'white', boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: '#38bdf8', color: '#0f172a', 
              border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
              cursor: loading ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
            }}
          >
            {loading ? <Activity className="animate-spin" size={20} /> : null}
            {isLogin ? 'Authenticate' : 'Initialize Protocol'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'No admin key? Create one here' : 'Already have a key? Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;