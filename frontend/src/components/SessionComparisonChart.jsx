import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Cell, LabelList,
} from 'recharts';
import { api } from '../services/api';
import {
    GitCompare, User, TrendingUp, TrendingDown, Minus,
    Activity, ChevronDown, ArrowRight, Zap,
} from 'lucide-react';

// ─── Joint meta ──────────────────────────────────────────────────────────────
const JOINTS = [
    { key: 'elbow',    label: 'Elbow Flexion',      icon: '💪', color: '#00e5ff', normal: 145 },
    { key: 'knee',     label: 'Knee Flexion',        icon: '🦵', color: '#39ff14', normal: 135 },
    { key: 'shoulder', label: 'Shoulder Abd.',       icon: '🫁', color: '#ffb300', normal: 180 },
];

// ─── Helper: extract angles from one session object ──────────────────────────
const extractAngles = (session) => {
    const out = { elbow: 0, knee: 0, shoulder: 0 };
    if (!session?.measurements) return out;
    session.measurements.forEach(m => {
        if (m.joint_name === 'elbow')    out.elbow    = Math.round(m.angle);
        if (m.joint_name === 'knee')     out.knee     = Math.round(m.angle);
        if (m.joint_name === 'shoulder') out.shoulder = Math.round(m.angle);
    });
    return out;
};

// ─── Custom styled select ─────────────────────────────────────────────────────
const StyledSelect = ({ value, onChange, options, placeholder, icon: Icon, accentColor = '#00e5ff' }) => (
    <div className="relative flex items-center">
        {Icon && (
            <Icon
                size={12}
                className="absolute left-3 pointer-events-none z-10"
                style={{ color: accentColor }}
            />
        )}
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="pl-8 pr-7 py-2 bg-[#0b1426]/80 border rounded-xl text-xs text-white focus:outline-none font-bold cursor-pointer appearance-none transition-all"
            style={{
                borderColor: value ? `${accentColor}40` : 'rgba(255,255,255,0.08)',
                boxShadow: value ? `0 0 10px ${accentColor}15` : 'none',
            }}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
        <div
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]"
            style={{ color: accentColor }}
        >
            ▼
        </div>
    </div>
);

// ─── Delta card (improvement stat) ───────────────────────────────────────────
const DeltaCard = ({ joint, angleA, angleB }) => {
    const delta = angleB - angleA;
    const pctChange = angleA > 0 ? ((delta / angleA) * 100) : 0;
    const isImproved = delta > 0;
    const isFlat     = delta === 0;

    const color    = isFlat ? '#64748b' : isImproved ? '#4ade80' : '#f87171';
    const bgColor  = isFlat ? 'rgba(100,116,139,0.08)' : isImproved ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
    const border   = isFlat ? 'rgba(100,116,139,0.2)'  : isImproved ? 'rgba(34,197,94,0.2)'  : 'rgba(239,68,68,0.2)';
    const Icon     = isFlat ? Minus : isImproved ? TrendingUp : TrendingDown;

    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-2 flex-1 min-w-0"
            style={{ background: bgColor, border: `1px solid ${border}` }}
        >
            {/* Joint label */}
            <div className="flex items-center gap-1.5">
                <span className="text-base">{joint.icon}</span>
                <span
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: joint.color }}
                >
                    {joint.label}
                </span>
            </div>

            {/* Delta */}
            <div className="flex items-baseline gap-2">
                <span
                    className="text-3xl font-black font-mono leading-none"
                    style={{ color }}
                >
                    {delta > 0 ? '+' : ''}{delta}°
                </span>
                <Icon size={16} style={{ color }} />
            </div>

            {/* Percentage */}
            <div className="flex items-center justify-between mt-1">
                <span
                    className="text-[10px] font-bold"
                    style={{ color }}
                >
                    {Math.abs(pctChange).toFixed(1)}% {isImproved ? 'improvement' : isFlat ? 'unchanged' : 'regression'}
                </span>
            </div>

            {/* A → B row */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mt-0.5">
                <span className="text-slate-400 font-mono">{angleA}°</span>
                <ArrowRight size={10} className="text-slate-600" />
                <span className="font-mono" style={{ color }}>{angleB}°</span>
            </div>
        </div>
    );
};

// ─── Custom Bar Tooltip ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#070d1a', border: '1px solid rgba(0,229,255,0.25)',
            borderRadius: '12px', padding: '12px 16px',
            boxShadow: '0 0 20px rgba(0,229,255,0.1)',
            fontFamily: 'DM Mono, monospace', minWidth: '160px',
        }}>
            <p style={{ color: '#00e5ff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                {label}
            </p>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
                    <span style={{ color: p.fill, fontSize: '11px', fontWeight: 700 }}>{p.name}</span>
                    <span style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 900, fontFamily: 'monospace' }}>{p.value}°</span>
                </div>
            ))}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SessionComparisonChart = () => {
    const [patients,           setPatients]           = useState([]);
    const [selectedPatientId,  setSelectedPatientId]  = useState('');
    const [sessions,           setSessions]           = useState([]);
    const [sessionIdA,         setSessionIdA]         = useState('');
    const [sessionIdB,         setSessionIdB]         = useState('');
    const [isLoadingPatients,  setIsLoadingPatients]  = useState(true);
    const [isLoadingSessions,  setIsLoadingSessions]  = useState(false);
    const [errorMsg,           setErrorMsg]           = useState('');

    // ── Load patients on mount ──
    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getPatients();
                setPatients(data);
                if (data.length > 0) setSelectedPatientId(String(data[0].id));
            } catch {
                setErrorMsg('Could not load patients.');
            } finally {
                setIsLoadingPatients(false);
            }
        };
        load();
    }, []);

    // ── Load sessions when patient changes ──
    useEffect(() => {
        if (!selectedPatientId) return;
        const load = async () => {
            setIsLoadingSessions(true);
            setSessionIdA(''); setSessionIdB('');
            setErrorMsg('');
            try {
                const data = await api.getPatientSessions(selectedPatientId);
                const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
                setSessions(sorted);
                // Auto-select first and last as a sensible default
                if (sorted.length >= 2) {
                    setSessionIdA(String(sorted[0].id));
                    setSessionIdB(String(sorted[sorted.length - 1].id));
                } else if (sorted.length === 1) {
                    setSessionIdA(String(sorted[0].id));
                }
            } catch {
                setErrorMsg('Could not load sessions.');
            } finally {
                setIsLoadingSessions(false);
            }
        };
        load();
    }, [selectedPatientId]);

    // ── Derive session A & B objects ──
    const sessionA = useMemo(() => sessions.find(s => String(s.id) === sessionIdA), [sessions, sessionIdA]);
    const sessionB = useMemo(() => sessions.find(s => String(s.id) === sessionIdB), [sessions, sessionIdB]);

    const anglesA = useMemo(() => extractAngles(sessionA), [sessionA]);
    const anglesB = useMemo(() => extractAngles(sessionB), [sessionB]);

    // ── Build grouped bar chart data ──
    const chartData = useMemo(() => {
        if (!sessionA && !sessionB) return [];
        return JOINTS.map(j => ({
            joint:  j.label,
            icon:   j.icon,
            color:  j.color,
            normal: j.normal,
            sessionA: anglesA[j.key],
            sessionB: anglesB[j.key],
        }));
    }, [anglesA, anglesB, sessionA, sessionB]);

    // ── Format session label ──
    const sessionLabel = (s, idx) => {
        if (!s) return '';
        const d = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `Sess ${idx + 1} · ${d}`;
    };

    const sessionOpts = sessions.map((s, idx) => ({
        value: String(s.id),
        label: sessionLabel(s, idx),
    }));

    const patientOpts = patients.map(p => ({ value: String(p.id), label: p.name }));

    const canCompare  = sessionA && sessionB && sessionA.id !== sessionB.id;
    const hasSessions = sessions.length >= 2;

    // ── Overall recovery score ──
    const overallDelta = canCompare
        ? JOINTS.reduce((sum, j) => sum + (anglesB[j.key] - anglesA[j.key]), 0) / JOINTS.length
        : null;

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="glass-biopunk rounded-2xl p-6 flex flex-col gap-5">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl border"
                        style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.25)' }}
                    >
                        <GitCompare size={20} color="#a78bfa" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white leading-none">
                            Session Comparison
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">
                            Side-by-side ROM analysis across two sessions
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Patient picker */}
                    {patients.length > 0 && (
                        <StyledSelect
                            value={selectedPatientId}
                            onChange={setSelectedPatientId}
                            options={patientOpts}
                            icon={User}
                            accentColor="#a78bfa"
                        />
                    )}

                    {/* Session A */}
                    {hasSessions && (
                        <StyledSelect
                            value={sessionIdA}
                            onChange={setSessionIdA}
                            options={sessionOpts.filter(o => o.value !== sessionIdB)}
                            placeholder="Session A"
                            accentColor="#00e5ff"
                        />
                    )}

                    {hasSessions && (
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-px bg-slate-700" />
                            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">vs</span>
                            <div className="w-5 h-px bg-slate-700" />
                        </div>
                    )}

                    {/* Session B */}
                    {hasSessions && (
                        <StyledSelect
                            value={sessionIdB}
                            onChange={setSessionIdB}
                            options={sessionOpts.filter(o => o.value !== sessionIdA)}
                            placeholder="Session B"
                            accentColor="#a78bfa"
                        />
                    )}
                </div>
            </div>

            {/* ── Loading / Error / Not Enough Sessions ── */}
            {(isLoadingPatients || isLoadingSessions) ? (
                <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-[#a78bfa]/30 border-t-[#a78bfa] rounded-full animate-spin" />
                        <p className="text-[10px] text-[#a78bfa] font-bold uppercase tracking-widest animate-pulse">
                            Loading Session Data...
                        </p>
                    </div>
                </div>
            ) : errorMsg ? (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm font-bold">
                    {errorMsg}
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-[#a78bfa]/20 rounded-2xl gap-3">
                    <Activity size={28} className="text-[#a78bfa]/40 animate-pulse" />
                    <p className="text-xs font-bold text-slate-400">No sessions recorded for this patient yet.</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Run a Live Session to generate data</p>
                </div>
            ) : sessions.length === 1 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-[#a78bfa]/20 rounded-2xl gap-3">
                    <GitCompare size={28} className="text-[#a78bfa]/40" />
                    <p className="text-xs font-bold text-slate-400">Only 1 session found — need at least 2 to compare.</p>
                </div>
            ) : (
                <>
                    {/* ── Legend + Overall score row ── */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Legend */}
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-sm" style={{ background: 'rgba(0,229,255,0.7)', border: '1px solid #00e5ff' }} />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {sessionA ? sessionLabel(sessionA, sessions.indexOf(sessionA)) : 'Session A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-sm" style={{ background: 'rgba(167,139,250,0.7)', border: '1px solid #a78bfa' }} />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {sessionB ? sessionLabel(sessionB, sessions.indexOf(sessionB)) : 'Session B'}
                                </span>
                            </div>
                        </div>

                        {/* Overall improvement badge */}
                        {canCompare && overallDelta !== null && (
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                                style={{
                                    background: overallDelta >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                    border: `1px solid ${overallDelta >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                                }}
                            >
                                <Zap size={13} style={{ color: overallDelta >= 0 ? '#4ade80' : '#f87171' }} />
                                <span
                                    className="text-[11px] font-black"
                                    style={{ color: overallDelta >= 0 ? '#4ade80' : '#f87171' }}
                                >
                                    {overallDelta >= 0 ? 'Avg +' : 'Avg '}{overallDelta.toFixed(1)}° across all joints
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── Grouped Bar Chart ── */}
                    {canCompare ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                                    barGap={4}
                                    barCategoryGap="30%"
                                >
                                    <defs>
                                        {JOINTS.map(j => (
                                            <linearGradient key={j.key} id={`grad-a-${j.key}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.5} />
                                            </linearGradient>
                                        ))}
                                        {JOINTS.map(j => (
                                            <linearGradient key={j.key} id={`grad-b-${j.key}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.5} />
                                            </linearGradient>
                                        ))}
                                    </defs>

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(0,229,255,0.07)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="joint"
                                        stroke="#475569"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                                        dy={8}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        tickLine={false}
                                        axisLine={false}
                                        unit="°"
                                        domain={[0, 180]}
                                        tick={{ fontSize: 10, fill: '#475569' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />

                                    {/* Normal range reference line */}
                                    <ReferenceLine
                                        y={90}
                                        stroke="rgba(255,255,255,0.08)"
                                        strokeDasharray="4 4"
                                        label={{ value: 'Midpoint', fill: '#334155', fontSize: 9, position: 'insideRight' }}
                                    />

                                    {/* Session A bars */}
                                    <Bar
                                        dataKey="sessionA"
                                        name={sessionA ? sessionLabel(sessionA, sessions.indexOf(sessionA)) : 'Session A'}
                                        radius={[6, 6, 0, 0]}
                                        fill="url(#grad-a-elbow)"
                                        maxBarSize={56}
                                    >
                                        {chartData.map((entry, i) => (
                                            <Cell key={i} fill="#00e5ff" fillOpacity={0.75} />
                                        ))}
                                        <LabelList
                                            dataKey="sessionA"
                                            position="top"
                                            style={{ fontSize: 10, fontWeight: 800, fill: '#00e5ff', fontFamily: 'monospace' }}
                                            formatter={v => v > 0 ? `${v}°` : '—'}
                                        />
                                    </Bar>

                                    {/* Session B bars */}
                                    <Bar
                                        dataKey="sessionB"
                                        name={sessionB ? sessionLabel(sessionB, sessions.indexOf(sessionB)) : 'Session B'}
                                        radius={[6, 6, 0, 0]}
                                        fill="#a78bfa"
                                        fillOpacity={0.75}
                                        maxBarSize={56}
                                    >
                                        {chartData.map((entry, i) => {
                                            const delta = entry.sessionB - entry.sessionA;
                                            return (
                                                <Cell
                                                    key={i}
                                                    fill="#a78bfa"
                                                    fillOpacity={delta > 0 ? 0.9 : delta < 0 ? 0.5 : 0.7}
                                                />
                                            );
                                        })}
                                        <LabelList
                                            dataKey="sessionB"
                                            position="top"
                                            style={{ fontSize: 10, fontWeight: 800, fill: '#a78bfa', fontFamily: 'monospace' }}
                                            formatter={v => v > 0 ? `${v}°` : '—'}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-48 border border-dashed border-[#a78bfa]/15 rounded-2xl">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Select two different sessions above to compare
                            </p>
                        </div>
                    )}

                    {/* ── Delta Cards row ── */}
                    {canCompare && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {JOINTS.map(j => (
                                <DeltaCard
                                    key={j.key}
                                    joint={j}
                                    angleA={anglesA[j.key]}
                                    angleB={anglesB[j.key]}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Tip row ── */}
                    {canCompare && (
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">
                            Cyan bars = Session A (earlier) · Purple bars = Session B (later) · Improvement shown in green delta cards
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default SessionComparisonChart;
