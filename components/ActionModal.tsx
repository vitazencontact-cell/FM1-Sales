import React, { useState } from 'react';
import { X, Save, Phone, MessageCircle } from 'lucide-react';
import { Lead, LeadStatus, ActionType } from '../types';

interface ActionModalProps {
  isOpen: boolean;
  lead: Lead;
  actionType: ActionType;
  onClose: () => void;
  onSave: (leadId: string, outcome: LeadStatus, notes: string) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ 
  isOpen, 
  lead, 
  actionType, 
  onClose, 
  onSave 
}) => {
  const [outcome, setOutcome] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${actionType === ActionType.WHATSAPP ? 'bg-green-100 text-green-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {actionType === ActionType.WHATSAPP ? <MessageCircle size={20} /> : <Phone size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Log Interaction</h3>
              <p className="text-sm text-gray-500">@{lead.tiktokUsername}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: LeadStatus.ANSWERED, label: 'Answered', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
                { val: LeadStatus.NO_ANSWER, label: 'No Answer', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
                { val: LeadStatus.ORDERED, label: 'Ordered', color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
                { val: LeadStatus.CANCELLED, label: 'Not Interested', color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setOutcome(opt.val)}
                  className={`border rounded-lg py-3 px-4 text-sm font-medium transition-all ${
                    outcome === opt.val 
                      ? `${opt.color} ring-2 ring-offset-1 ring-emerald-500` 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-3"
              placeholder="Customer requested size L..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(lead.leadId, outcome, notes)}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center shadow-sm"
          >
            <Save size={16} className="mr-2" />
            Save Log
          </button>
        </div>
      </div>
    </div>
  );
};