import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, User, Activity } from 'lucide-react';

const PatientCard = ({ patient }) => {
    const navigate = useNavigate();
    const formattedDate = patient.created_at 
        ? new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A';

    return (
        <div 
            onClick={() => navigate('/live')}
            className="bg-slate-900/60 backdrop-blur border border-slate-800 p-4.5 rounded-2xl hover:border-blue-500/40 hover:bg-slate-800/40 transition-all duration-300 group cursor-pointer shadow-lg shadow-black/5"
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4.5">
                    {/* User Icon Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold group-hover:scale-105 transition-transform duration-300">
                        <User size={18} />
                    </div>
                    <div>
                        <h3 className="text-white font-extrabold text-sm group-hover:text-blue-400 transition-colors">{patient.name}</h3>
                        <p className="text-slate-400 text-xs font-semibold mt-0.5">{patient.condition}</p>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500 font-bold">
                            <span className="bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded-md">
                                AGE: {patient.age || 'N/A'} yrs
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar size={11} /> Reg: {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        (patient.status || 'Active') === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                        {patient.status || 'Active'}
                    </span>
                    <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>
        </div>
    );
};

export default PatientCard;
