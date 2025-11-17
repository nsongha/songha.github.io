'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIProjectAnalysis } from '@/lib/types';
import { format } from 'date-fns';

interface AIAnalysisCardProps {
  analysis: AIProjectAnalysis;
  onRequestUpdate?: () => void;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ analysis, onRequestUpdate }) => {
  const [expanded, setExpanded] = useState(false);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const healthColorClass = getHealthColor(analysis.healthScore);

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🤖</span>
              <CardTitle className="text-lg">AI Analysis</CardTitle>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${healthColorClass}`}>
                Health: {analysis.healthScore}/100
              </span>
              {analysis.onTrack ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ On Track
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  ⚠ At Risk
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Generated: {format(analysis.generatedAt, 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? '▲ Less' : '▼ More'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Summary */}
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
        </div>

        {expanded && (
          <>
            {/* Risks */}
            {analysis.risks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-1">
                  <span>⚠️</span> Risks Identified
                </h4>
                <ul className="space-y-1">
                  {analysis.risks.map((risk, idx) => (
                    <li key={idx} className="text-xs text-red-800 pl-4 relative">
                      <span className="absolute left-0">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Steps */}
            {analysis.missingSteps.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-1">
                  <span>📋</span> Missing Steps
                </h4>
                <ul className="space-y-1">
                  {analysis.missingSteps.map((step, idx) => (
                    <li key={idx} className="text-xs text-yellow-800 pl-4 relative">
                      <span className="absolute left-0">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overloaded Members */}
            {analysis.overloadedMembers.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-1">
                  <span>👥</span> Overloaded Team Members
                </h4>
                <div className="space-y-2">
                  {analysis.overloadedMembers.map((member) => (
                    <div key={member.userId} className="text-xs">
                      <div className="font-medium text-orange-800">
                        {member.userName} ({member.taskCount} tasks)
                      </div>
                      <div className="text-orange-700 pl-4">{member.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1">
                  <span>💡</span> AI Recommendations
                </h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-blue-800 pl-4 relative">
                      <span className="absolute left-0">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            {onRequestUpdate && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={onRequestUpdate}
                  className="w-full"
                >
                  📩 Request Status Update from Manager
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
