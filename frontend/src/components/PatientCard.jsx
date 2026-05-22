import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, FileText, ChevronRight } from 'lucide-react';

const PatientCard = ({ patient }) => {
    const navigate = useNavigate();

    const handleDownloadPDF = (e) => {
        e.stopPropagation();
        window.open(`http://localhost:8000/api/reports/${patient.id}`, '_blank');
    };

    return (
        <div
            onClick={() => navigate('/live')}
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
            }}
            className="hover:bg-white/5 hover:border-blue-500/20 group"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(6,182,212,0.15))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0 }}>
                    <User size={16} />
                </div>
                <div className="min-w-0">
                    <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{patient.name}</p>
                    <p style={{ color: '#475569', fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>{patient.condition}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '99px' }}>Active</span>
                <button onClick={handleDownloadPDF} title="Download PDF"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '6px', color: '#60a5fa', cursor: 'pointer', transition: 'all 0.2s' }}
                    className="hover:bg-blue-500/20">
                    <FileText size={13} />
                </button>
                <ChevronRight size={14} style={{ color: '#334155', transition: 'all 0.2s' }} className="group-hover:text-blue-400" />
            </div>
        </div>
    );
};

export default PatientCard;
