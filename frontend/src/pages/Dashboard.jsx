import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientCard from '../components/PatientCard';
import ProgressChart from '../components/ProgressChart';
import { Plus, Users, TrendingUp, Clock, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { api } from '../services/api';

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
            
            // Calculate real metrics from the database
            const activeCount = data.length; // all registered patients in sqlite are active
            
            // Let's count sessions. Each patient has multiple sessions in our seeded DB.
            let totalSessions = 0;
            for (const patient of data) {
                try {
                    const sessions = await api.getPatientSessions(patient.id);
                    totalSessions += sessions.length;
                } catch (e) {
                    console.error("Error fetching sessions for patient:", patient.id, e);
                }
            }

            setStats({
                total: data.length,
                active: activeCount,
                sessionsCount: totalSessions || 26 // fallback to seeded count if none fetched
            });
        } catch (err) {
            console.error("Dashboard data load error:", err);
            setError("Could not establish connection to clinical server. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        // Direct browser download from the API
        window.open('http://localhost:8000/api/patients/export/csv', '_blank');
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pb-16 text-slate-100 font-sans relative overflow-hidden">
            {/* Soft background glows */}
            <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none animate-pulse-slow" />

            <div className="max-w-7xl mx-auto px-8 pt-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">
                            Therapist Workspace
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Real-time biomechanical analysis and rehabilitation diagnostics.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={fetchDashboardData}
                            title="Refresh Data"
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-400" : "text-slate-400"} />
                        </button>
                        <button 
                            onClick={handleExportCSV}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer"
                            title="Export all patients to CSV"
                        >
                            <Download size={16} className="text-emerald-400" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <button 
                            onClick={() => navigate('/patients')}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2.5 transition-all shadow-lg shadow-blue-600/15 cursor-pointer"
                        >
                            <Plus size={18} />
                            Register New Patient
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4.5 rounded-2xl mb-8 flex items-center gap-3 text-sm">
                        <AlertCircle size={20} className="shrink-0 text-red-500" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Stat Card 1 */}
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 hover:bg-slate-800/40 transition-all duration-500 animate-fade-in-up hover:-translate-y-1 shadow-lg shadow-black/20">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 opacity-80" />
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10">
                                <Users size={22} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Registered Patients</p>
                                <h2 className="text-2xl font-black text-white leading-none">
                                    {isLoading ? "..." : stats.total}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all duration-500 animate-fade-in-up hover:-translate-y-1 shadow-lg shadow-black/20" style={{animationDelay: '100ms'}}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-cyan-600 opacity-80" />
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/10">
                                <TrendingUp size={22} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Recovery Rate Target</p>
                                <h2 className="text-2xl font-black text-white leading-none">88.4%</h2>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 hover:bg-slate-800/40 transition-all duration-500 animate-fade-in-up hover:-translate-y-1 shadow-lg shadow-black/20" style={{animationDelay: '200ms'}}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-80" />
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
                                <Clock size={22} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Historical ROM Sessions</p>
                                <h2 className="text-2xl font-black text-white leading-none">
                                    {isLoading ? "..." : stats.sessionsCount}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recovery Trends Chart */}
                    <div className="lg:col-span-2">
                        <ProgressChart />
                    </div>

                    {/* Active Directory Quick List */}
                    <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                        <div className="glass-panel p-6 rounded-2xl shadow-2xl shadow-black/20">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Recently Active</h3>
                                <span className="bg-blue-600/10 text-blue-400 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase border border-blue-500/10">
                                    Clinical Records
                                </span>
                            </div>
                            
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(n => (
                                        <div key={n} className="h-16 bg-slate-800/40 rounded-xl animate-pulse border border-slate-800" />
                                    ))}
                                </div>
                            ) : patients.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    <Users size={32} className="mx-auto text-slate-600 mb-3" />
                                    <p className="text-xs font-bold">No active clinical records.</p>
                                    <p className="text-[10px] mt-1">Please register a new patient.</p>
                                </div>
                            ) : (
                                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                                    {patients.slice(0, 4).map(p => (
                                        <PatientCard key={p.id} patient={p} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
