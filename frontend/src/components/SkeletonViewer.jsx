import React from 'react';
import { Camera, Zap, RefreshCw } from 'lucide-react';

const SkeletonViewer = ({ videoRef, isConnected, annotatedFrame }) => {
    return (
        <div className="bg-slate-900/60 backdrop-blur-md p-2.5 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
            {/* Top Status Badge */}
            <div className="absolute top-5 left-5 z-20">
                <div className="bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-slate-800 shadow-lg text-slate-300">
                    <Camera size={13} className="text-blue-400 animate-pulse" /> 
                    {isConnected ? 'Biomechanical AI Stream Active' : 'Connecting to CV Engine...'}
                </div>
            </div>

            {/* Live Counter Overlay */}
            {isConnected && (
                <div className="absolute top-5 right-5 z-20">
                    <div className="bg-emerald-500/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-black text-white uppercase flex items-center gap-2 shadow-lg shadow-emerald-500/10">
                        <Zap size={13} className="animate-bounce" fill="white" /> LIVE TELEMETRY
                    </div>
                </div>
            )}

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/50 shadow-inner">
                {/* Standard Video Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isConnected && annotatedFrame ? 'opacity-0 absolute pointer-events-none' : 'opacity-100 block'}`}
                />

                {/* Annotated Frame from AI (The Skeleton Overlay) */}
                {isConnected && annotatedFrame && (
                    <img 
                        src={annotatedFrame} 
                        alt="AI Skeleton Overlay" 
                        className="w-full h-full object-cover transition-opacity duration-300 block"
                    />
                )}

                {/* Loading State Overlay */}
                {!isConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md transition-all">
                        <div className="relative mb-5 flex items-center justify-center">
                            <div className="w-14 h-14 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                            <Camera className="absolute text-blue-400 w-5 h-5 animate-pulse" />
                        </div>
                        <p className="text-white text-xs font-black uppercase tracking-widest">Initializing Vision Pipeline</p>
                        <p className="text-slate-500 text-[10px] font-bold mt-1.5 uppercase tracking-wider">Loading landmarks & model weights...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkeletonViewer;
