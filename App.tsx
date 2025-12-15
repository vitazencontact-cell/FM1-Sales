import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BarChart3, 
  RefreshCw, 
  LogOut, 
  Filter
} from 'lucide-react';
import { Lead, ActionType, LeadStatus, User } from './types';
import { MOCK_LEADS, MOCK_USER } from './constants';
import { Header } from './components/Header';
import { LeadList } from './components/LeadList';
import { Dashboard } from './components/Dashboard';
import { ActionModal } from './components/ActionModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'leads' | 'dashboard'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pendingActionType, setPendingActionType] = useState<ActionType | null>(null);

  // Initialize Data
  useEffect(() => {
    // Simulate initial auth and data fetch
    setUser(MOCK_USER);
    setLeads(MOCK_LEADS);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate network delay
    setTimeout(() => {
      // In a real app, this would fetch from Google Sheets
      const shuffled = [...leads].sort(() => Math.random() - 0.5);
      setLeads(shuffled);
      setIsRefreshing(false);
    }, 1500);
  };

  const handleActionClick = (lead: Lead, type: ActionType) => {
    setSelectedLead(lead);
    setPendingActionType(type);
    
    // Perform external action
    if (type === ActionType.CALL) {
      window.open(`tel:${lead.phoneNumber}`, '_self');
    } else if (type === ActionType.WHATSAPP) {
      // Remove + and spaces for WA link
      const cleanNumber = lead.phoneNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } else if (type === ActionType.SMS) {
        window.open(`sms:${lead.phoneNumber}`, '_self');
    }
  };

  const handleSaveAction = (leadId: string, outcome: LeadStatus, notes: string) => {
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.leadId === leadId) {
        return {
          ...lead,
          status: outcome,
          lastUpdated: new Date().toISOString()
        };
      }
      return lead;
    }));
    setSelectedLead(null);
    setPendingActionType(null);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setPendingActionType(null);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Authenticating with Google...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header 
        user={user} 
        currentView={currentView}
        onViewChange={setCurrentView}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto p-4 pt-20">
        {currentView === 'dashboard' ? (
          <Dashboard leads={leads} />
        ) : (
          <LeadList 
            leads={leads} 
            onAction={handleActionClick} 
          />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-40">
        <button 
          onClick={() => setCurrentView('leads')}
          className={`flex flex-col items-center space-y-1 ${currentView === 'leads' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
          <Users size={24} />
          <span className="text-xs font-medium">Leads</span>
        </button>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center space-y-1 ${currentView === 'dashboard' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
          <BarChart3 size={24} />
          <span className="text-xs font-medium">Stats</span>
        </button>
      </div>

      {selectedLead && pendingActionType && (
        <ActionModal
          isOpen={true}
          lead={selectedLead}
          actionType={pendingActionType}
          onClose={handleCloseModal}
          onSave={handleSaveAction}
        />
      )}
    </div>
  );
};

export default App;