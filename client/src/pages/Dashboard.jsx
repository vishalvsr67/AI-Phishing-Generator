import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Database, ShieldAlert, Activity, User, Target, Mail, Download, Send, ShieldCheck, Users, BarChart3 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';

const Dashboard = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null); 
  const [sendingId, setSendingId] = useState(null);
  
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/scenarios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setScenarios(response.data);
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Session expired or Unauthorized. Please login again.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchScenarios();
    else setLoading(false);
  }, [token]);

  const pieData = useMemo(() => {
    const counts = scenarios.reduce((acc, curr) => {
      acc[curr.scenarioType] = (acc[curr.scenarioType] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [scenarios]);

  const barData = useMemo(() => {
    if (scenarios.length === 0) return [];
    let totals = { feasibility: 0, personalization: 0, completeness: 0 };
    let validCount = 0;
    scenarios.forEach(s => {
      if (s.scores) {
        totals.feasibility += s.scores.feasibility || 0;
        totals.personalization += s.scores.personalization || 0;
        totals.completeness += s.scores.completeness || 0;
        validCount++;
      }
    });
    if (validCount === 0) return [];
    return [
      { metric: 'Feasibility', score: Math.round(totals.feasibility / validCount), fill: '#10b981' },
      { metric: 'Personalization', score: Math.round(totals.personalization / validCount), fill: '#3b82f6' },
      { metric: 'Completeness', score: Math.round(totals.completeness / validCount), fill: '#8b5cf6' }
    ];
  }, [scenarios]);

  const PIE_COLORS = ['#38bdf8', '#f59e0b', '#ec4899', '#10b981'];

  const handleDispatchThreat = async (scenarioId, scenarioText, theme) => {
    const targetEmail = window.prompt("🎯 Enter Target Email ID for Phishing Drill:");
    if (!targetEmail || !targetEmail.includes('@')) return toast.error("Invalid Email!");
    setSendingId(scenarioId);
    try {
      await axios.post('http://localhost:5000/api/send-mail', {
        targetEmail, subject: theme, emailBody: scenarioText
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Payload dispatched to ${targetEmail}!`);
    } catch (error) {
      toast.error("Dispatch failed.");
    } finally { setSendingId(null); }
  };

  const generatePDF = async (scenarioId, threatTheme) => {
    setDownloadingId(scenarioId);
    const element = document.getElementById(`scenario-card-${scenarioId}`);
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0f172a' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 10, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`PhishGuard_Report_${threatTheme.replace(/\s/g, '_')}.pdf`);
      toast.success("Report Downloaded!");
    } catch (err) { toast.error("PDF Error"); }
    finally { setDownloadingId(null); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-container">
      <div className="glass-card" style={{ maxWidth: '1000px', width: '100%' }}>
        
        {userRole === 'admin' && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="admin-panel-container"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
              <ShieldCheck size={32} color="#4f46e5" />
              <div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>Creator Control Center</h2>
                <span style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 'bold' }}>ADMIN PRIVILEGES ACTIVE</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="admin-btn"><Users size={16} /> Manage Users</button>
              <button className="admin-btn"><BarChart3 size={16} /> Global Logs</button>
              <button className="admin-btn"><Activity size={16} /> System Health</button>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <Database size={35} color="#818cf8" />
          <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Threat Intelligence Logs</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            <Activity className="animate-spin" size={30} style={{ margin: '0 auto', marginBottom: '10px' }} />
            Authenticating & Fetching Secure Data...
          </div>
        ) : scenarios.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', border: '1px dashed #334155', borderRadius: '8px' }}>
            No threat scenarios logged yet.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div className="chart-box">
                <h3 className="chart-title">Delivery Channels</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                      {pieData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-box">
                <h3 className="chart-title">Average AI Metrics</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <h3 className="section-title">Raw Threat Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {scenarios.map((scenario) => (
                <motion.div key={scenario._id} id={`scenario-card-${scenario._id}`} className="scenario-card">
                  <div className="model-badge-v2">{scenario.modelUsed}</div>
                  <div className="card-meta">
                    <div className="meta-item"><Mail size={16} color="#38bdf8"/> {scenario.scenarioType}</div>
                    <div className="meta-item"><ShieldAlert size={16} color="#ef4444"/> {scenario.threatTheme}</div>
                    <div className="meta-item"><User size={16} color="#10b981"/> {scenario.targetProfile}</div>
                    <div className="meta-item"><Target size={16} color="#8b5cf6"/> {scenario.contextualFactor}</div>
                  </div>
                  <div className="scenario-body">{scenario.generatedEmail}</div>
                  <div className="card-actions">
                    <div className="score-group">
                      <span className="score-badge feasibility">Feasibility: {scenario.scores?.feasibility}/100</span>
                      <span className="score-badge personalization">Personalization: {scenario.scores?.personalization}/100</span>
                    </div>
                    <div className="btn-group">
                      <button className="dispatch-btn" onClick={() => handleDispatchThreat(scenario._id, scenario.generatedEmail, scenario.threatTheme)} disabled={sendingId === scenario._id}>
                        {sendingId === scenario._id ? <Activity className="animate-spin" size={18} /> : <Send size={18} />} Dispatch
                      </button>
                      <button className="export-btn" onClick={() => generatePDF(scenario._id, scenario.threatTheme)} disabled={downloadingId === scenario._id}>
                        {downloadingId === scenario._id ? <Activity className="animate-spin" size={18} /> : <Download size={18} />} Export
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Dashboard;