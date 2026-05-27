import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, FileText, LogOut, Zap, Clock, Menu, X } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [therapist, setTherapist] = useState({ name: 'Dr. Rahul Ingle', role: 'Chief Therapist', avatar: 'RI' });
    const [scrolled, setScrolled] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('therapistUser');
        if (stored) setTherapist(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Global session timer for the presentation
    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleLogout = () => {
        localStorage.removeItem('therapistUser');
        window.dispatchEvent(new Event('authChange'));
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Patients', path: '/patients', icon: Users },
        { name: 'Live Session', path: '/live', icon: Activity },
        { name: 'Reports', path: '/reports', icon: FileText },
    ];

    return (
        <>
        <nav
            style={{
                background: scrolled ? 'var(--biopunk-card-bg)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--biopunk-border)' : '1px solid transparent',
                transition: 'all 0.3s ease',
            }}
            className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        >
            {/* Logo Left */}
            <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                    <Zap size={24} className="text-[#00e5ff] relative z-10" fill="#00e5ff" />
                    <div className="absolute inset-0 bg-[#00e5ff] blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xl tracking-tight">ROM Rehab</span>
                    <span className="text-[#00e5ff] font-black text-xl">AI</span>
                    {/* Animated Pulse Dot */}
                    <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-glow ml-1 shadow-[0_0_8px_#39ff14]" />
                </div>
            </Link>

            {/* Center Nav Pills — desktop only */}
            <div className="hidden lg:flex items-center gap-2 bg-[#0b1426]/80 p-1.5 rounded-full border border-[#00e5ff]/20">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`relative flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs tracking-widest transition-all duration-300 ${
                                isActive ? 'text-[#00e5ff]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                        >
                            <Icon size={14} className={isActive ? 'drop-shadow-[0_0_5px_#00e5ff]' : ''} />
                            <span className="uppercase">{item.name}</span>
                            {/* Active Glow Underline */}
                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff]" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Session Timer — desktop only */}
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                        <Clock size={10} className="text-[#00e5ff]" /> Session Time
                    </span>
                    <span className="font-mono-data text-[#00e5ff] text-sm font-bold tracking-wider">{formatTime(sessionTime)}</span>
                </div>

                <div className="h-8 w-px bg-slate-800 hidden md:block" />

                <div className="hidden md:flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-white leading-none">{therapist.name}</span>
                        <span className="text-[10px] font-bold text-[#ffb300] uppercase tracking-widest mt-1 bg-[#ffb300]/10 px-2 py-0.5 rounded-full border border-[#ffb300]/30">{therapist.role}</span>
                    </div>
                    {/* Biopunk Avatar */}
                    <div className="relative w-10 h-10 flex items-center justify-center font-bold text-sm text-[#00e5ff] bg-gradient-to-br from-[#0b1426] to-[#070d1a] border border-[#00e5ff]/50 rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                        {therapist.avatar || 'RI'}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#39ff14] border-2 border-[#070d1a] rounded-full shadow-[0_0_5px_#39ff14]" />
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="p-2.5 text-slate-400 hover:text-[#ffb300] hover:bg-[#ffb300]/10 rounded-lg transition-all border border-transparent hover:border-[#ffb300]/30"
                        title="End Session & Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 text-slate-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 rounded-lg transition-all border border-transparent hover:border-[#00e5ff]/20"
                    aria-label="Toggle mobile menu"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </nav>

        {/* Mobile Slide-down Drawer */}
        {mobileOpen && (
            <div
                className="lg:hidden fixed inset-0 z-40"
                onClick={() => setMobileOpen(false)}
            >
                <div
                    className="absolute top-[72px] left-0 right-0 mx-4"
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'rgba(7, 13, 26, 0.97)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0,229,255,0.15)',
                        borderRadius: '16px',
                        padding: '12px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                        animation: 'fadeInUp 0.25s ease both',
                    }}
                >
                    {/* Mobile Nav Items */}
                    <div className="flex flex-col gap-1 mb-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                                        isActive
                                            ? 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Footer */}
                    <div className="border-t border-slate-800 pt-4 flex items-center justify-between px-2">
                        <div>
                            <p className="text-sm font-bold text-white">{therapist.name}</p>
                            <p className="text-[10px] font-bold text-[#ffb300] uppercase tracking-widest mt-0.5">{therapist.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#f87171] bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all uppercase tracking-wider"
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default Navbar;
