'use client';

import React from 'react';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 160 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className="text-sm text-gray-400">No data</p>
      </div>
    );
  }

  let currentAngle = -90;
  const strokeWidth = 20;
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />

        {/* Data segments */}
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const segmentLength = (percentage / 100) * circumference;
          const offset = circumference - segmentLength;
          const rotation = currentAngle;

          currentAngle += (percentage / 100) * 360;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={-offset}
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              strokeLinecap="round"
            />
          );
        })}

        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold fill-gray-900"
        >
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-3 space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700">
              {item.label}: <span className="font-semibold">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
