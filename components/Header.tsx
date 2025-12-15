import React from 'react';
import { RefreshCw, LayoutGrid, List, LogOut } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  currentView: 'leads' | 'dashboard';
  onViewChange: (view: 'leads' | 'dashboard') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  currentView, 
  onViewChange, 
  onRefresh,
  isRefreshing 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 h-16 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
          FM1
        </div>
        <h1 className="text-lg font-bold text-gray-900 hidden sm:block">Sales Dashboard</h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* View Toggles (Desktop) */}
        <div className="hidden md:flex bg-gray-100 rounded-lg p-1 mr-4">
          <button
            onClick={() => onViewChange('leads')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentView === 'leads' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <List size={16} />
              <span>Leads</span>
            </div>
          </button>
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentView === 'dashboard' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <LayoutGrid size={16} />
              <span>Stats</span>
            </div>
          </button>
        </div>

        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-all ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
        >
          <RefreshCw size={20} />
        </button>

        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex items-center space-x-2">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover border border-gray-200"
          />
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
        </div>
      </div>
    </header>
  );
};