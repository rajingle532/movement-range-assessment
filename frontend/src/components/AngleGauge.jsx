import React from 'react';

const AngleGauge = ({ angle, label, status = 'Normal' }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min((angle / 180) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (!status) return '#10B981'; // Green
        const norm = status.toLowerCase();
        if (norm.includes('normal')) return '#10B981'; // Green
        if (norm.includes('mild')) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    const getBgPill = () => {
        if (!status) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        const norm = status.toLowerCase();
        if (norm.includes('normal')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (norm.includes('mild')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl shadow-black/10 flex flex-col items-center hover:border-slate-800 transition-all">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        stroke="#1E293B"
                        strokeWidth="10"
                        fill="transparent"
                    />
                    <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        stroke={getColor()}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{ 
                            strokeDashoffset: offset,
                            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{Math.round(angle)}°</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{label}</span>
                </div>
            </div>
            <div className={`mt-4 px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${getBgPill()}`}>
                {status || 'Normal'}
            </div>
        </div>
    );
};

export default AngleGauge;
