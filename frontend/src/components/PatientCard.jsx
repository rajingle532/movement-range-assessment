import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, FileText, Play } from 'lucide-react';

const PatientCard = ({ patient, index = 0 }) => {
    const navigate = useNavigate();

    const handleDownloadPDF = (e) => {
        e.stopPropagation();
        window.open(`http://localhost:8000/api/reports/${patient.id}`, '_blank');
    };

    // Calculate a dummy ROM progress based on id or name length just for presentation
    const romProgress = Math.min(100, 40 + (patient.name.length * 5));

    return (
        <div
            className={`glass-biopunk rounded-xl p-4 transition-all duration-300 group hover:border-[#00e5ff]/40 hover:-translate-y-1 stagger-${(index % 5) + 1} animate-fade-in-up shrink-0`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0b1426] to-[#070d1a] border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.1)] shrink-0">
                        <User size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-[#e2e8f0] font-bold text-sm tracking-wide truncate">{patient.name}</h4>
                        <div className="inline-block mt-1 bg-[#ffb300]/10 border border-[#ffb300]/20 text-[#ffb300] text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider truncate max-w-[150px] sm:max-w-[200px]">
                            {patient.condition || 'General Rehab'}
                        </div>
                    </div>
                </div>
                <div className="bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_5px_rgba(57,255,20,0.2)] flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-glow" /> Active
                </div>
            </div>

            {/* ROM Progress */}
            <div className="mb-3">
                <div className="flex justify-between items-end mb-1.5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">ROM Target</span>
                    <span className="font-mono-data text-[#00e5ff] font-bold text-xs">{romProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#070d1a] rounded-full overflow-hidden border border-[#00e5ff]/10">
                    <div 
                        className="h-full bg-gradient-to-r from-[#00e5ff] to-[#39ff14] relative"
                        style={{ width: `${romProgress}%` }}
                    >
                        <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Default State: Date */}
            <div className="flex items-center justify-between mt-4 border-t border-[#00e5ff]/10 pt-3 group-hover:hidden">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Last Session</span>
                <span className="font-mono-data text-slate-300 text-[11px]">Oct 24, 2026</span>
            </div>

            {/* Hover State: Quick Actions */}
            <div className="hidden group-hover:flex items-center justify-between mt-4 border-t border-[#00e5ff]/20 pt-3 animate-fade-in">
                <button onClick={() => navigate('/live')} className="text-[#00e5ff] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                    <Play size={12} className="fill-[#00e5ff]" /> Session
                </button>
                <button onClick={handleDownloadPDF} className="text-[#39ff14] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                    <FileText size={12} /> Report
                </button>
                <button className="text-slate-400 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:text-[#ffb300] transition-colors">
                    <Activity size={12} /> Notes
                </button>
            </div>
        </div>
    );
};

export default PatientCard;
