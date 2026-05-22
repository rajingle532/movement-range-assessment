import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useWebSocket } from '../hooks/useWebSocket';
import AngleGauge from '../components/AngleGauge';
import JointTable from '../components/JointTable';
import SkeletonViewer from '../components/SkeletonViewer';
import { Activity, Timer, Save, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

const LiveSession = () => {
    const { videoRef, startVideo, stopVideo, error: cameraError, isCameraReady } = useCamera();
    const { isConnected, angles, status, annotatedFrame, sendFrame } = useWebSocket('ws://localhost:8000/ws/stream');
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    
    // Timer state
    const [seconds, setSeconds] = useState(0);

    // Save states
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');

    // ✅ FIX: Stop camera on mount-cleanup AND on every page navigation
    useEffect(() => {
        startVideo();
        return () => {
            // Force kill ALL media tracks so camera light turns off
            stopVideo();
            if (navigator.mediaDevices) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => stream.getTracks().forEach(track => track.stop()))
                    .catch(() => {}); // ignore if no stream
            }
        };
    }, []); // empty deps — run only on mount/unmount

    // Active session duration timer
    useEffect(() => {
        let timer;
        if (isCameraReady && isConnected) {
            timer = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
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
                    const video = videoRef.current;
                    const context = canvas.getContext('2d');
                    
                    // Capture at 640x480
                    canvas.width = 640;
                    canvas.height = 480;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    const base64Frame = canvas.toDataURL('image/jpeg', 0.6);
                    sendFrame(base64Frame);
                }
            }, 100); // 10 FPS
        }
        return () => clearInterval(interval);
    }, [isCameraReady, isConnected, sendFrame, videoRef]);

    const handleSaveSession = async () => {
        setSaveError('');
        setSaveSuccess('');
        setIsSaving(true);
        
        try {
            // Find a patient in our DB to assign this session to
            const patients = await api.getPatients();
            if (patients.length === 0) {
                setSaveError('Please register a patient first in the Registry.');
                setIsSaving(false);
                return;
            }

            const activePatient = patients[0]; // Save to the first active patient for demo
            
            // Create session in the database
            const session = await api.createSession({
                patient_id: activePatient.id,
                notes: `Live ROM session saved. Elbow: ${Math.round(angles.elbow)}°, Knee: ${Math.round(angles.knee)}°, Shoulder: ${Math.round(angles.shoulder)}°`
            });

            setSaveSuccess(`Session successfully archived under: ${activePatient.name}`);
            
            // Auto hide success banner after 4 seconds
            setTimeout(() => setSaveSuccess(''), 4000);
        } catch (err) {
            console.error("Error saving live session:", err);
            setSaveError('Failed to archive session to the clinical server.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-grid pb-8 text-slate-100 relative overflow-hidden">
            {/* Glows */}
            <div style={{ position:'absolute', top:'10%', right:'-5%', width:'450px', height:'450px', borderRadius:'50%', background:'rgba(59,130,246,0.08)', filter:'blur(120px)', pointerEvents:'none' }} className="animate-glow" />
            <div style={{ position:'absolute', bottom:'10%', left:'-5%', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(6,182,212,0.07)', filter:'blur(100px)', pointerEvents:'none' }} className="animate-glow" />

            <canvas ref={canvasRef} className="hidden" />

            <div className="max-w-7xl mx-auto px-6 pt-6 animate-fade-in-up">

                {/* ── Top Status Bar ── */}
                <div className="glass rounded-2xl px-5 py-3.5 mb-6 flex flex-wrap justify-between items-center gap-4">
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
                        {/* End Session */}
                        <button onClick={() => { stopVideo(); navigate('/'); }} className="btn-danger" style={{ padding:'9px 18px', fontSize:'11px' }}>
                            End Session
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
                            { name: 'Elbow Flexion', angle: Math.round(angles.elbow), status: status.elbow || 'Normal' },
                            { name: 'Knee Flexion', angle: Math.round(angles.knee), status: status.knee || 'Normal' },
                            { name: 'Shoulder Abduction', angle: Math.round(angles.shoulder), status: status.shoulder || 'Normal' },
                        ]} />
                    </div>

                    {/* Sidebar: Gauges + Guidance */}
                    <div className="space-y-5">
                        <AngleGauge angle={angles.elbow} label="Elbow Flexion" status={status.elbow} />
                        <AngleGauge angle={angles.knee} label="Knee Flexion" status={status.knee} />
                        <AngleGauge angle={angles.shoulder} label="Shoulder" status={status.shoulder} />

                        {/* Guidance Card */}
                        <div className="glass rounded-2xl p-5" style={{ borderLeft:'3px solid rgba(59,130,246,0.5)' }}>
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

