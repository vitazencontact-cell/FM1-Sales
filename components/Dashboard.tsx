import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Lead, LeadStatus } from '../types';

interface DashboardProps {
  leads: Lead[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  const data = useMemo(() => {
    const counts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Uncontacted', value: counts[LeadStatus.UNCONTACTED] || 0, color: '#10b981' },
      { name: 'No Answer', value: counts[LeadStatus.NO_ANSWER] || 0, color: '#f59e0b' },
      { name: 'Answered', value: counts[LeadStatus.ANSWERED] || 0, color: '#3b82f6' },
      { name: 'Ordered', value: counts[LeadStatus.ORDERED] || 0, color: '#ef4444' },
    ];
  }, [leads]);

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 
    ? (((leads.filter(l => l.status === LeadStatus.ORDERED).length) / totalLeads) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Leads</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeads}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Orders</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {leads.filter(l => l.status === LeadStatus.ORDERED).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">To Contact</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {leads.filter(l => l.status === LeadStatus.UNCONTACTED).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Conversion</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{conversionRate}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Status Distribution</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};