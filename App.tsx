import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  ShieldCheck,
  Layout,
  AlertCircle
} from 'lucide-react';
import { Lead, ActionType, LeadStatus, User } from './types';
import { Header } from './components/Header';
import { LeadList } from './components/LeadList';
import { Dashboard } from './components/Dashboard';
import { ActionModal } from './components/ActionModal';
import { initGapiClient, initGoogleAuth, signIn, signOut, fetchLeadsFromSheet, updateLeadStatusInSheet } from './lib/sheets';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'leads' | 'dashboard'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pendingActionType, setPendingActionType] = useState<ActionType | null>(null);

  // Initialize Google API
  useEffect(() => {
    const initialize = async () => {
      try {
        await initGapiClient();
        setIsGapiReady(true);
        
        // Wait for GIS script to load if it hasn't
        if (window.google) {
            initGoogleAuth((loggedInUser) => {
              setUser(loggedInUser);
            });
        } else {
             const checkGoogle = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogle);
                    initGoogleAuth((loggedInUser) => {
                        setUser(loggedInUser);
                    });
                }
             }, 500);
        }
      } catch (error: any) {
        console.error("Failed to initialize Google API", error);
        setInitError(error.message || "Failed to load Google API");
      }
    };
    initialize();
  }, []);

  // Fetch leads when user logs in
  useEffect(() => {
    if (user && isGapiReady) {
      handleRefresh();
    }
  }, [user, isGapiReady]);

  const handleRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const data = await fetchLeadsFromSheet();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching data", error);
      // Don't alert immediately on load, just log
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
    setLeads([]);
  };

  const handleActionClick = (lead: Lead, type: ActionType) => {
    setSelectedLead(lead);
    setPendingActionType(type);
    
    // Perform external action
    if (type === ActionType.CALL) {
      window.open(`tel:${lead.phoneNumber}`, '_self');
    } else if (type === ActionType.WHATSAPP) {
      const cleanNumber = lead.phoneNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } else if (type === ActionType.SMS) {
        window.open(`sms:${lead.phoneNumber}`, '_self');
    }
  };

  const handleSaveAction = async (leadId: string, outcome: LeadStatus, notes: string) => {
    const leadToUpdate = leads.find(l => l.leadId === leadId);
    if (!leadToUpdate) return;

    // Optimistic Update
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.leadId === leadId) {
        return {
          ...lead,
          status: outcome,
          commentText: notes || lead.commentText, // Update notes in local state too
          lastUpdated: new Date().toISOString()
        };
      }
      return lead;
    }));

    try {
      await updateLeadStatusInSheet(leadToUpdate, outcome, notes);
    } catch (error) {
      console.error("Failed to save to sheet", error);
      alert("Failed to save to Google Sheet. Please check your internet connection.");
      // In a real app, revert optimistic update here
    }

    setSelectedLead(null);
    setPendingActionType(null);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setPendingActionType(null);
  };

  if (initError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Initialization Error</h2>
                <p className="text-gray-600 mb-4">{initError}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium"
                >
                    Retry
                </button>
            </div>
        </div>
      );
  }

  if (!isGapiReady) {
     return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Initializing Google Services...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layout size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">FM1 Sales</h1>
          <p className="text-gray-500 mb-8">Sign in to manage your TikTok leads directly from Google Sheets.</p>
          
          <button 
            onClick={signIn}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-xl transition-all shadow-sm group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>
          
          <div className="mt-6 flex items-center justify-center text-xs text-gray-400 space-x-1">
             <ShieldCheck size={12} />
             <span>Secure connection via Google OAuth</span>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
             <p>If you see a 400 or origin error, ensure your current URL is authorized in Google Cloud Console.</p>
          </div>
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
        onLogout={handleLogout}
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