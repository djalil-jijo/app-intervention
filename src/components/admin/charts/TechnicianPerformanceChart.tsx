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

interface TechStatItem {
  id: string;
  name: string;
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
  rate: number;
}

interface TechnicianPerformanceChartProps {
  data: TechStatItem[];
}

export const TechnicianPerformanceChart: React.FC<TechnicianPerformanceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        لا توجد بيانات تقنيين
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.slice(0, 6)}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} horizontal={false} />
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            width={85}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any) => {
              const names: Record<string, string> = {
                resolved: 'تدخلات منجزة',
                inProgress: 'قيد المعالجة',
                pending: 'قيد الانتظار',
              };
              return [`${value} تدخل`, names[name as string] || name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                resolved: 'منجز',
                inProgress: 'قيد المعالجة',
                pending: 'انتظار',
              };
              return <span className="text-slate-300 font-medium">{labels[value] || value}</span>;
            }}
          />
          <Bar dataKey="resolved" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={20} />
          <Bar dataKey="inProgress" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} maxBarSize={20} />
          <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
