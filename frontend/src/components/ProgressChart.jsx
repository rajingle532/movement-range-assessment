import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../services/api';
import { TrendingUp, Activity, User } from 'lucide-react';

const ProgressChart = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load: Fetch all patients to populate selector
    useEffect(() => {
        const loadPatients = async () => {
            try {
                const data = await api.getPatients();
                setPatients(data);
                if (data.length > 0) {
                    setSelectedPatientId(data[0].id);
                }
            } catch (err) {
                console.error("Error loading patients for chart:", err);
            }
        };
        loadPatients();
    }, []);

    // Load sessions whenever the selected patient changes
    useEffect(() => {
        if (!selectedPatientId) return;

        const loadSessions = async () => {
            setIsLoading(true);
            try {
                const sessions = await api.getPatientSessions(selectedPatientId);
                
                // Sort sessions chronological by date
                const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Format sessions data for Recharts
                const formattedData = sortedSessions.map((session, sIdx) => {
                    const dataPoint = {
                        name: `Sess ${sIdx + 1}`,
                        date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        elbow: 0,
                        knee: 0,
                        shoulder: 0,
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
                console.error("Error loading sessions for progress chart:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadSessions();
    }, [selectedPatientId]);

    return (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl shadow-black/10 h-[420px] flex flex-col justify-between hover:border-slate-800 transition-all">
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none">ROM Recovery Curves</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Joint mobility metrics over multiple sessions</p>
                    </div>
                </div>

                {/* Patient Selector */}
                {patients.length > 0 && (
                    <div className="relative flex items-center gap-2 self-stretch sm:self-auto">
                        <User size={12} className="absolute left-3 text-slate-500 pointer-events-none" />
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="pl-7 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold cursor-pointer appearance-none w-full sm:w-auto"
                        >
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
                    </div>
                )}
            </div>

            {/* Recharts Component */}
            <div className="h-[280px] w-full mt-2 relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 rounded-2xl backdrop-blur-xs">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Loading Biometrics...</p>
                        </div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                        <Activity size={28} className="text-slate-700 mb-2 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400">No session readings.</p>
                        <p className="text-[9px] text-slate-500 font-medium">Conduct a live joint assessment session first.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ left: -15, right: 10, top: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#475569" 
                                fontSize={10} 
                                fontWeight="bold"
                                tickLine={false} 
                                axisLine={false} 
                                dy={10}
                            />
                            <YAxis 
                                stroke="#475569" 
                                fontSize={10} 
                                fontWeight="bold"
                                tickLine={false} 
                                axisLine={false} 
                                unit="°"
                                domain={[0, 180]}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#0F172A', 
                                    border: '1px solid #1E293B', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                                    color: '#fff' 
                                }}
                                itemStyle={{ fontWeight: 'bold', fontSize: '11px' }}
                                labelStyle={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}
                            />
                            <Legend 
                                verticalAlign="top" 
                                height={36} 
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                            />
                            {/* Elbow Curve */}
                            <Line 
                                type="monotone" 
                                dataKey="elbow" 
                                name="Elbow Flexion"
                                stroke="#2563EB" 
                                strokeWidth={3.5}
                                dot={{ r: 4, fill: '#2563EB', strokeWidth: 1.5, stroke: '#0F172A' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            {/* Knee Curve */}
                            <Line 
                                type="monotone" 
                                dataKey="knee" 
                                name="Knee Flexion"
                                stroke="#10B981" 
                                strokeWidth={3.5}
                                dot={{ r: 4, fill: '#10B981', strokeWidth: 1.5, stroke: '#0F172A' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            {/* Shoulder Curve */}
                            <Line 
                                type="monotone" 
                                dataKey="shoulder" 
                                name="Shoulder Abduction"
                                stroke="#06B6D4" 
                                strokeWidth={3.5}
                                dot={{ r: 4, fill: '#06B6D4', strokeWidth: 1.5, stroke: '#0F172A' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default ProgressChart;
