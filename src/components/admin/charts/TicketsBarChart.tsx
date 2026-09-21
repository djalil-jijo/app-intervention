'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface MonthlyTrendItem {
  month: string;
  total: number;
  resolved: number;
  pending: number;
}

interface TicketsBarChartProps {
  data: MonthlyTrendItem[];
}

export const TicketsBarChart: React.FC<TicketsBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        لا توجد بيانات كافية للرسم البياني
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            }}
            labelStyle={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                total: 'إجمالي التذاكر',
                resolved: 'تذاكر منجزة',
                pending: 'قيد الانتظار',
              };
              return <span className="text-slate-300 font-medium">{labels[value] || value}</span>;
            }}
          />
          <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={30} />
          <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
          <Bar dataKey="pending" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
