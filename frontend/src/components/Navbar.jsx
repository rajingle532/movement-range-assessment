import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Users, LayoutDashboard, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [therapist, setTherapist] = useState({ name: 'Therapist', role: 'Staff' });

    useEffect(() => {
        const stored = localStorage.getItem('therapistUser');
        if (stored) {
            setTherapist(JSON.parse(stored));
        }
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
    ];

    return (
        <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-slate-950/20">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 rounded-xl shadow-md shadow-blue-500/10">
                    <Activity className="text-white w-5 h-5 animate-pulse" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                    ROM Rehab <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
                </span>
            </div>

            {/* Nav Menu */}
            <div className="flex gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                                isActive 
                                ? 'bg-gradient-to-r from-blue-600/15 to-cyan-600/15 text-blue-400 border border-blue-500/20' 
                                : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                        >
                            <Icon size={15} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-3.5 pl-4 border-l border-slate-800">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white leading-none mb-1">{therapist.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{therapist.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center font-extrabold text-blue-400 shadow-inner">
                        {therapist.avatar || 'RI'}
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
