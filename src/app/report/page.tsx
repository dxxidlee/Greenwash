'use client';
import { useState, useEffect } from 'react';

export default function ReportPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [complianceData, setComplianceData] = useState({
    totalScans: 0,
    compliantScans: 0,
    averageCompliance: 0,
    lastScan: null as string | null
  });

  useEffect(() => {
    // Simulate loading compliance data
    const timer = setTimeout(() => {
      setIsLoading(false);
      setComplianceData({
        totalScans: 1247,
        compliantScans: 892,
        averageCompliance: 71.5,
        lastScan: new Date().toISOString()
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const compliancePercentage = complianceData.totalScans > 0 
    ? (complianceData.compliantScans / complianceData.totalScans * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-500 mb-2 tracking-wider">
              COMPLIANCE REPORT RPT-37
            </h1>
            <p className="text-green-300 text-lg">
              Greenwash Compliance Analytics Dashboard
            </p>
          </div>
          <a
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-sm font-medium transition-colors tracking-wider"
          >
            ← BACK TO HOME
          </a>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-green-500 text-xl font-medium mb-4 tracking-wider">
                GENERATING COMPLIANCE REPORT...
              </div>
              <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
                <div className="text-green-400 text-sm font-medium mb-2 tracking-wider">
                  TOTAL SCANS
                </div>
                <div className="text-3xl font-bold text-green-500">
                  {complianceData.totalScans.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
                <div className="text-green-400 text-sm font-medium mb-2 tracking-wider">
                  COMPLIANT SCANS
                </div>
                <div className="text-3xl font-bold text-green-500">
                  {complianceData.compliantScans.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
                <div className="text-green-400 text-sm font-medium mb-2 tracking-wider">
                  COMPLIANCE RATE
                </div>
                <div className="text-3xl font-bold text-green-500">
                  {compliancePercentage}%
                </div>
              </div>
            </div>

            {/* Compliance Chart Placeholder */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-8 mb-8">
              <div className="text-green-500 text-lg font-medium mb-4 tracking-wider">
                COMPLIANCE TREND ANALYSIS
              </div>
              <div className="h-64 bg-gray-900/50 rounded border border-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-sm">Compliance visualization would appear here</div>
                  <div className="text-xs mt-1">Real-time data integration pending</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
                <div className="text-green-500 text-lg font-medium mb-4 tracking-wider">
                  RECENT SCANS
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                      <div className="text-green-400 text-sm">
                        Scan #{complianceData.totalScans - i + 1}
                      </div>
                      <div className="text-green-500 text-sm font-medium">
                        {Math.random() > 0.3 ? 'COMPLIANT' : 'NON-COMPLIANT'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
                <div className="text-green-500 text-lg font-medium mb-4 tracking-wider">
                  SYSTEM STATUS
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-sm">Scanner Status</span>
                    <span className="text-green-500 text-sm font-medium">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-sm">Database</span>
                    <span className="text-green-500 text-sm font-medium">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-sm">Last Update</span>
                    <span className="text-green-500 text-sm font-medium">
                      {complianceData.lastScan ? new Date(complianceData.lastScan).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-sm">Compliance Target</span>
                    <span className="text-green-500 text-sm font-medium">75%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-green-400/60 text-sm">
              <div className="tracking-wider">
                GREENWASH COMPLIANCE REPORTING SYSTEM
              </div>
              <div className="text-xs mt-1">
                Uniform green is policy. Compliance is a public good.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
