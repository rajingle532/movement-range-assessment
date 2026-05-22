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

    useEffect(() => {
        startVideo();
        return () => stopVideo();
    }, [startVideo, stopVideo]);

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
        <div className="min-h-screen bg-slate-950 p-6 text-slate-100 font-sans relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[130px] pointer-events-none" />
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="max-w-7xl mx-auto">
                {/* Status Bar */}
                <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-4.5 rounded-2xl shadow-xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* WebSocket Status */}
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-[9px] tracking-wider uppercase border transition-all ${
                            isConnected 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                            AI Stream: {isConnected ? 'Online' : 'Offline'}
                        </div>

                        {/* Camera Status */}
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-[9px] tracking-wider uppercase border transition-all ${
                            isCameraReady 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                            {isCameraReady ? <CheckCircle size={11} /> : <Activity size={11} className="animate-spin text-amber-400" />}
                            Hdw Camera: {isCameraReady ? 'Connected' : 'Acquiring...'}
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="text-slate-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl">
                            <Timer size={14} className="text-blue-400 animate-pulse" /> 
                            Session: <span className="text-white font-mono">{formatTime(seconds)}</span>
                        </div>
                        <button 
                            onClick={handleSaveSession}
                            disabled={isSaving || !isConnected}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-5.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-blue-600/10 disabled:opacity-50 cursor-pointer"
                        >
                            {isSaving ? "Archiving..." : "Archive Results"}
                        </button>
                        <button 
                            onClick={() => {
                                stopVideo();
                                navigate('/dashboard');
                            }}
                            className="bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-slate-400 px-5.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                        >
                            End Session
                        </button>
                    </div>
                </div>

                {cameraError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4.5 rounded-xl mb-6 flex items-center gap-3 text-xs font-semibold">
                        <AlertCircle size={18} className="text-red-500 shrink-0" />
                        <span>{cameraError}</span>
                    </div>
                )}

                {saveError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4.5 rounded-xl mb-6 flex items-center gap-3 text-xs font-semibold">
                        <AlertCircle size={18} className="text-red-500 shrink-0" />
                        <span>{saveError}</span>
                    </div>
                )}

                {saveSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4.5 rounded-xl mb-6 flex items-center gap-3 text-xs font-semibold">
                        <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                        <span>{saveSuccess}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Camera Feed Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <SkeletonViewer videoRef={videoRef} isConnected={isConnected} annotatedFrame={annotatedFrame} />
                        
                        <JointTable joints={[
                            { name: 'Elbow Joint Flexion', angle: Math.round(angles.elbow), status: status.elbow || 'Normal' },
                            { name: 'Knee Joint Flexion', angle: Math.round(angles.knee), status: status.knee || 'Normal' },
                            { name: 'Shoulder Joint Abduction', angle: Math.round(angles.shoulder), status: status.shoulder || 'Normal' },
                        ]} />
                    </div>

                    {/* Right Analytics Sidebar */}
                    <div className="space-y-6">
                        <AngleGauge angle={angles.elbow} label="Elbow Flexion" status={status.elbow} />
                        <AngleGauge angle={angles.knee} label="Knee Flexion" status={status.knee} />
                        
                        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl shadow-black/10 border-l-4 border-l-blue-500">
                            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-3 flex items-center gap-1.5">
                                <HelpCircle size={12} className="text-blue-400" />
                                Clinical Guidance
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                                {!isCameraReady ? "Waiting for webcam feed to initialize..." : 
                                 !isConnected ? "Verifying stream connection to the computer vision backend..." : 
                                 "Biomechanics pipeline active. Stand 2-3 meters away. Ensure elbow, knee, and shoulder joints are completely visible to calibrate angles."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSession;
