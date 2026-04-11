import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Lock, Terminal, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Typewriter from '../components/Typewriter';

const Landing = () => {
  const navigate = useNavigate();
  const [demoTarget, setDemoTarget] = useState('');
  const [demoResult, setDemoResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoUsed, setDemoUsed] = useState(false);

  // Check if user already used the demo
  useEffect(() => {
    if (localStorage.getItem('demoUsed')) {
      setDemoUsed(true);
    }
  }, []);

  const runDemo = async () => {
    if (!demoTarget.trim()) return toast.error("Enter a target profile to run simulation!");
    if (demoUsed) {
      toast("Demo limit reached. Please authenticate to continue.", { icon: '🔒' });
      return navigate('/login');
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/generate', {
        scenarioType: "Email",
        targetCharacteristic: demoTarget,
        phishingContent: "Urgent Work/CEO Fraud",
        contextualFactor: "New Employee"
      });
      
      setDemoResult(response.data.scenario);
      localStorage.setItem('demoUsed', 'true'); // Lock demo after 1 use
      setDemoUsed(true);
      toast.success("Simulation Complete!");
    } catch (error) {
      console.error("Demo Error Details:", error);
      // Ye asli backend error ya network error screen pe dikhayega
      toast.error(error.response?.data?.error || error.message || "Server connection failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
      
      {/* HERO SECTION */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 16px', borderRadius: '50px', color: '#38bdf8', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <Zap size={14} /> Enterprise Cybersecurity Training AI
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', margin: '0 0 20px 0', color: 'white' }}>
          Test your defenses with <br/><span className="gradient-text">Hyper-Realistic AI Phishing</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '30px' }}>
          PhishGuard AI generates zero-day, context-aware phishing simulations to train your workforce against modern social engineering attacks.
        </p>
      </motion.div>

      {/* INTERACTIVE DEMO TERMINAL */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ width: '100%', maxWidth: '700px' }}>
        <div style={{ background: '#0b1120', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          {/* Terminal Header */}
          <div style={{ background: '#1e293b', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #334155' }}>
            <Terminal size={18} color="#94a3b8" />
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontFamily: 'monospace' }}>Live Simulation Sandbox</span>
          </div>

          {/* Terminal Body */}
          <div style={{ padding: '30px' }}>
            {!demoResult ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter a target (e.g., 'A stressed software engineer')" 
                  value={demoTarget}
                  onChange={(e) => setDemoTarget(e.target.value)}
                  style={{ flex: 1, padding: '15px', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', color: 'white', fontSize: '1rem' }}
                />
                <button onClick={runDemo} disabled={loading} style={{ padding: '0 25px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loading ? 'Simulating...' : 'Run Attack'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', borderLeft: '3px solid #ef4444', marginBottom: '20px', fontSize: '0.95rem', color: '#e2e8f0', minHeight: '150px' }}>
                  <Typewriter text={demoResult} delay={10} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    <Lock size={18} color="#38bdf8"/> Full Engine Locked
                  </div>
                  <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', background: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    Create Account to Unlock <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Landing;