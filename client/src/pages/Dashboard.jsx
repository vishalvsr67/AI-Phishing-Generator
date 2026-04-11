import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Database, ShieldAlert, Activity, User, Target, Mail, Download, Send } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';

const Dashboard = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null); 
  const [sendingId, setSendingId] = useState(null); // Naya: Email sending state track karne ke liye

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/scenarios');
        setScenarios(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch threat intelligence data:", error);
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  // ==========================================
  // DATA PROCESSING FOR CHARTS 
  // ==========================================
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

  // ==========================================
  // ✉️ REAL-WORLD DISPATCH ENGINE (Nodemailer)
  // ==========================================
  const handleDispatchThreat = async (scenarioId, scenarioText, theme) => {
    const targetEmail = window.prompt("🎯 Enter Target Email ID for Phishing Drill:");
    
    if (!targetEmail) return;
    if (!targetEmail.includes('@')) {
        return toast.error("Invalid Email Address!");
    }

    setSendingId(scenarioId);
    try {
      const response = await axios.post('http://localhost:5000/api/send-mail', {
        targetEmail,
        subject: theme,
        emailBody: scenarioText
      });

      if (response.data.success) {
        toast.success(`Payload dispatched to ${targetEmail}!`, {
            icon: '🚀',
            style: { background: '#1e293b', color: '#fff', border: '1px solid #10b981' }
        });
      }
    } catch (error) {
      console.error("Dispatch Error:", error);
      toast.error("Dispatch failed. Check server logs.");
    } finally {
      setSendingId(null);
    }
  };

  // ==========================================
  // PDF EXPORT ENGINE 
  // ==========================================
  const generatePDF = async (scenarioId, threatTheme) => {
    setDownloadingId(scenarioId);
    const elementId = `scenario-card-${scenarioId}`;
    const element = document.getElementById(elementId);

    if (!element) {
      toast.error("Failed to locate report data!");
      setDownloadingId(null);
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0f172a', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      const cleanThemeName = threatTheme.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`PhishGuard_Report_${cleanThemeName}.pdf`);
      toast.success("Threat Report Downloaded Successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Error generating PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-container">
      <div className="glass-card" style={{ maxWidth: '1000px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <Database size={35} color="#818cf8" />
          <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Threat Intelligence Logs</h2>
        </div>
        <p className="subtitle">Real-time database of AI-generated phishing vectors</p>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            <Activity className="animate-spin" size={30} style={{ margin: '0 auto', marginBottom: '10px' }} />
            Retrieving data from MongoDB...
          </div>
        ) : scenarios.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', border: '1px dashed #334155', borderRadius: '8px' }}>
            No threat scenarios logged yet. Generate one from the Scenario Engine.
          </div>
        ) : (
          <>
            {/* ANALYTICS CHARTS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: '#0b1120', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ color: '#cbd5e1', fontSize: '1.1rem', marginTop: 0, textAlign: 'center' }}>Delivery Channels</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: 'white' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: '#0b1120', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ color: '#cbd5e1', fontSize: '1.1rem', marginTop: 0, textAlign: 'center' }}>Average AI IEEE Metrics</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* RAW DATA LOGS */}
            <h3 style={{ color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px' }}>Raw Threat Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {scenarios.map((scenario) => (
                <motion.div 
                  key={scenario._id}
                  id={`scenario-card-${scenario._id}`} 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  style={{ background: '#0b1120', border: '1px solid #334155', borderRadius: '12px', padding: '25px', position: 'relative' }}
                >
                  <div className="model-badge" style={{ top: '25px', right: '25px', backgroundColor: '#4f46e5' }}>
                    {scenario.modelUsed}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', color: '#94a3b8', fontSize: '0.9rem', width: '80%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} color="#38bdf8"/> {scenario.scenarioType}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={16} color="#ef4444"/> {scenario.threatTheme}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} color="#10b981"/> {scenario.targetProfile}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={16} color="#8b5cf6"/> {scenario.contextualFactor}</div>
                  </div>

                  <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.95rem', whiteSpace: 'pre-wrap', marginBottom: '20px', borderLeft: '4px solid #38bdf8', lineHeight: '1.6' }}>
                    {scenario.generatedEmail}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                         Feasibility: {scenario.scores?.feasibility || 0}/100
                       </div>
                       <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                         Personalization: {scenario.scores?.personalization || 0}/100
                       </div>
                       <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                         Completeness: {scenario.scores?.completeness || 0}/100
                       </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* 🚀 NAYA: Dispatch Threat Button */}
                        <button 
                            onClick={() => handleDispatchThreat(scenario._id, scenario.generatedEmail, scenario.threatTheme)}
                            disabled={sendingId === scenario._id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444',
                                padding: '8px 16px', borderRadius: '8px', cursor: sendingId === scenario._id ? 'wait' : 'pointer',
                                fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s'
                            }}
                        >
                            {sendingId === scenario._id ? <Activity className="animate-spin" size={18} /> : <Send size={18} />}
                            {sendingId === scenario._id ? 'Sending...' : 'Dispatch Threat'}
                        </button>

                        <button 
                            onClick={() => generatePDF(scenario._id, scenario.threatTheme)}
                            disabled={downloadingId === scenario._id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8',
                                padding: '8px 16px', borderRadius: '8px', cursor: downloadingId === scenario._id ? 'wait' : 'pointer',
                                fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s'
                            }}
                        >
                            {downloadingId === scenario._id ? <Activity className="animate-spin" size={18} /> : <Download size={18} />}
                            {downloadingId === scenario._id ? 'Exporting...' : 'Export Report'}
                        </button>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px', color: '#475569', fontSize: '0.8rem', textAlign: 'right' }}>
                    Logged on: {new Date(scenario.createdAt).toLocaleString()}
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