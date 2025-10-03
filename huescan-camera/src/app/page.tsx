'use client';
import { useState, useRef, useEffect } from 'react';
import CameraFeed from './components/CameraFeed';

export default function HueScanPage() {
  const [compliance, setCompliance] = useState<number>(0);
  const [isScanning, setIsScanning] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-green-600">
        <div>
          <h1 className="text-2xl font-bold text-green-400">HueScan HUE-37</h1>
          <p className="text-gray-400">Green Compliance Detection System</p>
        </div>
        
        <a 
          href="http://localhost:3000" 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
        >
          ← Back to Home
        </a>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Camera Feed */}
        <div className="flex-1 p-6">
          <div className="bg-gray-900 rounded-lg p-4 h-full">
            <h2 className="text-lg font-semibold mb-4 text-green-400">Live Camera Feed</h2>
            <CameraFeed 
              onComplianceUpdate={setCompliance}
              isScanning={isScanning}
              onScanningChange={setIsScanning}
            />
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="w-80 p-6 border-l border-green-600">
          <h2 className="text-lg font-semibold mb-4 text-green-400">Compliance Analysis</h2>
          
          {/* Compliance Meter */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Compliance Level</span>
              <span className="text-sm font-bold text-green-400">{compliance.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${compliance}%` }}
              ></div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Status</div>
            <div className={`px-3 py-2 rounded text-sm font-medium ${
              compliance >= 80 ? 'bg-green-600 text-white' :
              compliance >= 50 ? 'bg-yellow-600 text-white' :
              'bg-red-600 text-white'
            }`}>
              {compliance >= 80 ? 'COMPLIANT' :
               compliance >= 50 ? 'PARTIAL COMPLIANCE' :
               'NON-COMPLIANT'}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`w-full px-4 py-2 rounded font-medium transition-colors ${
                isScanning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </button>
            
            <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium transition-colors">
              Switch Camera
            </button>
            
            <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium transition-colors">
              Export Report
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-800 rounded">
            <h3 className="text-sm font-semibold text-green-400 mb-2">Instructions</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Point camera at green objects</li>
              <li>• Ensure good lighting</li>
              <li>• Hold steady for accurate reading</li>
              <li>• Target compliance: #008F46</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
