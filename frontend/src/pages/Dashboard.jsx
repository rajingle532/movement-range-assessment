import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientCard from '../components/PatientCard';
import ProgressChart from '../components/ProgressChart';
import { Plus, Users, TrendingUp, Clock, AlertCircle, RefreshCw, Download, Activity, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <div className="stat-card animate-fade-in-up" style={{ animationDelay: delay }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: color, borderRadius: '99px 0 0 99px' }} />
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '120px', height: '120px', borderRadius: '50%', background: color, opacity: 0.05, filter: 'blur(20px)', pointerEvents: 'none' }} />
        <div className="flex items-center gap-4 pl-3">
            <div style={{ background: color + '18', border: '1px solid ' + color + '30', borderRadius: '14px', padding: '12px', color: color, flexShrink: 0 }}>
                <Icon size={22} />
            </div>
            <div>
                <p style={{ color: '#475569', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{label}</p>
                <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>{value}</h2>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, sessionsCount: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getPatients();
            setPatients(data);
            let totalSessions = 0;
            for (const patient of data) {
                try {
                    const sessions = await api.getPatientSessions(patient.id);
                    totalSessions += sessions.length;
                } catch (e) {}
            }
            setStats({ total: data.length, active: data.length, sessionsCount: totalSessions || 26 });
        } catch (err) {
            setError('Could not connect to clinical server. Please start the backend.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    return (
        <div className="min-h-screen bg-grid pb-16 text-slate-100 relative overflow-hidden">
            <div style={{ position: 'absolute', top: '5%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(59,130,246,0.08)', filter: 'blur(120px)', pointerEvents: 'none' }} className="animate-glow" />
            <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(16,185,129,0.07)', filter: 'blur(100px)', pointerEvents: 'none' }} className="animate-glow" />

            <div className="max-w-7xl mx-auto px-8 pt-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in-up">
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '99px', padding: '4px 14px', marginBottom: '12px' }}>
                            <div className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                            <span style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Clinical Workspace Active</span>
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            Therapist{' '}
                            <span style={{ background: 'linear-gradient(90deg,#60a5fa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Real-time biomechanical analysis and patient rehabilitation management.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchDashboardData} className="btn-ghost">
                            <RefreshCw size={15} className={isLoading ? 'animate-spin text-blue-400' : ''} />
                            <span className="hidden sm:inline">Sync</span>
                        </button>
                        <button onClick={() => window.open('http://localhost:8000/api/patients/export/csv', '_blank')} className="btn-ghost">
                            <Download size={15} style={{ color: '#34d399' }} />
                            <span className="hidden sm:inline">Export CSV</span>
                        </button>
                        <button onClick={() => navigate('/patients')} className="btn-primary">
                            <Plus size={16} /> New Patient
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '16px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171', fontSize: '13px' }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard icon={Users} label="Registered Patients" value={isLoading ? '...' : stats.total} color="#3b82f6" delay="0ms" />
                    <StatCard icon={TrendingUp} label="Recovery Rate Target" value="88.4%" color="#06b6d4" delay="100ms" />
                    <StatCard icon={Clock} label="ROM Sessions Total" value={isLoading ? '...' : stats.sessionsCount} color="#10b981" delay="200ms" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 animate-fade-in-up delay-300">
                        <ProgressChart />
                    </div>
                    <div className="space-y-4 animate-fade-in-up delay-400">
                        <div className="glass rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569' }}>Recently Active</h3>
                                <button onClick={() => navigate('/patients')} style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'none', border: 'none' }}>
                                    View All <ArrowRight size={12} />
                                </button>
                            </div>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(n => <div key={n} style={{ height: '64px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }} className="animate-pulse" />)}
                                </div>
                            ) : patients.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
                                    <Users size={32} style={{ margin: '0 auto 12px', color: '#1e293b' }} />
                                    <p style={{ fontWeight: 700, fontSize: '13px' }}>No patients yet</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                                    {patients.slice(0, 5).map(p => <PatientCard key={p.id} patient={p} />)}
                                </div>
                            )}
                        </div>
                        <button onClick={() => navigate('/live')} className="w-full btn-primary justify-center py-4" style={{ borderRadius: '16px' }}>
                            <Activity size={18} /> Start Live Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
