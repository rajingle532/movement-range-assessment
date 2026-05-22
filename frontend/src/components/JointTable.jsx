import React from 'react';

const JointTable = ({ joints }) => {
    const displayJoints = joints && joints.length > 0 ? joints : [
        { name: 'Left Elbow Flexion', angle: 0, status: 'Normal' },
        { name: 'Left Knee Flexion', angle: 0, status: 'Normal' },
        { name: 'Left Shoulder Abduction', angle: 0, status: 'Normal' },
    ];

    const getStatusStyles = (status) => {
        if (!status) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        
        const norm = status.toLowerCase();
        if (norm.includes('normal')) {
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        }
        if (norm.includes('mild')) {
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
                <thead className="bg-slate-950/40 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                    <tr>
                        <th className="px-6 py-4">Joint Under Test</th>
                        <th className="px-6 py-4 text-center">Calculated ROM</th>
                        <th className="px-6 py-4 text-right">Mobility Diagnostic</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                    {displayJoints.map((joint, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 text-white font-extrabold text-xs">{joint.name}</td>
                            <td className="px-6 py-4 text-blue-400 font-black text-center text-lg">{joint.angle}°</td>
                            <td className="px-6 py-4 text-right">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${getStatusStyles(joint.status)}`}>
                                    {joint.status || 'Normal'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JointTable;
