import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, FileText, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [therapist, setTherapist] = useState({ name: 'Dr. Rahul Ingle', role: 'Chief Therapist', avatar: 'RI' });
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('therapistUser');
        if (stored) setTherapist(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const activeStyle = {
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))',
        border: '1px solid rgba(59,130,246,0.35)',
        color: '#60a5fa',
        boxShadow: '0 0 14px rgba(59,130,246,0.15)',
    };
    const inactiveStyle = { border: '1px solid transparent', color: '#64748b' };

    return (
        <nav
            style={{
                background: scrolled ? 'rgba(2,8,23,0.97)' : 'rgba(2,8,23,0.75)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.6)' : 'none',
                transition: 'all 0.3s ease',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}
            className="px-6 py-3 flex items-center justify-between"
        >
            <Link to="/" className="flex items-center gap-3">
                <div style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius: '12px', padding: '8px', boxShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
                    <Zap size={18} className="text-white" fill="white" />
                </div>
                <span className="text-white font-black text-lg tracking-tight">
                    ROM Rehab{' '}
                    <span style={{ background: 'linear-gradient(90deg,#60a5fa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
                </span>
            </Link>

            <div className="flex items-center gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            style={isActive ? activeStyle : inactiveStyle}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:text-slate-200 hover:bg-white/5"
                        >
                            <Icon size={14} />
                            <span className="hidden md:inline">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-white leading-none">{therapist.name}</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{therapist.role}</span>
                </div>
                <div style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(6,182,212,0.15))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px', color: '#60a5fa' }}>
                    {therapist.avatar || 'RI'}
                </div>
                <button
                    onClick={handleLogout}
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '9px', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                    className="hover:text-red-400 hover:border-red-500/30"
                    title="Logout"
                >
                    <LogOut size={15} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
