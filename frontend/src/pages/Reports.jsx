// Reports.jsx
import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, User, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { api } from '../services/api';

const Reports = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);

    const fetchPatients = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getPatients();
            setPatients(data);
        } catch (err) {
            setError('Could not connect to clinical server. Please ensure backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

    const handleDownloadPDF = (patient) => {
        setDownloadingId(patient.id);
        const url = `http://localhost:8000/api/reports/${patient.id}`;
        window.open(url, '_blank');
        setTimeout(() => setDownloadingId(null), 2000);
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-grid-biopunk pb-16 text-slate-100 relative overflow-hidden">
            <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="max-w-6xl mx-auto px-8 pt-10 animate-fade-in-up">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <FileText size={22} className="text-purple-400" />
                            </div>
                            Clinical Reports
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Download PDF ROM assessment reports for each patient.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchPatients} className="glass-panel hover:bg-slate-800/40 text-slate-400 hover:text-white p-3 rounded-xl transition-all cursor-pointer">
                            <RefreshCw size={16} className={isLoading ? 'animate-spin text-blue-400' : ''} />
                        </button>
                        <button
                            onClick={() => window.open('http://localhost:8000/api/patients/export/csv', '_blank')}
                            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
                        >
                            <Download size={14} /> Export All CSV
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by patient name or condition..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 glass-panel rounded-2xl text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all bg-transparent"
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Reports Table */}
                <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
                    <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-800/80 bg-slate-900/40">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Patient</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Age</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Condition</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reg. Date</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Report</span>
                    </div>

                    {isLoading ? (
                        [1,2,3,4].map(n => (
                            <div key={n} className="h-16 bg-slate-800/20 animate-pulse border-b border-slate-800/40" />
                        ))
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <FileText size={40} className="mx-auto text-slate-700 mb-3" />
                            <p className="font-bold text-sm">No patients found</p>
                        </div>
                    ) : (
                        filteredPatients.map((patient) => {
                            const date = patient.created_at
                                ? new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'N/A';
                            return (
                                <div key={patient.id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600/20 to-blue-600/20 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                            <User size={14} />
                                        </div>
                                        <span className="font-bold text-white text-sm">{patient.name}</span>
                                    </div>
                                    <span className="text-slate-400 text-sm font-semibold">{patient.age} yrs</span>
                                    <span className="text-slate-300 text-sm font-semibold">{patient.condition}</span>
                                    <span className="text-slate-500 text-xs font-semibold">{date}</span>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleDownloadPDF(patient)}
                                            disabled={downloadingId === patient.id}
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                                        >
                                            {downloadingId === patient.id
                                                ? <Activity size={12} className="animate-spin" />
                                                : <Download size={12} />
                                            }
                                            {downloadingId === patient.id ? 'Generating...' : 'PDF Report'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {!isLoading && filteredPatients.length > 0 && (
                    <div className="mt-4 text-center text-slate-600 text-xs font-semibold">
                        Showing {filteredPatients.length} of {patients.length} patient records
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
