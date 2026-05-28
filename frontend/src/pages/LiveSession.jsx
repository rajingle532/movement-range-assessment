import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useWebSocket } from '../hooks/useWebSocket';
import AngleGauge from '../components/AngleGauge';
import JointTable from '../components/JointTable';
import SkeletonViewer from '../components/SkeletonViewer';
import {
    Activity, Timer, Save, AlertCircle, CheckCircle, HelpCircle,
    TrendingUp, Award, X, BarChart2, ArrowRight, Clock,
    ChevronDown, ChevronUp, AlertTriangle, Target, RotateCcw, User,
} from 'lucide-react';
import { api } from '../services/api';

// Derive WebSocket URL from the Vite env variable (falls back to localhost)
const _apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_URL = _apiBase.replace(/^http/, 'ws') + '/ws/stream';

// ─── Default Clinical Thresholds ─────────────────────────────────────────────
const DEFAULT_THRESHOLDS = { elbow: 120, knee: 110, shoulder: 90 };
const JOINT_META = [
    { key: 'elbow',    label: 'Elbow Flexion',    icon: '💪', color: '#00e5ff', normal: 145 },
    { key: 'knee',     label: 'Knee Flexion',      icon: '🦵', color: '#39ff14', normal: 135 },
    { key: 'shoulder', label: 'Shoulder Abd.',     icon: '🫁', color: '#ffb300', normal: 180 },
];

// ─── Threshold Settings Panel ─────────────────────────────────────────────────
const ThresholdPanel = ({ thresholds, onUpdate, onReset }) => {
    const [expanded, setExpanded] = useState(false);

    const handleChange = (key, raw) => {
        const val = Math.min(180, Math.max(0, parseInt(raw) || 0));
        onUpdate(key, val);
    };

    const allOff = Object.values(thresholds).every(v => v === 0);

    return (
        <div
            className="glass-biopunk rounded-2xl overflow-hidden transition-all duration-300"
            style={{ borderColor: expanded ? 'rgba(255,179,0,0.3)' : undefined }}
        >
            {/* Header row — always visible */}
            <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
            >
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Target size={13} className="text-amber-400" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                    ROM Targets
                </span>

                {/* Quick-view pills when collapsed */}
                {!expanded && (
                    <div className="flex items-center gap-1.5 ml-auto mr-1">
                        {allOff ? (
                            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Off</span>
                        ) : (
                            JOINT_META.map(j => (
                                thresholds[j.key] > 0 && (
                                    <span
                                        key={j.key}
                                        className="text-[9px] font-black px-1.5 py-0.5 rounded-full border"
                                        style={{
                                            color: j.color,
                                            borderColor: `${j.color}40`,
                                            background: `${j.color}10`,
                                        }}
                                    >
                                        {j.icon}{thresholds[j.key]}°
                                    </span>
                                )
                            ))
                        )}
                    </div>
                )}

                <span className="text-slate-600 ml-auto" style={expanded ? {} : { marginLeft: 0 }}>
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
            </button>

            {/* Expanded controls */}
            {expanded && (
                <div className="px-4 pb-4 space-y-5 border-t border-white/[0.04] pt-4">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                        Drag sliders · 0° = disabled · Color turns red when below target
                    </p>

                    {JOINT_META.map(({ key, label, icon, color }) => {
                        const val = thresholds[key];
                        const pct = (val / 180) * 100;
                        // Dynamic fill on slider track
                        const sliderBg = val > 0
                            ? `linear-gradient(to right, ${color}90 ${pct}%, rgba(255,255,255,0.07) ${pct}%)`
                            : 'rgba(255,255,255,0.07)';

                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] font-bold" style={{ color }}>
                                        {icon} {label}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {val > 0 ? (
                                            <span
                                                className="text-sm font-black font-mono"
                                                style={{ color }}
                                            >
                                                {val}°
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Off</span>
                                        )}
                                        {val > 0 && (
                                            <button
                                                onClick={() => onUpdate(key, 0)}
                                                className="text-slate-600 hover:text-slate-400 transition-colors"
                                                title="Disable this target"
                                            >
                                                <X size={11} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="180" step="5"
                                    value={val}
                                    onChange={e => handleChange(key, e.target.value)}
                                    className="rom-slider w-full"
                                    style={{ accentColor: color, background: sliderBg }}
                                />
                                <div className="flex justify-between text-[8px] text-slate-700 font-bold mt-1 px-0.5">
                                    <span>Off</span>
                                    <span>90°</span>
                                    <span>180°</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Reset button */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onReset}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-amber-400 uppercase tracking-wider transition-colors"
                        >
                            <RotateCcw size={11} /> Restore Defaults
                        </button>
                        <button
                            onClick={() => onUpdate('_all', 0)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-wider transition-colors ml-auto"
                        >
                            <X size={11} /> Clear All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Session Summary Modal ────────────────────────────────────────────────────
const SessionSummaryModal = ({ summary, onSaveAndExit, onExitWithoutSaving, isSaving }) => {
    const { duration, peakAngles, avgAngles, finalStatus, sessionQuality } = summary;

    const formatTime = (s) => {
        const m   = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const getStatusChip = (s) => {
        const norm = (s || 'Normal').toLowerCase();
        if (norm.includes('normal')) return { label: 'Normal',           bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  color: '#4ade80' };
        if (norm.includes('mild'))   return { label: 'Mild Restriction', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' };
        return                              { label: 'Restricted',       bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  color: '#f87171' };
    };

    const qualityColor = sessionQuality >= 80 ? '#39ff14' : sessionQuality >= 50 ? '#ffb300' : '#ef4444';
    const qualityLabel = sessionQuality >= 80 ? 'Excellent' : sessionQuality >= 50 ? 'Good' : 'Limited Data';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div style={{
                width: '100%', maxWidth: '620px',
                background: 'rgba(7,13,26,0.97)',
                border: '1px solid rgba(0,229,255,0.2)', borderRadius: '24px',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,229,255,0.06)',
                overflow: 'hidden',
                animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
            }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,rgba(0,229,255,0.08),rgba(57,255,20,0.04))', borderBottom: '1px solid rgba(0,229,255,0.12)', padding: '24px 28px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(0,229,255,0.2),rgba(57,255,20,0.1))', border: '1px solid rgba(0,229,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,229,255,0.2)' }}>
                            <Award size={22} color="#00e5ff" />
                        </div>
                        <div>
                            <h2 style={{ color: '#fff', fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '20px', margin: 0, letterSpacing: '-0.3px' }}>Session Complete</h2>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ROM Assessment Summary</p>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                            <div style={{ background: `rgba(${qualityColor === '#39ff14' ? '57,255,20' : qualityColor === '#ffb300' ? '255,179,0' : '239,68,68'},0.1)`, border: `1px solid ${qualityColor}40`, borderRadius: '12px', padding: '8px 14px' }}>
                                <div style={{ color: qualityColor, fontSize: '22px', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>{sessionQuality}%</div>
                                <div style={{ color: qualityColor, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>{qualityLabel}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '99px', padding: '6px 14px', marginTop: '16px' }}>
                        <Clock size={13} color="#60a5fa" />
                        <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{formatTime(duration)}</span>
                        <span style={{ color: '#475569', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Session Duration</span>
                    </div>
                </div>

                {/* Joint cards */}
                <div style={{ padding: '20px 28px' }}>
                    <p style={{ color: '#475569', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart2 size={12} color="#00e5ff" /> Joint Measurements
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {JOINT_META.map(({ key, label, icon }) => {
                            const chip = getStatusChip(finalStatus[key]);
                            return (
                                <div key={key} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '16px' }}>{icon}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.2 }}>{label}</span>
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Peak</div>
                                        <div style={{ color: '#00e5ff', fontSize: '28px', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>
                                            {Math.round(peakAngles[key])}<span style={{ fontSize: '14px', color: '#475569' }}>°</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Avg</div>
                                        <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>{Math.round(avgAngles[key])}°</div>
                                    </div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: chip.bg, border: `1px solid ${chip.border}`, borderRadius: '99px', padding: '3px 8px', color: chip.color, fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {chip.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Progress bars */}
                <div style={{ padding: '0 28px 20px' }}>
                    <p style={{ color: '#475569', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={12} color="#39ff14" /> Range Achieved vs. Normal (180°)
                    </p>
                    {JOINT_META.map(({ key, label, color }) => {
                        const pct = Math.min(100, Math.round((peakAngles[key] / 180) * 100));
                        return (
                            <div key={key} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>{label}</span>
                                    <span style={{ color, fontSize: '11px', fontWeight: 800, fontFamily: 'monospace' }}>{pct}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${color}80,${color})`, borderRadius: '99px', boxShadow: `0 0 8px ${color}60`, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 28px', display: 'flex', gap: '10px', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                    <button
                        onClick={onExitWithoutSaving}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', borderRadius: '12px', padding: '10px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#f87171'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <X size={13} /> Exit Without Saving
                    </button>
                    <button
                        onClick={onSaveAndExit}
                        disabled={isSaving}
                        style={{ background: isSaving ? 'rgba(0,229,255,0.3)' : 'linear-gradient(135deg,#00e5ff,#39ff14)', color: '#000', border: 'none', borderRadius: '12px', padding: '10px 24px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: isSaving ? 'none' : '0 4px 20px rgba(0,229,255,0.3)', transition: 'all 0.2s' }}
                    >
                        {isSaving ? (
                            <><div style={{ width: '13px', height: '13px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving...</>
                        ) : (
                            <><Save size={13} /> Save & Go to Dashboard <ArrowRight size={13} /></>
                        )}
                    </button>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

// ─── Main LiveSession Component ───────────────────────────────────────────────
const LiveSession = () => {
    const { videoRef, startVideo, stopVideo, error: cameraError, isCameraReady } = useCamera();
    const { isConnected, angles, status, annotatedFrame, sendFrame } = useWebSocket(WS_URL);
    const canvasRef  = useRef(null);
    const navigate   = useNavigate();

    // ── Patient selector ──
    const [patients,           setPatients]           = useState([]);
    const [selectedPatientId,  setSelectedPatientId]  = useState(null);
    const [isPatientsLoading,  setIsPatientsLoading]  = useState(true);

    // Fetch patients list on mount so user can pick who is being assessed
    useEffect(() => {
        api.getPatients()
            .then(data => {
                setPatients(data);
                if (data.length > 0) setSelectedPatientId(data[0].id);
            })
            .catch(() => {})
            .finally(() => setIsPatientsLoading(false));
    }, []);

    const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

    // ── Timer ──
    const [seconds, setSeconds] = useState(0);

    // ── Archive (top-bar) save states ──
    const [isSaving,     setIsSaving]     = useState(false);
    const [saveSuccess,  setSaveSuccess]  = useState('');
    const [saveError,    setSaveError]    = useState('');

    // ── Session tracking refs (no re-render during streaming) ──
    const peakAnglesRef  = useRef({ elbow: 0, knee: 0, shoulder: 0 });
    const sumAnglesRef   = useRef({ elbow: 0, knee: 0, shoulder: 0 });
    const frameCountRef  = useRef(0);
    const finalStatusRef = useRef({});

    // ── Summary modal ──
    const [showSummary,   setShowSummary]   = useState(false);
    const [summary,       setSummary]       = useState(null);
    const [isSavingModal, setIsSavingModal] = useState(false);

    // ── ROM Thresholds — persisted in localStorage ──
    const [thresholds, setThresholds] = useState(() => {
        try {
            const saved = localStorage.getItem('rom_thresholds');
            return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
        } catch {
            return DEFAULT_THRESHOLDS;
        }
    });

    const updateThreshold = useCallback((key, val) => {
        setThresholds(prev => {
            let next;
            if (key === '_all') {
                next = { elbow: 0, knee: 0, shoulder: 0 };
            } else {
                next = { ...prev, [key]: val };
            }
            localStorage.setItem('rom_thresholds', JSON.stringify(next));
            return next;
        });
    }, []);

    const resetThresholds = useCallback(() => {
        localStorage.setItem('rom_thresholds', JSON.stringify(DEFAULT_THRESHOLDS));
        setThresholds(DEFAULT_THRESHOLDS);
    }, []);

    // ── Compute active threshold alerts ──
    const thresholdAlerts = isConnected
        ? JOINT_META
            .filter(({ key }) => thresholds[key] > 0 && Math.round(angles[key]) > 5 && Math.round(angles[key]) < thresholds[key])
            .map(({ key, label, color, icon }) => ({
                key, label, color, icon,
                current:   Math.round(angles[key]),
                target:    thresholds[key],
                shortfall: thresholds[key] - Math.round(angles[key]),
            }))
        : [];

    // ── Track peak/avg angles on every frame ──
    useEffect(() => {
        if (!isConnected) return;
        const { elbow = 0, knee = 0, shoulder = 0 } = angles;
        if (elbow === 0 && knee === 0 && shoulder === 0) return;

        peakAnglesRef.current = {
            elbow:    Math.max(peakAnglesRef.current.elbow,    elbow),
            knee:     Math.max(peakAnglesRef.current.knee,     knee),
            shoulder: Math.max(peakAnglesRef.current.shoulder, shoulder),
        };
        sumAnglesRef.current = {
            elbow:    sumAnglesRef.current.elbow    + elbow,
            knee:     sumAnglesRef.current.knee     + knee,
            shoulder: sumAnglesRef.current.shoulder + shoulder,
        };
        frameCountRef.current  += 1;
        finalStatusRef.current  = status;
    }, [angles, isConnected, status]);

    // ── Camera lifecycle ──
    useEffect(() => {
        startVideo();
        return () => { stopVideo(); };
    }, [startVideo, stopVideo]);

    // ── Session timer ──
    useEffect(() => {
        let timer;
        if (isCameraReady && isConnected) {
            timer = setInterval(() => setSeconds(p => p + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(timer);
    }, [isCameraReady, isConnected]);

    const formatTime = (s) => {
        const m   = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    // ── Frame capture loop ──
    useEffect(() => {
        let interval;
        if (isCameraReady && isConnected) {
            interval = setInterval(() => {
                if (videoRef.current && canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx    = canvas.getContext('2d');
                    canvas.width = 640; canvas.height = 480;
                    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
                    sendFrame(canvas.toDataURL('image/jpeg', 0.6));
                }
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isCameraReady, isConnected, sendFrame, videoRef]);

    // ── Helper: save a session + its individual joint measurements ──
    const _persistSession = async (patientId, notes, peakAngles, lastStatus) => {
        const newSession = await api.createSession({ patient_id: patientId, notes });
        // Save individual measurements so charts can display real ROM data
        const measurements = JOINT_META.map(({ key, label }) => ({
            joint_name: key,
            angle: Math.round(peakAngles[key]),
            status: lastStatus[key] || 'Normal',
        }));
        await api.saveMeasurements(newSession.id, measurements);
        return newSession;
    };

    // ── Top-bar Quick Archive ──
    const handleSaveSession = async () => {
        setSaveError(''); setSaveSuccess(''); setIsSaving(true);
        try {
            if (!selectedPatient) {
                setSaveError('Please select a patient first.');
                setIsSaving(false);
                return;
            }
            const notes = `Live ROM session. Elbow: ${Math.round(angles.elbow)}°, Knee: ${Math.round(angles.knee)}°, Shoulder: ${Math.round(angles.shoulder)}°`;
            await _persistSession(selectedPatient.id, notes, peakAnglesRef.current, finalStatusRef.current);
            setSaveSuccess(`Session archived under: ${selectedPatient.name}`);
            setTimeout(() => setSaveSuccess(''), 4000);
        } catch { setSaveError('Failed to archive session.'); }
        finally { setIsSaving(false); }
    };

    // ── End Session → build summary → show modal ──
    const handleEndSession = useCallback(() => {
        stopVideo();
        const frames = frameCountRef.current;
        const peaks  = peakAnglesRef.current;
        const sums   = sumAnglesRef.current;
        const avg    = frames > 0
            ? { elbow: sums.elbow / frames, knee: sums.knee / frames, shoulder: sums.shoulder / frames }
            : { elbow: 0, knee: 0, shoulder: 0 };
        const quality = Math.min(100, Math.round((frames / Math.max(1, seconds * 10)) * 100));
        setSummary({ duration: seconds, peakAngles: peaks, avgAngles: avg, finalStatus: finalStatusRef.current, sessionQuality: quality });
        setShowSummary(true);
    }, [stopVideo, seconds]);

    // ── Modal: Save & Exit ──
    const handleModalSaveAndExit = async () => {
        setIsSavingModal(true);
        try {
            if (selectedPatient && summary) {
                const { peakAngles: pk, avgAngles: av, finalStatus: fs, duration } = summary;
                const notes = `Session Summary — Duration: ${formatTime(duration)} | Peak: Elbow ${Math.round(pk.elbow)}°, Knee ${Math.round(pk.knee)}°, Shoulder ${Math.round(pk.shoulder)}° | Avg: Elbow ${Math.round(av.elbow)}°, Knee ${Math.round(av.knee)}°, Shoulder ${Math.round(av.shoulder)}°`;
                await _persistSession(selectedPatient.id, notes, pk, fs);
            }
        } catch (err) { console.error('Error saving session from modal:', err); }
        finally { setIsSavingModal(false); navigate('/'); }
    };

    const handleModalExit = () => { setShowSummary(false); navigate('/'); };

    // ─── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-grid-biopunk pb-8 text-slate-100 relative overflow-hidden">
            {/* Ambient glows */}
            <div style={{ position:'absolute', top:'10%', right:'-5%', width:'450px', height:'450px', borderRadius:'50%', background:'rgba(59,130,246,0.08)', filter:'blur(120px)', pointerEvents:'none' }} className="animate-glow" />
            <div style={{ position:'absolute', bottom:'10%', left:'-5%', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(6,182,212,0.07)', filter:'blur(100px)', pointerEvents:'none' }} className="animate-glow" />

            <canvas ref={canvasRef} className="hidden" />

            {/* Summary modal */}
            {showSummary && summary && (
                <SessionSummaryModal
                    summary={summary}
                    onSaveAndExit={handleModalSaveAndExit}
                    onExitWithoutSaving={handleModalExit}
                    isSaving={isSavingModal}
                />
            )}

            <div className="max-w-7xl mx-auto px-6 pt-6 animate-fade-in-up">

                {/* ── Top Status Bar ── */}
                <div className="glass-biopunk rounded-2xl px-5 py-3.5 mb-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Live badge */}
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'99px', padding:'5px 12px' }}>
                            <div className="live-dot" style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#ef4444' }} />
                            <span style={{ color:'#f87171', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em' }}>Live</span>
                        </div>
                        {/* AI status */}
                        <div style={{ display:'flex', alignItems:'center', gap:'7px', background: isConnected ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border:`1px solid ${isConnected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius:'99px', padding:'5px 12px' }}>
                            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: isConnected ? '#22c55e' : '#ef4444' }} />
                            <span style={{ color: isConnected ? '#4ade80' : '#f87171', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em' }}>AI: {isConnected ? 'Online' : 'Offline'}</span>
                        </div>
                        {/* Camera status */}
                        <div style={{ display:'flex', alignItems:'center', gap:'7px', background: isCameraReady ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)', border:`1px solid ${isCameraReady ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius:'99px', padding:'5px 12px' }}>
                            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: isCameraReady ? '#3b82f6' : '#f59e0b' }} />
                            <span style={{ color: isCameraReady ? '#60a5fa' : '#fbbf24', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em' }}>Cam: {isCameraReady ? 'Ready' : 'Init...'}</span>
                        </div>
                        {/* ── Patient Selector ── */}
                        <div style={{ display:'flex', alignItems:'center', gap:'7px', background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.25)', borderRadius:'99px', padding:'4px 10px 4px 8px' }}>
                            <User size={11} color="#a78bfa" />
                            {isPatientsLoading ? (
                                <span style={{ color:'#a78bfa', fontSize:'10px', fontWeight:900 }}>Loading…</span>
                            ) : patients.length === 0 ? (
                                <span style={{ color:'#f87171', fontSize:'10px', fontWeight:900 }}>No Patients</span>
                            ) : (
                                <select
                                    value={selectedPatientId || ''}
                                    onChange={e => setSelectedPatientId(Number(e.target.value))}
                                    style={{ background:'transparent', border:'none', color:'#a78bfa', fontSize:'10px', fontWeight:900, outline:'none', cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.08em' }}
                                >
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id} style={{ background:'#0b1426', color:'#fff' }}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        {/* Active threshold indicator */}
                        {thresholdAlerts.length > 0 && (
                            <div className="threshold-alert-pulse" style={{ display:'flex', alignItems:'center', gap:'7px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'99px', padding:'5px 12px' }}>
                                <AlertTriangle size={10} color="#f87171" />
                                <span style={{ color:'#f87171', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em' }}>{thresholdAlerts.length} Below Target</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'8px 16px' }}>
                            <Timer size={14} style={{ color:'#60a5fa' }} />
                            <span style={{ color:'#fff', fontWeight:900, fontFamily:'monospace', fontSize:'14px', letterSpacing:'0.05em' }}>{formatTime(seconds)}</span>
                        </div>
                        <button onClick={handleSaveSession} disabled={isSaving || !isConnected} className="btn-primary" style={{ padding:'9px 18px', fontSize:'11px' }}>
                            <Save size={14} /> {isSaving ? 'Saving...' : 'Archive'}
                        </button>
                        <button onClick={handleEndSession} className="btn-danger" style={{ padding:'9px 18px', fontSize:'11px' }}>
                            <Activity size={14} /> End Session
                        </button>
                    </div>
                </div>

                {/* ── Threshold Alert Banner ── */}
                {thresholdAlerts.length > 0 && (
                    <div
                        className="rounded-2xl px-5 py-3 mb-4 flex flex-wrap items-center gap-4"
                        style={{
                            background: 'rgba(239,68,68,0.07)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            borderLeft: '4px solid rgba(239,68,68,0.7)',
                        }}
                    >
                        <div className="flex items-center gap-2 threshold-alert-pulse">
                            <AlertTriangle size={16} className="text-red-400 shrink-0" />
                            <span className="text-red-400 text-xs font-black uppercase tracking-widest">ROM Alert</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {thresholdAlerts.map(({ key, icon, label, color, current, target, shortfall }) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                                >
                                    <span className="text-sm">{icon}</span>
                                    <div>
                                        <span className="text-white text-xs font-bold">{label}: </span>
                                        <span className="text-red-400 text-xs font-black font-mono">{current}°</span>
                                        <span className="text-slate-500 text-xs"> / target </span>
                                        <span className="text-amber-400 text-xs font-black font-mono">{target}°</span>
                                        <span className="text-red-400 text-[10px] font-bold ml-1">({shortfall}° short)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Inline Alerts ── */}
                {cameraError && (
                    <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'14px', padding:'14px 18px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px', color:'#f87171', fontSize:'13px' }}>
                        <AlertCircle size={16} style={{ flexShrink:0 }} /> {cameraError}
                    </div>
                )}
                {saveError && (
                    <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'14px', padding:'14px 18px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px', color:'#f87171', fontSize:'13px' }}>
                        <AlertCircle size={16} style={{ flexShrink:0 }} /> {saveError}
                    </div>
                )}
                {saveSuccess && (
                    <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'14px', padding:'14px 18px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px', color:'#4ade80', fontSize:'13px' }}>
                        <CheckCircle size={16} style={{ flexShrink:0 }} /> {saveSuccess}
                    </div>
                )}

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Camera + Joint Table */}
                    <div className="lg:col-span-2 space-y-5">
                        <SkeletonViewer videoRef={videoRef} isConnected={isConnected} annotatedFrame={annotatedFrame} />
                        <JointTable
                            thresholds={thresholds}
                            joints={[
                                { name: 'Elbow Flexion',      angle: Math.round(angles.elbow),    status: status.elbow    || 'Normal', jointKey: 'elbow'    },
                                { name: 'Knee Flexion',        angle: Math.round(angles.knee),     status: status.knee     || 'Normal', jointKey: 'knee'     },
                                { name: 'Shoulder Abduction',  angle: Math.round(angles.shoulder), status: status.shoulder || 'Normal', jointKey: 'shoulder' },
                            ]}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">

                        {/* ── ROM Target Settings Panel ── */}
                        <ThresholdPanel
                            thresholds={thresholds}
                            onUpdate={updateThreshold}
                            onReset={resetThresholds}
                        />

                        {/* ── Gauges ── */}
                        <AngleGauge angle={angles.elbow}    label="Elbow Flexion" status={status.elbow}    threshold={thresholds.elbow}    />
                        <AngleGauge angle={angles.knee}     label="Knee Flexion"  status={status.knee}     threshold={thresholds.knee}     />
                        <AngleGauge angle={angles.shoulder} label="Shoulder"      status={status.shoulder} threshold={thresholds.shoulder} />

                        {/* Guidance card */}
                        <div className="glass-biopunk rounded-2xl p-5" style={{ borderLeft:'3px solid rgba(59,130,246,0.5)' }}>
                            <p style={{ color:'#475569', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px' }}>
                                <HelpCircle size={12} style={{ color:'#60a5fa' }} /> Clinical Guidance
                            </p>
                            <p style={{ color:'#64748b', fontSize:'12px', lineHeight:1.6, fontWeight:600 }}>
                                {!isCameraReady ? '⏳ Initializing webcam feed...'
                                    : !isConnected ? '🔄 Connecting to AI backend...'
                                    : thresholdAlerts.length > 0
                                        ? `⚠️ ${thresholdAlerts.length} joint(s) below ROM target. Encourage patient to push further toward their prescribed range.`
                                        : '✅ Pipeline active. Stand 2–3 m from camera. Keep elbow, knee & shoulder visible for accurate ROM measurement.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSession;
