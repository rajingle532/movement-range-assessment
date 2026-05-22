import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Professional-grade authentication simulation
        setTimeout(() => {
            if (email.toLowerCase() === 'therapist@rom.com' && password === 'password123') {
                const user = {
                    name: 'Dr. Rahul Ingle',
                    role: 'Chief Therapist',
                    email: email,
                    avatar: 'RI',
                };
                localStorage.setItem('therapistUser', JSON.stringify(user));
                setIsLoading(false);
                // Trigger event to notify Navbar of state change
                window.dispatchEvent(new Event('authChange'));
                navigate('/');
            } else {
                setIsLoading(false);
                setError('Invalid credentials. Please use therapist@rom.com / password123');
            }
        }, 1200); // Elegant loading delay for realism
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
            {/* Ambient Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                {/* Brand Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-3 rounded-2xl shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
                        <Activity className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        ROM Rehab <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">AI-Powered Range of Motion Assessment Platform</p>
                </div>

                {/* Glassmorphism Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Therapist Portal <Sparkles size={16} className="text-cyan-400" />
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Please enter your authorized clinical credentials.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 text-xs animate-shake">
                            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold">Access Denied:</span> {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                Clinical Email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="therapist@rom.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                Security Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 group text-sm disabled:opacity-50 mt-6"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Verify & Log In
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Helper credentials footer */}
                <div className="text-center mt-6">
                    <p className="text-slate-500 text-xs font-semibold">
                        Demo Account: <span className="text-slate-400">therapist@rom.com</span> | Password: <span className="text-slate-400">password123</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
