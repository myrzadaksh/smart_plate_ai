import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Home, UtensilsCrossed, Calendar, ShoppingCart, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getUserInitial = () => {
        if (user && user.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 w-full">
                    
                    <Link to="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-gray-900 shrink-0">
                        <ChefHat className="w-7 h-7 text-emerald-500" />
                        <span className="hidden sm:block">Smart Plate AI</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-1 mx-4">
                        <NavLink to="/dashboard" icon={<Home className="w-4 h-4" />} label="Dashboard" />
                        <NavLink to="/pantry" icon={<UtensilsCrossed className="w-4 h-4" />} label="Pantry" />
                        <NavLink to="/generate" icon={<ChefHat className="w-4 h-4" />} label="Generate" />
                        <NavLink to="/recipes" icon={<UtensilsCrossed className="w-4 h-4" />} label="Recipes" />
                        <NavLink to="/meal-plan" icon={<Calendar className="w-4 h-4" />} label="Meal Plan" />
                        <NavLink to="/shopping-list" icon={<ShoppingCart className="w-4 h-4" />} label="Shopping" />
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            to="/settings"
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-2 sm:px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                                    {getUserInitial()}
                                </div>
                                <span className="hidden md:inline font-medium max-w-[100px] truncate">
                                    {user?.name || 'User'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                                                {getUserInitial()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email || 'user@example.com'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to="/settings"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="sm:hidden w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

interface NavLinkProps {
    to: string;
    icon: ReactNode;
    label: string;
}

const NavLink = ({ to, icon, label }: NavLinkProps) => {
    return (
        <Link
            to={to}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export default Navbar;