import React from 'react';
import { Phone, MessageCircle, MessageSquare, MapPin, Clock } from 'lucide-react';
import { Lead, LeadStatus, ActionType } from '../types';

interface LeadCardProps {
  lead: Lead;
  onAction: (lead: Lead, type: ActionType) => void;
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.UNCONTACTED]: 'bg-emerald-100 text-emerald-800 border-emerald-200', // Green
  [LeadStatus.NO_ANSWER]: 'bg-amber-100 text-amber-800 border-amber-200',       // Yellow
  [LeadStatus.ANSWERED]: 'bg-blue-100 text-blue-800 border-blue-200',          // Blue
  [LeadStatus.ORDERED]: 'bg-red-100 text-red-800 border-red-200',              // Red (as per spec)
  [LeadStatus.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.UNCONTACTED]: 'Uncontacted',
  [LeadStatus.NO_ANSWER]: 'No Answer',
  [LeadStatus.ANSWERED]: 'Answered',
  [LeadStatus.ORDERED]: 'Ordered',
  [LeadStatus.CANCELLED]: 'Cancelled',
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onAction }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header with Status */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <img 
            src={lead.avatarUrl} 
            alt={lead.tiktokUsername} 
            className="w-10 h-10 rounded-full bg-gray-100 object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">@{lead.tiktokUsername}</h3>
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              <MapPin size={12} className="mr-1" />
              {lead.city}
            </div>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[lead.status]}`}>
          {STATUS_LABELS[lead.status]}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-700 italic">"{lead.commentText}"</p>
          <div className="flex items-center justify-end mt-1">
            <Clock size={12} className="text-gray-400 mr-1" />
            <span className="text-xs text-gray-400">
              {new Date(lead.commentTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Tags */}
        {lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100">
        <button 
          onClick={() => onAction(lead, ActionType.CALL)}
          className="py-3 flex flex-col items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
        >
          <Phone size={18} className="mb-1" />
          <span className="text-xs font-medium">Call</span>
        </button>
        <button 
          onClick={() => onAction(lead, ActionType.WHATSAPP)}
          className="py-3 flex flex-col items-center justify-center text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <MessageCircle size={18} className="mb-1" />
          <span className="text-xs font-medium">WhatsApp</span>
        </button>
        <button 
          onClick={() => onAction(lead, ActionType.SMS)}
          className="py-3 flex flex-col items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <MessageSquare size={18} className="mb-1" />
          <span className="text-xs font-medium">SMS</span>
        </button>
      </div>
    </div>
  );
};