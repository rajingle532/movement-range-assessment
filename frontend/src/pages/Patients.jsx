import React, { useEffect, useState } from 'react';
import PatientCard from '../components/PatientCard';
import { UserPlus, Search, AlertCircle, CheckCircle, RefreshCw, Layers, Download } from 'lucide-react';
import { api } from '../services/api';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form State
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [condition, setCondition] = useState('');
    
    // Status/Feedback State
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchPatients = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.getPatients();
            setPatients(data);
        } catch (err) {
            console.error("Error fetching patients list:", err);
            setError("Could not load patient directory. Check server connection.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Form Validation
        if (!name.trim()) return setFormError("Patient's full name is required.");
        if (!age || isNaN(age) || parseInt(age) <= 0) return setFormError("Please enter a valid age.");
        if (!condition.trim()) return setFormError("Medical or rehabilitation condition is required.");

        setIsSubmitting(true);
        try {
            const newPatient = await api.createPatient({
                name: name.trim(),
                age: parseInt(age),
                condition: condition.trim()
            });

            // Set success
            setFormSuccess(`Successfully registered patient: ${newPatient.name}`);
            
            // Reset form
            setName('');
            setAge('');
            setCondition('');

            // Automatically refresh list
            fetchPatients();
        } catch (err) {
            console.error("Error creating patient:", err);
            setFormError("Failed to register patient in clinical registry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportCSV = () => {
        // Direct browser download from the API
        window.open('http://localhost:8000/api/patients/export/csv', '_blank');
    };

    // Filter patients based on search query
    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100 font-sans relative overflow-hidden">
            {/* Soft glows */}
            <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[130px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">Patient Registry</h1>
                        <p className="text-slate-400 text-sm mt-1">Manage physical rehabilitation profiles and monitor clinical sessions.</p>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search clinical directory..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                            />
                        </div>
                        <button 
                            onClick={fetchPatients}
                            title="Refresh Directory"
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-400" : ""} />
                        </button>
                        <button 
                            onClick={handleExportCSV}
                            title="Export to CSV"
                            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4.5 rounded-2xl mb-8 flex items-center gap-3 text-sm">
                        <AlertCircle size={20} className="shrink-0 text-red-500" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Form Card */}
                    <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl shadow-black/10 h-fit sticky top-24">
                        <div className="flex items-center gap-2.5 mb-6 text-blue-400">
                            <UserPlus size={18} />
                            <h3 className="font-black text-sm uppercase tracking-wider text-slate-200">Register New Patient</h3>
                        </div>

                        {formError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-5 flex items-start gap-2.5 text-xs font-semibold">
                                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                <span>{formError}</span>
                            </div>
                        )}

                        {formSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-5 flex items-start gap-2.5 text-xs font-semibold">
                                <CheckCircle size={15} className="shrink-0 mt-0.5" />
                                <span>{formSuccess}</span>
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4.5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-0.5">
                                    Patient Full Name
                                </label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Vikram Malhotra" 
                                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-0.5">
                                        Age (yrs)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="42" 
                                        className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-0.5">
                                        Clinical Condition
                                    </label>
                                    <input 
                                        type="text" 
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                        placeholder="e.g. ACL Reconstruction" 
                                        className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 text-xs disabled:opacity-50 mt-4 cursor-pointer"
                            >
                                {isSubmitting ? "Registering..." : "Add to Registry"}
                            </button>
                        </form>
                    </div>

                    {/* Patient List */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl shadow-xl shadow-black/5 mb-4 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Layers size={14} className="text-blue-400" />
                                Registered Profiles
                            </h3>
                            <span className="bg-blue-600/10 text-blue-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase border border-blue-500/10">
                                {filteredPatients.length} Active Records
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 4, 5].map(n => (
                                    <div key={n} className="h-24 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-2xl text-center text-slate-500">
                                <Search size={36} className="mx-auto text-slate-600 mb-4" />
                                <p className="text-sm font-bold text-slate-400">No patient files found.</p>
                                <p className="text-xs mt-1">Try modifying your search or add a new patient profile.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredPatients.map(p => (
                                    <PatientCard key={p.id} patient={p} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Patients;
