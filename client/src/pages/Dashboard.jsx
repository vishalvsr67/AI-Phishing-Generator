import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import { Database, ShieldAlert, Activity, User, Target, Mail, Download, ShieldCheck, Users, BarChart3, Fingerprint, SearchCheck, BrainCircuit, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';

const Dashboard = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null); 
  
  const navigate = useNavigate(); 
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login'); 
      return;
    }
    const fetchScenarios = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/scenarios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setScenarios(response.data);
      } catch (error) {
        if (token && error.response?.status !== 401) toast.error("Sync failed.");
      } finally { setLoading(false); }
    };
    fetchScenarios();
  }, [token, navigate]);

  // Motive Analysis: Success vs Defense
  const barData = useMemo(() => {
    if (scenarios.length === 0) return [];
    let totals = { feasibility: 0, personalization: 0 };
    scenarios.forEach(s => {
      totals.feasibility += s.scores?.feasibility || 0;
      totals.personalization += s.scores?.personalization || 0;
    });
    return [
      { metric: 'Attack Sophistication', score: Math.round(totals.feasibility / scenarios.length), fill: '#ef4444' },
      { metric: 'Personalization Level', score: Math.round(totals.personalization / scenarios.length), fill: '#3b82f6' }
    ];
  }, [scenarios]);

  const generatePDF = async (scenarioId, threatTheme) => {
    setDownloadingId(scenarioId);
    const element = document.getElementById(`scenario-card-${scenarioId}`);
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0f172a' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 10, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`Security_Audit_${threatTheme.replace(/\s/g, '_')}.pdf`);
      toast.success("Security Report Downloaded!");
    } catch (err) { toast.error("Export Error"); }
    finally { setDownloadingId(null); }
  };

  if (loading) return <div className="app-container"><Activity className="animate-spin" /> Aligning with Project Goals...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-container">
      <div className="glass-card" style={{ maxWidth: '1100px', width: '100%' }}>
        
        {/* Admin Simulation Control */}
        {userRole === 'admin' && (
          <div className="admin-panel-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
              <ShieldCheck size={32} color="#4f46e5" />
              <div>
                <h2 style={{ color: 'white', margin: 0 }}>Simulation Control Center</h2>
                <span style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 'bold' }}>SYSTEM OVERSEER MODE</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="admin-btn" onClick={() => navigate('/admin/users')}><Users size={16} /> Manage Personnel</button>
              <button className="admin-btn" style={{background: '#4f46e5', color: 'white'}}><BarChart3 size={16} /> Threat Intelligence Logs</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <BrainCircuit size={35} color="#818cf8" />
          <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Anti-Phishing Simulation Dashboard</h2>
        </div>

        {/* Analytical Awareness Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div className="chart-box">
                <h3 className="chart-title"><ShieldAlert size={18} color="#ef4444"/> Attack Vector Sophistication</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <AlertTriangle size={40} color="#f59e0b" />
                    <div>
                        <h3 style={{ margin: 0, color: 'white' }}>Risk Profile</h3>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Project Goal: Human Vulnerability Identification</p>
                    </div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <p style={{ color: '#f59e0b', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                        The system identifies high-sophistication vectors to train users in recognizing advanced social engineering tactics.
                    </p>
                </div>
            </div>
        </div>

        {/* Awareness Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {scenarios.map((scenario) => (
            <div key={scenario._id} id={`scenario-card-${scenario._id}`} className="scenario-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div className="model-badge-v2">{scenario.modelUsed}</div>
                {userRole === 'admin' && (
                  <div style={{ color: '#38bdf8', fontSize: '0.85rem' }}>
                    <Fingerprint size={14} /> SIM_ID: {scenario.createdBy?.username || 'SYSTEM'}
                  </div>
                )}
              </div>
              
              <div className="card-meta">
                <span><Mail size={14} color="#38bdf8"/> {scenario.scenarioType}</span>
                <span><ShieldAlert size={14} color="#ef4444"/> {scenario.threatTheme}</span>
              </div>

              {/* Awareness Logic: The Scenario */}
              <div className="scenario-body" style={{ borderLeftColor: '#ef4444' }}>
                <div style={{ marginBottom: '10px', color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldAlert size={14} /> SIMULATED ATTACK CONTENT:
                </div>
                {scenario.generatedEmail}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                   <div className="score-badge feasibility" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                     Danger Level: {scenario.scores?.feasibility}%
                   </div>
                   <div className="score-badge personalization">
                     Personalization: {scenario.scores?.personalization}%
                   </div>
                </div>
                <button className="export-btn" onClick={() => generatePDF(scenario._id, scenario.threatTheme)} disabled={downloadingId === scenario._id}>
                   {downloadingId === scenario._id ? <Activity className="animate-spin" size={16}/> : <Download size={16} />} 
                   Export Security Audit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;