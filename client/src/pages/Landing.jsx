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
  Cpu,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Typewriter from '../components/Typewriter';
import '../App.css'; 

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

  useEffect(() => {
    document.title = "PhishGuard AI | Home"; 
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
      <div className="bg-glow-orb blue-orb"></div>
      <div className="bg-glow-orb purple-orb"></div>
      <div className="bg-grid-overlay"></div>

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
          
          <div className="stats-grid-container">
            <div className="stat-card-modern">
              <div className="stat-icon-mini"><Activity size={16} color="#38bdf8" /></div>
              <h3 className="gradient-text-neon"><AnimatedCounter to={24000} suffix="+" /></h3>
              <p>Simulations Run</p>
            </div>
            
            <div className="stat-card-modern">
              <div className="stat-icon-mini"><ShieldCheck size={16} color="#a855f7" /></div>
              <h3 className="gradient-text-neon"><AnimatedCounter to={99} suffix=".9%" /></h3>
              <p>Detection Rate</p>
            </div>
            
            <div className="stat-card-modern">
              <div className="stat-icon-mini"><Cpu size={16} color="#ec4899" /></div>
              <h3 className="gradient-text-neon">&lt;<AnimatedCounter to={15} suffix="ms" /></h3>
              <p>Engine Latency</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="terminal-container-fixed">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} style={{ width: '100%' }}>
          <div className="glass-panel main-terminal-ui">
            <div className="terminal-header-bar">
              <Terminal size={18} color="#38bdf8" />
              <span className="terminal-title">Live Simulation Sandbox</span>
            </div>

            <div className="terminal-body-content">
              {!demoResult ? (
                <div className="terminal-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Enter a target (e.g., 'A stressed software engineer')" 
                    value={demoTarget}
                    onChange={(e) => setDemoTarget(e.target.value)}
                    className="modern-input terminal-field"
                  />
                  {/* 🔥 CHANGE 1: 'Run Attack' changed to 'Run Simulation' */}
                  <button onClick={runDemo} disabled={loading} className="btn-glow-primary run-btn">
                    {loading ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
                    {loading ? 'Processing...' : 'Run Simulation'}
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="terminal-result-box">
                    <Typewriter text={demoResult} delay={10} />
                  </div>
                  
                  <div className="engine-locked-footer">
                    <div className="locked-label">
                      <Lock size={18} color="#ef4444"/> Engine Locked (Demo Limit Reached)
                    </div>
                    <button className="btn-glow-primary unlock-btn" onClick={() => navigate('/login')}>
                      Create Account to Unlock <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 🔥 CHANGE 2: Ethical Disclaimer added below terminal actions */}
              <div style={{ textAlign: 'center', marginTop: '25px', color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#ef4444" />
                <span><strong>Ethical Disclaimer:</strong> This system is strictly for cybersecurity training and awareness purposes. No real attacks are performed.</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 🔥 CHANGE 3: Simple "How it works" flow added before Bento Grid */}
      <section style={{ padding: '20px 20px 60px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#f8fafc', fontWeight: '800' }}>Engine Architecture</h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>User Input</div>
          <ArrowRight size={18} color="#38bdf8" />
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>Scenario Engine</div>
          <ArrowRight size={18} color="#38bdf8" />
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>AI Generation</div>
          <ArrowRight size={18} color="#38bdf8" />
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>Risk Evaluation</div>
          <ArrowRight size={18} color="#38bdf8" />
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8' }}>Dashboard</div>
        </div>
      </section>

      <section className="features-section">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="bento-grid">
          <motion.div variants={fadeInUp} className="bento-item bento-large glass-panel">
            <div className="icon-box blue-glow"><BrainCircuit size={32} /></div>
            <h2>Dual-Agent AI Generation Framework</h2>
            <p>Our custom-tuned Gemini engine doesn't just write emails; it crafts context-aware, highly personalized zero-day phishing vectors tailored to specific target personas.</p>
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

      <section className="cta-section">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="cta-glass-box">
          <Cpu size={50} className="floating-icon" color="#38bdf8" />
          <h2>Ready to upgrade your human firewall?</h2>
          <p>Deploy localized, high-fidelity threat simulations in under 10 seconds.</p>
          <button className="btn-glow-primary pulse-anim" onClick={() => navigate('/login')}>
            Initialize Admin Console
          </button>
        </motion.div>
      </section>

      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-brand">
            <ShieldCheck size={28} color="#38bdf8" />
            <span className="navbar-logo-footer">PhishGuard AI</span>
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