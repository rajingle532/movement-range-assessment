import React from 'react';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';

// jointKey must be one of: 'elbow' | 'knee' | 'shoulder'
const JointTable = ({ joints, thresholds = {} }) => {
    const defaultJoints = [
        { name: 'Elbow Flexion',     angle: 0, status: 'Normal', jointKey: 'elbow'    },
        { name: 'Knee Flexion',      angle: 0, status: 'Normal', jointKey: 'knee'     },
        { name: 'Shoulder Abduction',angle: 0, status: 'Normal', jointKey: 'shoulder' },
    ];
    const displayJoints = joints && joints.length > 0 ? joints : defaultJoints;

    // Status chip colours — threshold overrides status when applicable
    const getStatusStyles = (status, angle, threshold) => {
        const poseDetected = angle > 5;
        if (threshold > 0 && poseDetected && angle < threshold)
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (!status) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        const n = status.toLowerCase();
        if (n.includes('normal')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (n.includes('mild'))   return 'bg-amber-500/10  text-amber-400  border-amber-500/20';
        return                           'bg-red-500/10    text-red-400    border-red-500/20';
    };

    // Angle number colour when threshold-aware
    const getAngleColor = (angle, threshold) => {
        if (threshold > 0 && angle > 5) {
            if (angle < threshold)      return '#f87171'; // red
            if (angle < threshold + 15) return '#fbbf24'; // amber
            return '#4ade80';                              // green
        }
        return '#60a5fa'; // default blue
    };

    // Status chip label
    const getStatusLabel = (status, angle, threshold) => {
        const poseDetected = angle > 5;
        if (threshold > 0 && poseDetected && angle < threshold)
            return `${threshold - Math.round(angle)}° below target`;
        return status || 'Normal';
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
                <thead className="bg-slate-950/40 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                    <tr>
                        <th className="px-5 py-4">Joint Under Test</th>
                        <th className="px-5 py-4 text-center">ROM</th>
                        <th className="px-5 py-4 text-center">Target</th>
                        <th className="px-5 py-4 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                    {displayJoints.map((joint, idx) => {
                        const jointKey  = joint.jointKey || ['elbow', 'knee', 'shoulder'][idx] || 'elbow';
                        const threshold = thresholds[jointKey] || 0;
                        const diff      = threshold > 0 ? Math.round(joint.angle) - threshold : null;
                        const rowAlert  = threshold > 0 && joint.angle > 5 && joint.angle < threshold;

                        return (
                            <tr
                                key={idx}
                                className="transition-colors hover:bg-slate-800/30"
                                style={{ background: rowAlert ? 'rgba(239,68,68,0.04)' : undefined }}
                            >
                                {/* Joint name */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        {rowAlert && (
                                            <span
                                                className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"
                                                style={{ boxShadow: '0 0 6px #ef4444' }}
                                            />
                                        )}
                                        <span className="text-white font-extrabold text-xs">{joint.name}</span>
                                    </div>
                                </td>

                                {/* Current angle */}
                                <td className="px-5 py-4 text-center">
                                    <span
                                        className="font-black text-lg"
                                        style={{
                                            color: getAngleColor(joint.angle, threshold),
                                            transition: 'color 0.4s ease',
                                        }}
                                    >
                                        {Math.round(joint.angle)}°
                                    </span>
                                </td>

                                {/* Target threshold */}
                                <td className="px-5 py-4 text-center">
                                    {threshold > 0 ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-slate-300 font-bold text-sm flex items-center gap-1">
                                                <Target size={10} className="text-amber-400 shrink-0" />
                                                {threshold}°
                                            </span>
                                            {diff !== null && joint.angle > 5 && (
                                                <span
                                                    className="text-[9px] font-bold flex items-center gap-0.5"
                                                    style={{ color: diff >= 0 ? '#4ade80' : '#f87171' }}
                                                >
                                                    {diff >= 0
                                                        ? <TrendingUp size={9} />
                                                        : <TrendingDown size={9} />
                                                    }
                                                    {diff >= 0 ? `+${diff}°` : `${diff}°`}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-700 text-xs font-bold">—</span>
                                    )}
                                </td>

                                {/* Status chip */}
                                <td className="px-5 py-4 text-right">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                                            getStatusStyles(joint.status, joint.angle, threshold)
                                        }`}
                                    >
                                        {getStatusLabel(joint.status, joint.angle, threshold)}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default JointTable;
