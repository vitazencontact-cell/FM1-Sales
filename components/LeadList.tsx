import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Lead, LeadStatus, ActionType } from '../types';
import { LeadCard } from './LeadCard';

interface LeadListProps {
  leads: Lead[];
  onAction: (lead: Lead, type: ActionType) => void;
}

export const LeadList: React.FC<LeadListProps> = ({ leads, onAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.tiktokUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phoneNumber.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  // Group stats for badges
  const stats = useMemo(() => {
    const uncontacted = leads.filter(l => l.status === LeadStatus.UNCONTACTED).length;
    return { uncontacted };
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by username, phone, or city..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'ALL')}
              className="block w-full md:w-48 pl-3 pr-10 py-2.5 text-base border-gray-200 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-lg bg-gray-50"
            >
              <option value="ALL">All Statuses</option>
              <option value={LeadStatus.UNCONTACTED}>Uncontacted</option>
              <option value={LeadStatus.ANSWERED}>Answered</option>
              <option value={LeadStatus.NO_ANSWER}>No Answer</option>
              <option value={LeadStatus.ORDERED}>Ordered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Badge */}
      {statusFilter === 'ALL' && !searchTerm && (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-gray-800">Recent Leads</h2>
          {stats.uncontacted > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {stats.uncontacted} New
            </span>
          )}
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredLeads.map((lead) => (
          <LeadCard 
            key={lead.leadId} 
            lead={lead} 
            onAction={onAction}
          />
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <Filter className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};