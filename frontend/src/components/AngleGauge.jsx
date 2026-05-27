import React from 'react';
import { Target } from 'lucide-react';

// ── SVG math: place a dot at `fraction` of the circle arc
// The SVG has `transform -rotate-90` applied via CSS, so:
//   SVG 0° (right) = visual 12 o'clock  →  theta = fraction * 2π
const getMarkerCoords = (fraction, r = 60, cx = 72, cy = 72) => {
    const theta = fraction * 2 * Math.PI;
    return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
};

const AngleGauge = ({ angle, label, status = 'Normal', threshold = 0 }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min((angle / 180) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;

    // Only apply threshold logic when angle > 5° (pose detected)
    const hasThreshold   = threshold > 0;
    const poseDetected   = angle > 5;
    const isBelowTarget  = hasThreshold && poseDetected && angle < threshold;
    const isNearTarget   = hasThreshold && poseDetected && angle >= threshold - 15 && angle < threshold;
    const isTargetMet    = hasThreshold && poseDetected && angle >= threshold;

    // Threshold marker position on the circle
    const markerFraction = Math.min(threshold / 180, 1);
    const markerPos      = getMarkerCoords(markerFraction);

    // Gauge fill color
    const getColor = () => {
        if (hasThreshold && poseDetected) {
            if (isTargetMet)  return '#10B981'; // emerald — met
            if (isNearTarget) return '#F59E0B'; // amber   — close
            return '#EF4444';                   // red     — below
        }
        // Fallback: status-based
        if (!status) return '#10B981';
        const n = status.toLowerCase();
        if (n.includes('normal')) return '#10B981';
        if (n.includes('mild'))   return '#F59E0B';
        return '#EF4444';
    };

    // Status pill classes
    const getPillClass = () => {
        if (hasThreshold && poseDetected) {
            if (isTargetMet)  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            if (isNearTarget) return 'bg-amber-500/10  text-amber-400  border-amber-500/20';
            return                   'bg-red-500/10    text-red-400    border-red-500/20';
        }
        if (!status) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        const n = status.toLowerCase();
        if (n.includes('normal')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (n.includes('mild'))   return 'bg-amber-500/10  text-amber-400  border-amber-500/20';
        return                           'bg-red-500/10    text-red-400    border-red-500/20';
    };

    const gaugeColor     = getColor();
    const markerColor    = isBelowTarget ? '#EF4444' : '#F59E0B';
    const cardBorderClass = isBelowTarget
        ? 'border-red-500/50'
        : isNearTarget
        ? 'border-amber-500/35'
        : 'border-slate-800';
    const cardGlow = isBelowTarget
        ? '0 0 0 1px rgba(239,68,68,0.1) inset, 0 0 24px rgba(239,68,68,0.12)'
        : 'none';

    // Pill label
    const pillLabel = () => {
        if (!hasThreshold || !poseDetected) return status || 'Normal';
        if (isTargetMet)  return `Target Met ✓`;
        if (isNearTarget) return `${threshold - Math.round(angle)}° to target`;
        return `${threshold - Math.round(angle)}° below target`;
    };

    return (
        <div
            className={`bg-slate-900/60 backdrop-blur border ${cardBorderClass} p-6 rounded-2xl shadow-xl shadow-black/10 flex flex-col items-center transition-all duration-500`}
            style={{ boxShadow: cardGlow }}
        >
            {/* ── Circular Gauge ── */}
            <div className="relative w-36 h-36">
                <svg
                    className="w-full h-full transform -rotate-90"
                    style={{ overflow: 'visible' }}
                    viewBox="0 0 144 144"
                >
                    {/* Background track */}
                    <circle
                        cx="72" cy="72" r={radius}
                        stroke="#1E293B" strokeWidth="10" fill="transparent"
                    />

                    {/* Filled arc */}
                    <circle
                        cx="72" cy="72" r={radius}
                        stroke={gaugeColor}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{
                            strokeDashoffset: offset,
                            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease',
                            filter: `drop-shadow(0 0 5px ${gaugeColor}80)`,
                        }}
                        strokeLinecap="round"
                    />

                    {/* ── Threshold Marker ── */}
                    {hasThreshold && (
                        <>
                            {/* Outer ring */}
                            <circle
                                cx={markerPos.x}
                                cy={markerPos.y}
                                r="7"
                                fill="#070d1a"
                                stroke={markerColor}
                                strokeWidth="2.5"
                                style={{
                                    filter: `drop-shadow(0 0 5px ${markerColor}90)`,
                                    transition: 'stroke 0.3s ease',
                                }}
                            />
                            {/* Inner filled dot */}
                            <circle
                                cx={markerPos.x}
                                cy={markerPos.y}
                                r="3"
                                fill={markerColor}
                                style={{ transition: 'fill 0.3s ease' }}
                            />
                        </>
                    )}
                </svg>

                {/* ── Center Labels ── */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                        className="text-3xl font-black text-white"
                        style={{ transition: 'color 0.3s' }}
                    >
                        {Math.round(angle)}°
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        {label}
                    </span>
                    {/* Target badge inside gauge */}
                    {hasThreshold && (
                        <span
                            className="flex items-center gap-0.5 mt-1.5 text-[9px] font-bold uppercase tracking-widest"
                            style={{ color: isBelowTarget ? '#f87171' : '#64748b' }}
                        >
                            <Target size={8} className="inline" />
                            {threshold}°
                        </span>
                    )}
                </div>
            </div>

            {/* ── Status Pill ── */}
            <div className={`mt-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-wider text-center leading-none ${getPillClass()}`}>
                {pillLabel()}
            </div>
        </div>
    );
};

export default AngleGauge;
