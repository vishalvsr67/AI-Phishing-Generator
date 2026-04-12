import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  Terminal, 
  ArrowRight, 
  BrainCircuit, 
  Activity, 
  Target as TargetIcon, 
  Globe, 
  Cpu 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Typewriter from '../components/Typewriter';
import '../App.css'; 

// Animated Counter Component
const AnimatedCounter = ({ from = 0, to, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * (to - from) + from));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [from, to, duration]);

  return <span style={{ fontWeight: '800' }}>{count.toLocaleString()}{suffix}</span>;
};

const Landing = () => {
  const navigate = useNavigate();
  const [demoTarget, setDemoTarget] = useState('');
  const [demoResult, setDemoResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoUsed, setDemoUsed] = useState(false);

  // 🚩 CORE LOGIC: Check if user already used the demo
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
      localStorage.setItem('demoUsed', 'true'); 
      setDemoUsed(true);
      toast.success("Simulation Complete!");
    } catch (error) {
      console.error("Demo Error Details:", error);
      toast.error(error.response?.data?.error || error.message || "Server connection failed!");
    } finally {
      setLoading(false);
    }
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="landing-wrapper">
      {/* 🌌 Animated Background Grid/Glow */}
      <div className="bg-glow-orb blue-orb"></div>
      <div className="bg-glow-orb purple-orb"></div>
      <div className="bg-grid-overlay"></div>

      {/* 🚨 INFINITE CYBER TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-move">
          <span>🔴 MITRE T1566 Blocked</span>
          <span>🟢 Gemini-2.5-Flash Online</span>
          <span>⚠️ Spear-Phishing Payload Simulated</span>
          <span>🛡️ Exploit Mitigated in 12ms</span>
          <span>🔴 MITRE T1566 Blocked</span>
          <span>🟢 Gemini-2.5-Flash Online</span>
          <span>⚠️ Spear-Phishing Payload Simulated</span>
          <span>🛡️ Exploit Mitigated in 12ms</span>
        </div>
      </div>

      {/* 🚀 1. HERO SECTION */}
      <section className="hero-section">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="hero-content">
          <div className="badge">
            <ShieldCheck size={14} color="#38bdf8" /> <span>Enterprise Cybersecurity Training AI</span>
          </div>
          <h1 className="hero-title">
            Test your defenses with <br />
            <span className="gradient-text-neon">Hyper-Realistic AI Phishing</span>
          </h1>
          <p className="hero-subtitle">
            PhishGuard AI generates zero-day, context-aware phishing simulations to train your workforce against modern social engineering attacks.
          </p>
          
          {/* STATS COUNTER */}
          <div className="stats-container">
             <div className="stat-item">
                <h3 className="gradient-text-neon"><AnimatedCounter to={24000} suffix="+" /></h3>
                <p>Simulations Run</p>
             </div>
             <div className="stat-item">
                <h3 className="gradient-text-neon"><AnimatedCounter to={99} suffix=".9%" /></h3>
                <p>Detection Rate</p>
             </div>
             <div className="stat-item">
                <h3 className="gradient-text-neon">&lt;<AnimatedCounter to={15} suffix="ms" /></h3>
                <p>Engine Latency</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* 💻 2. INTERACTIVE DEMO TERMINAL */}
      <section style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10, padding: '0 20px', marginTop: '-10px', marginBottom: '80px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} style={{ width: '100%', maxWidth: '800px' }}>
          <div className="glass-panel" style={{ background: 'rgba(11, 17, 32, 0.8)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 30px rgba(56, 189, 248, 0.1)' }}>
            
            <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Terminal size={18} color="#38bdf8" />
              <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>Live Simulation Sandbox</span>
            </div>

            <div style={{ padding: '30px' }}>
              {!demoResult ? (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="Enter a target (e.g., 'A stressed software engineer')" 
                    value={demoTarget}
                    onChange={(e) => setDemoTarget(e.target.value)}
                    className="modern-input"
                    style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)' }}
                  />
                  <button onClick={runDemo} disabled={loading} className="btn-glow-primary" style={{ padding: '0 30px', cursor: loading ? 'wait' : 'pointer' }}>
                    {loading ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
                    {loading ? 'Simulating...' : 'Run Attack'}
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #ef4444', marginBottom: '25px', fontSize: '1rem', color: '#e2e8f0', minHeight: '150px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                    <Typewriter text={demoResult} delay={10} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.95rem' }}>
                      <Lock size={18} color="#ef4444"/> Engine Locked (Demo Limit Reached)
                    </div>
                    <button className="btn-glow-primary" onClick={() => navigate('/login')} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                      Create Account to Unlock <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ⚡ 3. THE BENTO BOX FEATURES GRID */}
      <section className="features-section">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="bento-grid">
          
          <motion.div variants={fadeInUp} className="bento-item bento-large glass-panel">
            <div className="icon-box blue-glow"><BrainCircuit size={32} /></div>
            <h2>Dual-Agent AI Generation Framework</h2>
            <p>Our custom-tuned Gemini engine doesn't just write emails; it crafts context-aware, highly personalized zero-day phishing vectors tailored to specific target personas based on real-time threat intelligence.</p>
            <div className="bento-floating-badge"><Globe size={14}/> Cross-Lingual Support</div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bento-item bento-small glass-panel">
            <div className="icon-box purple-glow"><TargetIcon size={24} /></div>
            <h3>Explainable AI (XAI)</h3>
            <p>The engine auto-generates defensive 'Red Flags' analysis to explain psychological triggers.</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="bento-item bento-small glass-panel">
            <div className="icon-box neon-glow"><Activity size={24} /></div>
            <h3>Real-Time Analytics</h3>
            <p>Measure attack sophistication dynamically. Export IEEE-standard audits.</p>
          </motion.div>

        </motion.div>
      </section>

      {/* 🧠 4. CTA SECTION */}
      <section className="cta-section">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="cta-glass-box">
          <Cpu size={50} className="floating-icon" color="#38bdf8" />
          <h2>Ready to upgrade your human firewall?</h2>
          <p>Deploy localized, high-fidelity threat simulations in under 10 seconds.</p>
          <button className="btn-glow-primary pulse-anim" onClick={() => navigate('/login')} style={{ margin: '0 auto', marginTop: '20px' }}>
            Initialize Admin Console
          </button>
        </motion.div>
      </section>

      {/* 🏁 5. PREMIUM FOOTER SECTION */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-brand">
            <ShieldCheck size={28} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' }} />
            <span className="navbar-logo" style={{ fontSize: '1.5rem', fontFamily: "'Outfit', sans-serif", fontWeight: '900', background: 'linear-gradient(to right, #38bdf8, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PhishGuard AI</span>
          </div>
          <p className="footer-text">
            Empowering the human firewall through next-generation generative AI simulations and predictive threat modeling. Aligned with IEEE and MITRE ATT&CK® standards.
          </p>
          <div className="footer-links">
            <a href="#">Documentation</a>
            <a href="#">System Architecture</a>
            <a href="#">API Reference</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} PhishGuard AI Core. Engineered by Vishal Singh. All systems operational.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;