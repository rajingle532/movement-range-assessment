import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useWebSocket } from '../hooks/useWebSocket';
import AngleGauge from '../components/AngleGauge';
import JointTable from '../components/JointTable';
import SkeletonViewer from '../components/SkeletonViewer';
import {
    Activity, Timer, Save, AlertCircle, CheckCircle, HelpCircle,
    TrendingUp, Award, X, BarChart2, Zap, ArrowRight, Clock
} from 'lucide-react';
import { api } from '../services/api';

// ─── Session Summary Modal ───────────────────────────────────────────────────
const SessionSummaryModal = ({ summary, onSaveAndExit, onExitWithoutSaving, isSaving }) => {
    const { duration, peakAngles, avgAngles, finalStatus, sessionQuality } = summary;

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const getStatusChip = (s) => {
        const norm = (s || 'Normal').toLowerCase();
        if (norm.includes('normal'))  return { label: 'Normal',   bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  color: '#4ade80' };
        if (norm.includes('mild'))    return { label: 'Mild Restriction', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24' };
        return                               { label: 'Restricted', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171' };
    };

    const qualityColor = sessionQuality >= 80 ? '#39ff14' : sessionQuality >= 50 ? '#ffb300' : '#ef4444';
    const qualityLabel = sessionQuality >= 80 ? 'Excellent' : sessionQuality >= 50 ? 'Good' : 'Limited Data';

    const joints = [
        { key: 'elbow', label: 'Elbow Flexion', icon: '💪' },
        { key: 'knee', label: 'Knee Flexion', icon: '🦵' },
        { key: 'shoulder', label: 'Shoulder Abd.', icon: '🫁' },
    ];

    return (
        // Backdrop
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(3, 7, 18, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
                animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
            }}
        >
            {/* Modal Card */}
            <div style={{
                width: '100%', maxWidth: '620px',
                background: 'rgba(7, 13, 26, 0.97)',
                border: '1px solid rgba(0,229,255,0.2)',
                borderRadius: '24px',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,229,255,0.06)',
                overflow: 'hidden',
                animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
            }}>

                {/* ── Header ── */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(57,255,20,0.04))',
                    borderBottom: '1px solid rgba(0,229,255,0.12)',
                    padding: '24px 28px 20px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(57,255,20,0.1))',
                            border: '1px solid rgba(0,229,255,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(0,229,255,0.2)',
                        }}>
                            <Award size={22} color="#00e5ff" />
                        </div>
                        <div>
                            <h2 style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '20px', margin: 0, letterSpacing: '-0.3px' }}>
                                Session Complete
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                ROM Assessment Summary
                            </p>
                        </div>
                        {/* Session Quality Badge */}
                        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                            <div style={{
                                background: `rgba(${qualityColor === '#39ff14' ? '57,255,20' : qualityColor === '#ffb300' ? '255,179,0' : '239,68,68'},0.1)`,
                                border: `1px solid ${qualityColor}40`,
                                borderRadius: '12px', padding: '8px 14px',
                            }}>
                                <div style={{ color: qualityColor, fontSize: '22px', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>
                                    {sessionQuality}%
                                </div>
                                <div style={{ color: qualityColor, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>
                                    {qualityLabel}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Duration pill */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '99px', padding: '6px 14px', marginTop: '16px',
                    }}>
                        <Clock size={13} color="#60a5fa" />
                        <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                            {formatTime(duration)}
                        </span>
                        <span style={{ color: '#475569', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Session Duration
                        </span>
                    </div>
                </div>

                {/* ── Joint Metrics Grid ── */}
                <div style={{ padding: '20px 28px' }}>
                    <p style={{ color: '#475569', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart2 size={12} color="#00e5ff" /> Joint Measurements
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {joints.map(({ key, label, icon }) => {
                            const chip = getStatusChip(finalStatus[key]);
                            const peak = Math.round(peakAngles[key]);
                            const avg  = Math.round(avgAngles[key]);
                            return (
                                <div key={key} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '16px', padding: '14px 12px',
                                    display: 'flex', flexDirection: 'column', gap: '10px',
                                    transition: 'border-color 0.2s',
                                }}>
                                    {/* Joint label */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '16px' }}>{icon}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.2 }}>{label}</span>
                                    </div>

                                    {/* Peak angle */}
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Peak</div>
                                        <div style={{ color: '#00e5ff', fontSize: '28px', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>
                                            {peak}<span style={{ fontSize: '14px', color: '#475569' }}>°</span>
                                        </div>
                                    </div>

                                    {/* Avg angle */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Avg</div>
                                            <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>
                                                {avg}°
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status chip */}
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        background: chip.bg, border: `1px solid ${chip.border}`,
                                        borderRadius: '99px', padding: '3px 8px',
                                        color: chip.color, fontSize: '9px', fontWeight: 800,
                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                    }}>
                                        {chip.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── ROM Progress Bars ── */}
                <div style={{ padding: '0 28px 20px' }}>
                    <p style={{ color: '#475569', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={12} color="#39ff14" /> Range Achieved vs. Normal (180°)
                    </p>
                    {[
                        { key: 'elbow', label: 'Elbow', color: '#00e5ff' },
                        { key: 'knee', label: 'Knee', color: '#39ff14' },
                        { key: 'shoulder', label: 'Shoulder', color: '#ffb300' },
                    ].map(({ key, label, color }) => {
                        const pct = Math.min(100, Math.round((peakAngles[key] / 180) * 100));
                        return (
                            <div key={key} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700 }}>{label}</span>
                                    <span style={{ color, fontSize: '11px', fontWeight: 800, fontFamily: 'monospace' }}>{pct}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{
                                        height: '100%', width: `${pct}%`,
                                        background: `linear-gradient(90deg, ${color}80, ${color})`,
                                        borderRadius: '99px',
                                        boxShadow: `0 0 8px ${color}60`,
                                        transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Actions ── */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    padding: '16px 28px',
                    display: 'flex', gap: '10px', justifyContent: 'flex-end',
                    background: 'rgba(0,0,0,0.2)',
                }}>
                    <button
                        onClick={onExitWithoutSaving}
                        style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#64748b', borderRadius: '12px', padding: '10px 20px',
                            fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                            cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = 'rgba(239,68,68,0.4)'; e.target.style.color = '#f87171'; }}
                        onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = '#64748b'; }}
                    >
                        <X size={13} /> Exit Without Saving
                    </button>
                    <button
                        onClick={onSaveAndExit}
                        disabled={isSaving}
                        style={{
                            background: isSaving ? 'rgba(0,229,255,0.3)' : 'linear-gradient(135deg, #00e5ff, #39ff14)',
                            color: '#000', border: 'none', borderRadius: '12px', padding: '10px 24px',
                            fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: isSaving ? 'none' : '0 4px 20px rgba(0,229,255,0.3)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {isSaving ? (
                            <>
                                <div style={{ width: '13px', height: '13px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={13} /> Save & Go to Dashboard
                                <ArrowRight size={13} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// ─── Main LiveSession Component ──────────────────────────────────────────────
const LiveSession = () => {
    const { videoRef, startVideo, stopVideo, error: cameraError, isCameraReady } = useCamera();
    const { isConnected, angles, status, annotatedFrame, sendFrame } = useWebSocket('ws://localhost:8000/ws/stream');
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    // Timer state
    const [seconds, setSeconds] = useState(0);

    // Save states (used by the top Archive button)
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');

    // ── Session tracking refs (no re-render cost during streaming) ──
    const peakAnglesRef = useRef({ elbow: 0, knee: 0, shoulder: 0 });
    const sumAnglesRef  = useRef({ elbow: 0, knee: 0, shoulder: 0 });
    const frameCountRef = useRef(0);
    const finalStatusRef = useRef({});

    // ── Summary modal state ──
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState(null);
    const [isSavingModal, setIsSavingModal] = useState(false);

    // ── Update tracking refs on every new angle frame ──
    useEffect(() => {
        if (!isConnected) return;
        const { elbow = 0, knee = 0, shoulder = 0 } = angles;
        if (elbow === 0 && knee === 0 && shoulder === 0) return; // skip zero frames

        // Update peaks
        peakAnglesRef.current = {
            elbow:    Math.max(peakAnglesRef.current.elbow, elbow),
            knee:     Math.max(peakAnglesRef.current.knee, knee),
            shoulder: Math.max(peakAnglesRef.current.shoulder, shoulder),
        };
        // Accumulate for average
        sumAnglesRef.current = {
            elbow:    sumAnglesRef.current.elbow + elbow,
            knee:     sumAnglesRef.current.knee + knee,
            shoulder: sumAnglesRef.current.shoulder + shoulder,
        };
        frameCountRef.current += 1;
        finalStatusRef.current = status;
    }, [angles, isConnected, status]);

    // Stop camera on unmount
    useEffect(() => {
        startVideo();
        return () => { stopVideo(); };
    }, [startVideo, stopVideo]);

    // Active session duration timer
    useEffect(() => {
        let timer;
        if (isCameraReady && isConnected) {
            timer = setInterval(() => setSeconds(prev => prev + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(timer);
    }, [isCameraReady, isConnected]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    // Frame Capture Loop
    useEffect(() => {
        let interval;
        if (isCameraReady && isConnected) {
            interval = setInterval(() => {
                if (videoRef.current && canvasRef.current) {
                    const canvas = canvasRef.current;
                    const video  = videoRef.current;
                    const ctx    = canvas.getContext('2d');
                    canvas.width = 640;
                    canvas.height = 480;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    sendFrame(canvas.toDataURL('image/jpeg', 0.6));
                }
            }, 100); // 10 FPS
        }
        return () => clearInterval(interval);
    }, [isCameraReady, isConnected, sendFrame, videoRef]);

    // ── Archive (top bar button) — unchanged functionality ──
    const handleSaveSession = async () => {
        setSaveError('');
        setSaveSuccess('');
        setIsSaving(true);
        try {
            const patients = await api.getPatients();
            if (patients.length === 0) {
                setSaveError('Please register a patient first in the Registry.');
                setIsSaving(false);
                return;
            }
            const activePatient = patients[0];
            await api.createSession({
                patient_id: activePatient.id,
                notes: `Live ROM session saved. Elbow: ${Math.round(angles.elbow)}°, Knee: ${Math.round(angles.knee)}°, Shoulder: ${Math.round(angles.shoulder)}°`
            });
            setSaveSuccess(`Session successfully archived under: ${activePatient.name}`);
            setTimeout(() => setSaveSuccess(''), 4000);
        } catch (err) {
            setSaveError('Failed to archive session to the clinical server.');
        } finally {
            setIsSaving(false);
        }
    };

    // ── End Session → build summary → show modal ──
    const handleEndSession = useCallback(() => {
        stopVideo(); // stop camera immediately

        const frames = frameCountRef.current;
        const peaks  = peakAnglesRef.current;
        const sums   = sumAnglesRef.current;

        const avgAngles = frames > 0
            ? {
                elbow:    sums.elbow    / frames,
                knee:     sums.knee     / frames,
                shoulder: sums.shoulder / frames,
            }
            : { elbow: 0, knee: 0, shoulder: 0 };

        // Session quality: % of frames where all joints were non-zero vs session duration at 10fps
        const expectedFrames = Math.max(1, seconds * 10);
        const quality = Math.min(100, Math.round((frames / expectedFrames) * 100));

        setSummary({
            duration:     seconds,
            peakAngles:   peaks,
            avgAngles,
            finalStatus:  finalStatusRef.current,
            sessionQuality: quality,
        });
        setShowSummary(true);
    }, [stopVideo, seconds]);

    // ── Modal: Save & Exit ──
    const handleModalSaveAndExit = async () => {
        setIsSavingModal(true);
        try {
            const patients = await api.getPatients();
            if (patients.length > 0) {
                const activePatient = patients[0];
                const { peakAngles, avgAngles } = summary;
                await api.createSession({
                    patient_id: activePatient.id,
                    notes: `Session Summary — Duration: ${formatTime(summary.duration)} | Peak: Elbow ${Math.round(peakAngles.elbow)}°, Knee ${Math.round(peakAngles.knee)}°, Shoulder ${Math.round(peakAngles.shoulder)}° | Avg: Elbow ${Math.round(avgAngles.elbow)}°, Knee ${Math.round(avgAngles.knee)}°, Shoulder ${Math.round(avgAngles.shoulder)}°`
                });
            }
        } catch (err) {
            console.error('Error saving session from modal:', err);
        } finally {
            setIsSavingModal(false);
            navigate('/');
        }
    };

    // ── Modal: Exit Without Saving ──
    const handleModalExit = () => {
        setShowSummary(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-grid-biopunk pb-8 text-slate-100 relative overflow-hidden">
            {/* Glows */}
            <div style={{ position:'absolute', top:'10%', right:'-5%', width:'450px', height:'450px', borderRadius:'50%', background:'rgba(59,130,246,0.08)', filter:'blur(120px)', pointerEvents:'none' }} className="animate-glow" />
            <div style={{ position:'absolute', bottom:'10%', left:'-5%', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(6,182,212,0.07)', filter:'blur(100px)', pointerEvents:'none' }} className="animate-glow" />

            <canvas ref={canvasRef} className="hidden" />

            {/* ── Session Summary Modal ── */}
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
                <div className="glass-biopunk rounded-2xl px-5 py-3.5 mb-6 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        {/* Live Badge */}
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'99px', padding:'5px 12px' }}>
                            <div className="live-dot" style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#ef4444' }} />
                            <span style={{ color:'#f87171', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em' }}>Live</span>
                        </div>

                        {/* AI Status */}
                        <div style={{ display:'flex', alignItems:'center', gap:'7px', background: isConnected ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border:`1px solid ${isConnected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius:'99px', padding:'5px 12px' }}>
                            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: isConnected ? '#22c55e' : '#ef4444' }} />
                            <span style={{ color: isConnected ? '#4ade80' : '#f87171', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em' }}>AI: {isConnected ? 'Online' : 'Offline'}</span>
                        </div>

                        {/* Camera Status */}
                        <div style={{ display:'flex', alignItems:'center', gap:'7px', background: isCameraReady ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)', border:`1px solid ${isCameraReady ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius:'99px', padding:'5px 12px' }}>
                            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background: isCameraReady ? '#3b82f6' : '#f59e0b' }} />
                            <span style={{ color: isCameraReady ? '#60a5fa' : '#fbbf24', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em' }}>Cam: {isCameraReady ? 'Ready' : 'Init...'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Timer */}
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'8px 16px' }}>
                            <Timer size={14} style={{ color:'#60a5fa' }} />
                            <span style={{ color:'#fff', fontWeight:900, fontFamily:'monospace', fontSize:'14px', letterSpacing:'0.05em' }}>{formatTime(seconds)}</span>
                        </div>
                        {/* Archive */}
                        <button onClick={handleSaveSession} disabled={isSaving || !isConnected} className="btn-primary" style={{ padding:'9px 18px', fontSize:'11px' }}>
                            <Save size={14} />
                            {isSaving ? 'Saving...' : 'Archive'}
                        </button>
                        {/* End Session — now shows summary modal */}
                        <button onClick={handleEndSession} className="btn-danger" style={{ padding:'9px 18px', fontSize:'11px' }}>
                            <Activity size={14} /> End Session
                        </button>
                    </div>
                </div>

                {/* ── Alerts ── */}
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
                        <JointTable joints={[
                            { name: 'Elbow Flexion',      angle: Math.round(angles.elbow),    status: status.elbow    || 'Normal' },
                            { name: 'Knee Flexion',        angle: Math.round(angles.knee),     status: status.knee     || 'Normal' },
                            { name: 'Shoulder Abduction',  angle: Math.round(angles.shoulder), status: status.shoulder || 'Normal' },
                        ]} />
                    </div>

                    {/* Sidebar: Gauges + Guidance */}
                    <div className="space-y-5">
                        <AngleGauge angle={angles.elbow}    label="Elbow Flexion" status={status.elbow} />
                        <AngleGauge angle={angles.knee}     label="Knee Flexion"  status={status.knee} />
                        <AngleGauge angle={angles.shoulder} label="Shoulder"      status={status.shoulder} />

                        {/* Guidance Card */}
                        <div className="glass-biopunk rounded-2xl p-5" style={{ borderLeft:'3px solid rgba(59,130,246,0.5)' }}>
                            <p style={{ color:'#475569', fontSize:'10px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px' }}>
                                <HelpCircle size={12} style={{ color:'#60a5fa' }} /> Clinical Guidance
                            </p>
                            <p style={{ color:'#64748b', fontSize:'12px', lineHeight:1.6, fontWeight:600 }}>
                                {!isCameraReady ? '⏳ Initializing webcam feed...'
                                    : !isConnected ? '🔄 Connecting to AI backend...'
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
