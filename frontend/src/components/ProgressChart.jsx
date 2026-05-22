import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { api } from '../services/api';
import { TrendingUp, Activity, User, Filter } from 'lucide-react';

const ProgressChart = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeJoint, setActiveJoint] = useState('all'); // 'all', 'elbow', 'knee', 'shoulder'

    // Initial load
    useEffect(() => {
        const loadPatients = async () => {
            try {
                const data = await api.getPatients();
                setPatients(data);
                if (data.length > 0) setSelectedPatientId(data[0].id);
            } catch (err) {
                console.error("Error loading patients:", err);
            }
        };
        loadPatients();
    }, []);

    // Load sessions
    useEffect(() => {
        if (!selectedPatientId) return;

        const loadSessions = async () => {
            setIsLoading(true);
            try {
                const sessions = await api.getPatientSessions(selectedPatientId);
                const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

                const formattedData = sortedSessions.map((session, sIdx) => {
                    const dataPoint = {
                        name: `Sess ${sIdx + 1}`,
                        date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        elbow: 0,
                        knee: 0,
                        shoulder: 0,
                        isMilestone: (sIdx + 1) % 5 === 0 // every 5th session is a milestone
                    };

                    session.measurements.forEach(m => {
                        if (m.joint_name === 'elbow') dataPoint.elbow = Math.round(m.angle);
                        if (m.joint_name === 'knee') dataPoint.knee = Math.round(m.angle);
                        if (m.joint_name === 'shoulder') dataPoint.shoulder = Math.round(m.angle);
                    });

                    return dataPoint;
                });

                setChartData(formattedData);
            } catch (err) {
                console.error("Error loading sessions:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSessions();
    }, [selectedPatientId]);

    const milestones = chartData.filter(d => d.isMilestone);

    return (
        <div className="glass-biopunk p-6 rounded-2xl h-[420px] flex flex-col justify-between">
            {/* Header controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#00e5ff]/10 text-[#00e5ff] rounded-lg border border-[#00e5ff]/20">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white leading-none">ROM Recovery Curves</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Joint mobility metrics over multiple sessions</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Toggles */}
                    <div className="hidden sm:flex items-center gap-1 bg-[#0b1426]/80 p-1 rounded-xl border border-[#00e5ff]/20">
                        {['all', 'elbow', 'knee', 'shoulder'].map(j => (
                            <button 
                                key={j}
                                onClick={() => setActiveJoint(j)}
                                className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all ${
                                    activeJoint === j 
                                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {j}
                            </button>
                        ))}
                    </div>

                    {/* Patient Selector */}
                    {patients.length > 0 && (
                        <div className="relative flex items-center gap-2 flex-grow md:flex-grow-0">
                            <User size={12} className="absolute left-3 text-[#00e5ff] pointer-events-none" />
                            <select
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                className="pl-8 pr-8 py-2 bg-[#0b1426]/80 border border-[#00e5ff]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00e5ff] font-bold cursor-pointer appearance-none w-full"
                            >
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#00e5ff] text-[10px]">▼</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-[280px] w-full mt-2 relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#070d1a]/50 rounded-2xl backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-[#00e5ff]/30 border-t-[#00e5ff] rounded-full animate-spin" />
                            <p className="text-[10px] text-[#00e5ff] font-bold uppercase tracking-widest animate-pulse">Loading Biometrics...</p>
                        </div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-[#00e5ff]/20 rounded-2xl">
                        <Activity size={28} className="text-[#00e5ff]/50 mb-2 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400">No session readings found.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" className="animate-fade-in">
                        <AreaChart data={chartData} margin={{ left: -15, right: 10, top: 20 }}>
                            <defs>
                                <linearGradient id="colorElbow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorKnee" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorShoulder" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffb300" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ffb300" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" vertical={false} />
                            
                            <XAxis 
                                dataKey="name" 
                                stroke="#475569" 
                                tickLine={false} 
                                axisLine={false} 
                                dy={10}
                            />
                            
                            <YAxis 
                                stroke="#475569" 
                                tickLine={false} 
                                axisLine={false} 
                                unit="°"
                                domain={[0, 180]}
                            />
                            
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#070d1a', 
                                    border: '1px solid rgba(0, 229, 255, 0.3)', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 0 20px rgba(0,229,255,0.15)',
                                    color: '#fff',
                                    fontFamily: 'DM Mono'
                                }}
                                itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                labelStyle={{ fontSize: '10px', color: '#00e5ff', fontWeight: 'bold', textTransform: 'uppercase' }}
                            />

                            {/* Milestone Markers */}
                            {milestones.map((m, i) => (
                                <ReferenceLine key={i} x={m.name} stroke="rgba(255,179,0,0.5)" strokeDasharray="3 3" label={{ position: 'top', value: 'Milestone', fill: '#ffb300', fontSize: 9, fontWeight: 'bold' }} />
                            ))}

                            {(activeJoint === 'all' || activeJoint === 'elbow') && (
                                <Area 
                                    type="monotone" 
                                    dataKey="elbow" 
                                    name="Elbow Flexion"
                                    stroke="#00e5ff" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorElbow)"
                                    animationDuration={1500}
                                    dot={{ r: 4, fill: '#070d1a', strokeWidth: 2, stroke: '#00e5ff' }}
                                    activeDot={{ r: 6, fill: '#00e5ff', strokeWidth: 0, className: 'animate-glow' }}
                                />
                            )}
                            
                            {(activeJoint === 'all' || activeJoint === 'knee') && (
                                <Area 
                                    type="monotone" 
                                    dataKey="knee" 
                                    name="Knee Flexion"
                                    stroke="#39ff14" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorKnee)"
                                    animationDuration={1500}
                                    dot={{ r: 4, fill: '#070d1a', strokeWidth: 2, stroke: '#39ff14' }}
                                    activeDot={{ r: 6, fill: '#39ff14', strokeWidth: 0, className: 'animate-glow' }}
                                />
                            )}
                            
                            {(activeJoint === 'all' || activeJoint === 'shoulder') && (
                                <Area 
                                    type="monotone" 
                                    dataKey="shoulder" 
                                    name="Shoulder Abduction"
                                    stroke="#ffb300" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorShoulder)"
                                    animationDuration={1500}
                                    dot={{ r: 4, fill: '#070d1a', strokeWidth: 2, stroke: '#ffb300' }}
                                    activeDot={{ r: 6, fill: '#ffb300', strokeWidth: 0, className: 'animate-glow' }}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default ProgressChart;
