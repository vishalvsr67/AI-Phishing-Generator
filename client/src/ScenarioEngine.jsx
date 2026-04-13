import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Send, Target, FileText, User, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Typewriter from './components/Typewriter'; 
import './App.css'; 

const ScenarioEngine = () => {
  const [scenarioType, setScenarioType] = useState('Email');
  const [targetCharacteristic, setTargetCharacteristic] = useState('');
  const [phishingContent, setPhishingContent] = useState('Financial/Bank Alert');
  const [contextualFactor, setContextualFactor] = useState('');

  const [scenario, setScenario] = useState('');
  const [usedModel, setUsedModel] = useState('');
  const [scores, setScores] = useState(null); 
  const [loading, setLoading] = useState(false);
  
  // 🚩 IEEE FEATURE: Red Flags Storage
  const [redFlags, setRedFlags] = useState([]);

  const token = localStorage.getItem('token');

  const generatePhishingEmail = async () => {
    if (!targetCharacteristic.trim() || !contextualFactor.trim()) {
      toast.error("Please provide both Target Profile and Background Context.");
      return;
    }

    setLoading(true);
    setScenario(''); 
    setScores(null);
    setUsedModel('');
    setRedFlags([]); // Reset flags
    
    try {
      const response = await axios.post('http://localhost:5000/generate', {
        scenarioType,
        targetCharacteristic,
        phishingContent,
        contextualFactor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setScenario(response.data.scenario);
      setUsedModel(response.data.model);
      setScores(response.data.scores); 
      
      // 🚩 XAI MAGIC: Ab backend seedha AI ke dimag se nikle flags bhej raha hai!
      setRedFlags(response.data.redFlags || []);

      toast.success("Threat Simulation Ready!");

    } catch (error) {
      console.error("Inference Error:", error);
      toast.error(error.response?.data?.error || "Generation Engine Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="app-container">
      <div className="glass-card" style={{ maxWidth: '950px', margin: '2rem auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.5rem' }}>
          <ShieldAlert size={40} color="#38bdf8" />
          <h1 className="gradient-text" style={{ margin: 0, fontSize: '2.5rem' }}>PhishGuard Simulation Sandbox</h1>
        </div>
        <p className="subtitle" style={{textAlign: 'center', color: '#94a3b8', marginBottom: '2rem'}}>System Motive: Simulating Threats for Defensive Training</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="input-group">
            <label className="input-label"><Send size={16} /> Channel</label>
            <select className="modern-input" value={scenarioType} onChange={(e) => setScenarioType(e.target.value)}>
              <option value="Email">Email</option>
              <option value="SMS">SMS / Text Message</option>
              <option value="Social Media DM">Social Media DM</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label"><FileText size={16} /> Theme</label>
            <select className="modern-input" value={phishingContent} onChange={(e) => setPhishingContent(e.target.value)}>
              <option value="Financial/Bank Alert">Financial / Bank Alert</option>
              <option value="Urgent Work/CEO Fraud">Urgent Work / CEO Fraud</option>
              <option value="Account Password Reset">Account Password Reset</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label"><User size={16} /> Target Persona</label>
            <input 
              type="text" 
              className="modern-input" 
              placeholder="e.g. New Employee" 
              value={targetCharacteristic}
              onChange={(e) => setTargetCharacteristic(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label"><Target size={16} /> Context</label>
            <input 
              type="text" 
              className="modern-input" 
              placeholder="e.g. Quarterly audit" 
              value={contextualFactor}
              onChange={(e) => setContextualFactor(e.target.value)}
            />
          </div>
        </div>

        <button onClick={generatePhishingEmail} disabled={loading} className="btn-primary" style={{ width: '100%', marginBottom: '30px' }}>
          {loading ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
          {loading ? 'Simulating Social Engineering...' : 'Synthesize Awareness Scenario 🚀'}
        </button>

        <div className="result-box">
          {usedModel && <div className="model-badge">AI Brain: {usedModel}</div>}
          
          {scores && (
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: 'rgba(15, 23, 42, 0.4)', padding: '15px', borderRadius: '12px' }}>
               <div className="score-item">
                 <span className="score-label">Complexity</span>
                 <span className="score-val" style={{ color: '#ef4444' }}>{scores.feasibility}%</span>
               </div>
               <div className="score-item">
                 <span className="score-label">Personalization</span>
                 <span className="score-val" style={{ color: '#3b82f6' }}>{scores.personalization}%</span>
               </div>
            </div>
          )}

          <div style={{ minHeight: '150px' }}>
            {loading ? (
                 <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '20px' }}>
                    Generating high-fidelity simulation text...
                 </div>
            ) : scenario ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 🔥 CHANGE 1: Email Body Text Alignment Fixed Here */}
                <div className="scenario-body" style={{ borderLeft: '4px solid #ef4444', background: '#0b1120', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                   <Typewriter text={scenario} delay={10} />
                </div>

                {/* 🚩 RED FLAG ANALYSIS (Motive Feature) */}
                {/* 🔥 CHANGE 2: Red Flags Box Text Alignment Fixed Here */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '15px', fontSize: '0.9rem' }}>
                      <AlertTriangle size={18} /> DEFENSIVE ANALYSIS: RED FLAGS
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {redFlags.map((flag, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                           <CheckCircle size={14} color="#10b981" style={{ marginTop: '2px' }} /> {flag}
                        </div>
                      ))}
                   </div>
                </motion.div>
              </div>
            ) : (
                 <div style={{ textAlign: 'center', color: '#475569', padding: '40px' }}>Awaiting system inputs for synthesis...</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Zap = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);

export default ScenarioEngine;