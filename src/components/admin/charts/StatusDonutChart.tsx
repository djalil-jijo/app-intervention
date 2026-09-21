'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface StatusDonutChartProps {
  data: {
    PENDING: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    CLOSED: number;
  };
}

const COLORS = {
  PENDING: '#f59e0b',     // Amber
  IN_PROGRESS: '#38bdf8', // Sky
  RESOLVED: '#10b981',    // Emerald
  CLOSED: '#64748b',      // Slate
};

const LABELS: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  IN_PROGRESS: 'قيد المعالجة',
  RESOLVED: 'تم الحل',
  CLOSED: 'مغلقة ومؤكدة',
};

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ data }) => {
  const chartData = [
    { name: 'PENDING', value: data.PENDING || 0 },
    { name: 'IN_PROGRESS', value: data.IN_PROGRESS || 0 },
    { name: 'RESOLVED', value: data.RESOLVED || 0 },
    { name: 'CLOSED', value: data.CLOSED || 0 },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        لا توجد تذاكر مسجلة بعد
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[entry.name as keyof typeof COLORS] || '#6366f1'}
                stroke="#0f172a"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value: any, name: any) => [
              `${value} تذكرة`,
              LABELS[name as string] || name,
            ]}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            formatter={(value) => (
              <span className="text-slate-300 font-medium">
                {LABELS[value] || value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
