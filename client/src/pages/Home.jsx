import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldAlert, Send, Target, FileText, User, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import Typewriter from '../components/Typewriter'; // NAYA: Typewriter import kiya
import '../App.css'; 

const Home = () => {
  // Vector Configuration Parameters (Aligned with IEEE methodology)
  const [scenarioType, setScenarioType] = useState('Email');
  const [targetCharacteristic, setTargetCharacteristic] = useState('');
  const [phishingContent, setPhishingContent] = useState('Financial/Bank Alert');
  const [contextualFactor, setContextualFactor] = useState('');

  // Output and State Management
  const [scenario, setScenario] = useState('');
  const [usedModel, setUsedModel] = useState('');
  const [scores, setScores] = useState(null); 
  const [loading, setLoading] = useState(false);

  const generatePhishingEmail = async () => {
    // Client-side validation for required vectors
    if (!targetCharacteristic.trim() || !contextualFactor.trim()) {
      toast.error("Please provide both Target Characteristics and Background Context to generate a personalized scenario.", {
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#ef4444',
          background: '#1e293b',
          fontWeight: 'bold',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      });
      return;
    }

    setLoading(true);
    setScenario(''); // Loader lagne se pehle text clear kar do
    setScores(null);
    setUsedModel('');
    
    try {
      // Dispatch payload to backend inference engine
      const response = await axios.post('http://localhost:5000/generate', {
        scenarioType,
        targetCharacteristic,
        phishingContent,
        contextualFactor
      });
      
      // Update UI with generated scenario and metrics
      setScenario(response.data.scenario);
      setUsedModel(response.data.model);
      setScores(response.data.scores); 
      toast.success("Threat Scenario Synthesized Successfully!");

    } catch (error) {
      console.error("Inference Error:", error);
      setScenario("Connection lost with backend inference servers. Ensure the API is active.");
      toast.error("Generation Engine Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card" 
      style={{ marginTop: '2rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1rem' }}>
        <ShieldAlert size={40} color="#38bdf8" />
        <h1 className="gradient-text" style={{ margin: 0 }}>Vector Configuration Node</h1>
      </div>
      <p className="subtitle">IEEE-Aligned Phishing Scenario Generator</p>

      {/* Vector Input Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* Input Vector 1: Delivery Channel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Send size={16} /> Delivery Channel (Scenario Type)
          </label>
          <select className="modern-select" value={scenarioType} onChange={(e) => setScenarioType(e.target.value)}>
            <option value="Email">Email</option>
            <option value="SMS">SMS / Text Message</option>
            <option value="Social Media DM">Social Media DM</option>
          </select>
        </div>

        {/* Input Vector 2: Threat Theme */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FileText size={16} /> Threat Theme (Phishing Content)
          </label>
          <select className="modern-select" value={phishingContent} onChange={(e) => setPhishingContent(e.target.value)}>
            <option value="Financial/Bank Alert">Financial / Bank Alert</option>
            <option value="Urgent Work/CEO Fraud">Urgent Work / CEO Fraud</option>
            <option value="Prize/Lottery Win">Prize / Lottery Win</option>
            <option value="Account Password Reset">Account Password Reset</option>
          </select>
        </div>

        {/* Input Vector 3: Target Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={16} /> Target Profile (Characteristics)
          </label>
          <input 
            type="text" 
            placeholder="e.g., Loves dogs, invests in crypto..." 
            className="modern-select"
            value={targetCharacteristic}
            onChange={(e) => setTargetCharacteristic(e.target.value)}
          />
        </div>

        {/* Input Vector 4: Background Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Target size={16} /> Background Context (Factor)
          </label>
          <input 
            type="text" 
            placeholder="e.g., Just applied for a loan..." 
            className="modern-select"
            value={contextualFactor}
            onChange={(e) => setContextualFactor(e.target.value)}
          />
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <button onClick={generatePhishingEmail} disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} className={loading ? "animate-spin" : ""} />
          {loading ? 'Synthesizing Vectors...' : 'Generate Personalized Attack 🚀'}
        </button>
      </div>

      {/* Output Console */}
      <div className="result-box">
        {usedModel && <div className="model-badge">Engine: {usedModel}</div>}
        
        {/* IEEE Evaluation Metrics Scoreboard */}
        {scores && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
             <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
               <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Feasibility</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{scores.feasibility}/100</div>
             </div>
             <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
               <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Personalization</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{scores.personalization}/100</div>
             </div>
             <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
               <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Completeness</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{scores.completeness}/100</div>
             </div>
          </motion.div>
        )}

        {/* NAYA: ChatGPT Style Typewriter Text Display */}
        {loading ? (
           <div style={{ color: '#94a3b8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Activity className="animate-spin" size={16} /> AI is analyzing vector parameters and synthesizing threat scenario...
           </div>
        ) : scenario ? (
           <Typewriter text={scenario} delay={15} /> // 15ms speed is perfect
        ) : (
           <span style={{ color: '#94a3b8' }}>Awaiting vector inputs...</span>
        )}
      </div>
    </motion.div>
  );
}

export default Home;