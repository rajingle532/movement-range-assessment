import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import PatientCard from '../components/PatientCard';
import ProgressChart from '../components/ProgressChart';
import SessionComparisonChart from '../components/SessionComparisonChart';
import { Plus, Users, TrendingUp, Clock, AlertCircle, RefreshCw, Download, Activity, ArrowRight, GitCompare } from 'lucide-react';
import { api, API_URL } from '../services/api';

const SparklineSVG = ({ color }) => (
    <svg className="w-16 h-8 overflow-visible opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 40">
        <path d="M0,35 Q10,35 20,25 T40,15 T60,20 T80,5 T100,10" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="10" r="3" fill={color} className="animate-pulse" />
    </svg>
);

const StatCard = ({ icon: Icon, label, value, color, suffix = '', gradient, delay }) => (
    <div className={`stat-card-biopunk group animate-fade-in-up stagger-${delay}`}>
        {/* Unique Background Gradient */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: gradient }} />
        
        <div className="flex justify-between items-start z-10">
            <div className="flex items-center gap-3">
                <div style={{ color: color }} className="p-2.5 rounded-xl bg-black/40 border border-white/5 shadow-inner">
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
                    <h2 className="font-mono-data text-white text-3xl font-black tracking-tight flex items-baseline gap-1">
                        <CountUp end={value} duration={2.5} separator="," decimals={suffix === '%' ? 1 : 0} />
                        {suffix && <span className="text-lg text-slate-500">{suffix}</span>}
                    </h2>
                </div>
            </div>
            <SparklineSVG color={color} />
        </div>
    </div>
);

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, sessionsCount: 0, target: 88.4 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    // Map of patientId → romProgress (0-100)
    const [romProgressMap, setRomProgressMap] = useState({});
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getPatients();
            setPatients(data);
            let totalSessions = 0;
            const progressMap = {};

            for (const patient of data) {
                try {
                    const sessions = await api.getPatientSessions(patient.id);
                    totalSessions += sessions.length;

                    // Compute ROM progress from the latest session's measurements
                    if (sessions.length > 0) {
                        const latest = sessions.reduce((a, b) =>
                            new Date(a.date) > new Date(b.date) ? a : b
                        );
                        if (latest.measurements && latest.measurements.length > 0) {
                            const normalCount = latest.measurements.filter(
                                m => m.status === 'Normal'
                            ).length;
                            progressMap[patient.id] = Math.round(
                                (normalCount / latest.measurements.length) * 100
                            );
                        } else {
                            // No measurements yet — base on session count as rough proxy
                            progressMap[patient.id] = Math.min(100, sessions.length * 15);
                        }
                    } else {
                        progressMap[patient.id] = 0;
                    }
                } catch (e) {
                    progressMap[patient.id] = 0;
                }
            }

            setRomProgressMap(progressMap);
            // No hardcoded fallback — show the real count (even if 0)
            setStats({ total: data.length, active: data.length, sessionsCount: totalSessions, target: 88.4 });
        } catch (err) {
            setError('Could not connect to clinical server. Please start the backend.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    return (
        <div className="min-h-screen bg-grid-biopunk pb-16 text-slate-100 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00e5ff] rounded-full blur-[150px] opacity-[0.03] pointer-events-none animate-glow" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#39ff14] rounded-full blur-[150px] opacity-[0.03] pointer-events-none animate-glow" style={{ animationDelay: '2s' }} />

            <div className="max-w-[1400px] mx-auto px-6 pt-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in-up">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-[#00e5ff]/10 border border-[#00e5ff]/20 rounded-full px-3 py-1.5 mb-3 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-glow" />
                            <span className="text-[#00e5ff] text-[10px] font-bold uppercase tracking-widest">Clinical Workspace Active</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            Therapist <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#39ff14]">Dashboard</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">Real-time biomechanical analysis and patient rehabilitation management.</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={fetchDashboardData} className="btn-biopunk">
                            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Sync</span>
                        </button>
                        <button onClick={() => window.open(`${API_URL}/api/patients/export/csv`, '_blank')} className="btn-biopunk !border-[#39ff14]/30 !text-[#39ff14] hover:!bg-[#39ff14]/10">
                            <Download size={15} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-[#ffb300]/10 border border-[#ffb300]/30 rounded-xl p-4 mb-8 flex items-center gap-3 text-[#ffb300] text-sm font-bold shadow-[0_0_15px_rgba(255,179,0,0.1)] animate-fade-in">
                        <AlertCircle size={20} className="shrink-0 animate-pulse" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Top 3 Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard 
                        icon={Users} 
                        label="Registered Patients" 
                        value={isLoading ? 0 : stats.total} 
                        color="#00e5ff" 
                        gradient="radial-gradient(circle at 100% 100%, rgba(0,229,255,0.8), transparent 60%)"
                        delay="1" 
                    />
                    <StatCard 
                        icon={TrendingUp} 
                        label="Recovery Rate Target" 
                        value={isLoading ? 0 : stats.target} 
                        suffix="%"
                        color="#39ff14" 
                        gradient="radial-gradient(circle at 100% 100%, rgba(57,255,20,0.8), transparent 60%)"
                        delay="2" 
                    />
                    <StatCard 
                        icon={Clock} 
                        label="ROM Sessions Total" 
                        value={isLoading ? 0 : stats.sessionsCount} 
                        color="#ffb300" 
                        gradient="radial-gradient(circle at 100% 100%, rgba(255,179,0,0.8), transparent 60%)"
                        delay="3" 
                    />
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Panel: Chart */}
                    <div className="lg:col-span-2 animate-fade-in-up stagger-4">
                        <ProgressChart />
                    </div>

                    {/* Right Panel: Active Patients & Start Session */}
                    <div className="space-y-6 flex flex-col h-full animate-fade-in-up stagger-5">
                        
                        {/* Start Live Session Button */}
                        <button 
                            onClick={() => navigate('/live')} 
                            className="btn-pulse w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm transition-all transform hover:-translate-y-1"
                        >
                            <Activity size={20} className="animate-pulse" /> Start Live Session
                        </button>

                        {/* Patients List */}
                        <div className="glass-biopunk rounded-2xl p-5 flex-grow flex flex-col">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recently Active</h3>
                                <button onClick={() => navigate('/patients')} className="text-[#00e5ff] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                                    View All <ArrowRight size={12} />
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(n => <div key={n} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
                                </div>
                            ) : patients.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 border border-dashed border-[#00e5ff]/20 rounded-xl m-auto w-full">
                                    <Users size={32} className="mx-auto mb-3 opacity-50" />
                                    <p className="font-bold text-xs uppercase tracking-widest">No patients yet</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar flex-grow max-h-[300px]">
                                {patients.slice(0, 5).map((p, i) => <PatientCard key={p.id} patient={p} index={i} romProgress={romProgressMap[p.id] ?? 0} />)}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
                {/* ── Session Comparison Chart — full width ── */}
                <div className="mt-8 animate-fade-in-up stagger-5">
                    <SessionComparisonChart />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
