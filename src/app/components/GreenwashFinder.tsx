'use client';

import React, { useState } from 'react';
import { Folder, FileText, Image, File, ChevronRight, ZoomIn, ZoomOut, X, RotateCw, Maximize2, Download, Minimize2 } from 'lucide-react';

interface GreenwashFinderProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  preview: 'violation' | 'auth' | 'photo' | 'text' | 'report' | 'code' | 'spreadsheet';
}

const GreenwashFinder: React.FC<GreenwashFinderProps> = ({ isOpen, onClose }) => {
  const [selectedFolder, setSelectedFolder] = useState('violations');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const folders = [
    { id: 'violations', name: 'Violations', icon: Folder, count: 8 },
    { id: 'authorizations', name: 'Authorizations', icon: Folder, count: 12 },
    { id: 'reports', name: 'Compliance Reports', icon: Folder, count: 5 },
    { id: 'evidence', name: 'Evidence Photos', icon: Folder, count: 24 },
    { id: 'codes', name: 'Green Codes', icon: Folder, count: 41 },
    { id: 'archived', name: 'Archived', icon: Folder, count: 156 }
  ];

  const files: Record<string, FileItem[]> = {
    violations: [
      { id: 1, name: 'UN-2037-032_VendorCart.pdf', type: 'pdf', size: '2.4 MB', date: '01/28/2037', preview: 'violation' },
      { id: 2, name: 'UN-2037-033_Billboard.pdf', type: 'pdf', size: '1.8 MB', date: '01/29/2037', preview: 'violation' },
      { id: 3, name: 'Canal_St_Evidence_01.jpg', type: 'image', size: '4.2 MB', date: '01/28/2037', preview: 'photo' },
      { id: 4, name: 'Canal_St_Evidence_02.jpg', type: 'image', size: '3.9 MB', date: '01/28/2037', preview: 'photo' },
      { id: 5, name: 'Monthly_Summary_Jan.txt', type: 'text', size: '12 KB', date: '01/31/2037', preview: 'text' },
      { id: 6, name: 'Chinatown_Zone_Report.pdf', type: 'pdf', size: '5.1 MB', date: '01/30/2037', preview: 'report' },
      { id: 7, name: 'Violation_Stats_Q1.xlsx', type: 'spreadsheet', size: '156 KB', date: '01/15/2037', preview: 'spreadsheet' },
      { id: 8, name: 'Repeat_Offenders.txt', type: 'text', size: '8 KB', date: '01/25/2037', preview: 'text' }
    ],
    authorizations: [
      { id: 9, name: '002942-GM_Pike_Slip.pdf', type: 'pdf', size: '1.9 MB', date: '01/22/2037', preview: 'auth' },
      { id: 10, name: '002943-GM_Broadway.pdf', type: 'pdf', size: '2.1 MB', date: '01/23/2037', preview: 'auth' },
      { id: 11, name: 'Before_Pike_Slip.jpg', type: 'image', size: '5.3 MB', date: '01/20/2037', preview: 'photo' },
      { id: 12, name: 'After_Pike_Slip.jpg', type: 'image', size: '4.8 MB', date: '02/05/2037', preview: 'photo' },
      { id: 13, name: 'Cost_Estimates_Feb.xlsx', type: 'spreadsheet', size: '89 KB', date: '01/28/2037', preview: 'spreadsheet' }
    ],
    reports: [
      { id: 14, name: 'Zone_B_East_River_Q1.pdf', type: 'pdf', size: '8.2 MB', date: '01/31/2037', preview: 'report' },
      { id: 15, name: 'Compliance_Rate_Analysis.pdf', type: 'pdf', size: '3.4 MB', date: '01/28/2037', preview: 'report' },
      { id: 16, name: 'Field_Officer_Performance.txt', type: 'text', size: '15 KB', date: '01/30/2037', preview: 'text' }
    ],
    evidence: [
      { id: 17, name: 'IMG_2037_0128_001.jpg', type: 'image', size: '6.1 MB', date: '01/28/2037', preview: 'photo' },
      { id: 18, name: 'IMG_2037_0128_002.jpg', type: 'image', size: '5.8 MB', date: '01/28/2037', preview: 'photo' },
      { id: 19, name: 'IMG_2037_0129_001.jpg', type: 'image', size: '6.4 MB', date: '01/29/2037', preview: 'photo' }
    ],
    codes: [
      { id: 20, name: 'G-41_Canopy_Green.pdf', type: 'pdf', size: '245 KB', date: '12/01/2036', preview: 'code' },
      { id: 21, name: 'G-05_Vendor_Green.pdf', type: 'pdf', size: '198 KB', date: '12/01/2036', preview: 'code' },
      { id: 22, name: 'Green_Code_Directory.xlsx', type: 'spreadsheet', size: '342 KB', date: '01/01/2037', preview: 'spreadsheet' }
    ],
    archived: [
      { id: 23, name: '2036_Annual_Report.pdf', type: 'pdf', size: '15.8 MB', date: '12/31/2036', preview: 'report' },
      { id: 24, name: 'Historical_Data_2030-2036.xlsx', type: 'spreadsheet', size: '2.1 MB', date: '12/31/2036', preview: 'spreadsheet' }
    ]
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image': return Image;
      case 'pdf': return FileText;
      case 'text': return FileText;
      case 'spreadsheet': return File;
      default: return File;
    }
  };

  const getPreviewContent = (file: FileItem) => {
    if (!file) return null;

    const previewTypes = {
      violation: (
        <div className="w-full h-full bg-white border-2 border-green-600 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center text-2xl font-bold text-green-700 mb-6">GREENWASH</div>
            <div className="text-center text-lg text-green-600 mb-8">Noncompliance Violation Ticket</div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-4 border-2 border-green-600 p-3">
                <div><span className="font-bold">Ticket No:</span> UN-2037-032</div>
                <div><span className="font-bold">Date:</span> 01/28/2037</div>
                <div><span className="font-bold">Zone:</span> C-CHINATOWN</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Name:</div>
                <div>MERCHANT CART - L. WONG</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Location:</div>
                <div>CANAL ST & MOTT ST</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Violation:</div>
                <div>UNAUTHORIZED RED UMBRELLA CANOPY ON ACTIVE VENDOR CART</div>
              </div>
              <div className="border-2 border-green-600 p-3 bg-red-50">
                <div className="font-bold mb-1">Fine:</div>
                <div className="text-xl">$220.00</div>
              </div>
            </div>
          </div>
        </div>
      ),
      auth: (
        <div className="w-full h-full bg-white border-2 border-green-600 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center text-2xl font-bold text-green-700 mb-6">GREENWASH</div>
            <div className="text-center text-lg text-green-600 mb-8">Authorization Form</div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 border-2 border-green-600 p-3">
                <div><span className="font-bold">Permit ID:</span> 002942-GM</div>
                <div><span className="font-bold">Date:</span> 01/22/2037</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Location:</div>
                <div>SOUTH ST & PIKE SLIP</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Object:</div>
                <div>BILLBOARD - 30 FT X 20 FT</div>
              </div>
              <div className="border-2 border-green-600 p-3 bg-green-50">
                <div className="font-bold mb-1">Approved Green Code:</div>
                <div className="text-lg">G-41 (CANOPY GREEN)</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Estimated Cost:</div>
                <div>$4,850.00</div>
              </div>
            </div>
          </div>
        </div>
      ),
      photo: (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-64 h-64 bg-gradient-to-br from-green-200 to-green-400 border-4 border-green-600 flex items-center justify-center">
              <Image size={64} className="text-green-700" />
            </div>
            <div className="text-sm text-green-700 font-mono">EVIDENCE PHOTO</div>
            <div className="text-xs text-green-600">{file.name}</div>
          </div>
        </div>
      ),
      text: (
        <div className="w-full h-full bg-white border-2 border-green-600 p-6 overflow-auto">
          <div className="font-mono text-xs text-green-800 space-y-2">
            <div>GREENWASH COMPLIANCE DIVISION</div>
            <div>INTERNAL DOCUMENT - CONFIDENTIAL</div>
            <div className="border-t border-green-300 my-4"></div>
            <div>Document: {file.name}</div>
            <div>Generated: {file.date}</div>
            <div className="border-t border-green-300 my-4"></div>
            <div className="leading-relaxed">
              This document contains compliance data and statistics for the specified reporting period. 
              All violations have been catalogued and processed according to Greenwash directive 2037-A.
              Field officers have submitted complete reports for all zones under their jurisdiction.
              Pending actions require supervisor approval before proceeding to remediation phase.
            </div>
          </div>
        </div>
      ),
      report: (
        <div className="w-full h-full bg-white border-2 border-green-600 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">GREENWASH</div>
              <div className="text-sm text-green-600 mt-1">COMPLIANCE DIVISION</div>
            </div>
            <div className="border-2 border-green-600 p-4 bg-green-50">
              <div className="text-lg font-bold text-green-800">QUARTERLY COMPLIANCE REPORT</div>
              <div className="text-sm text-green-600 mt-1">Q1 2037 - Zone Analysis</div>
            </div>
            <div className="space-y-4 text-sm">
              <div className="border-2 border-green-600 p-4">
                <div className="font-bold text-green-700 mb-2">EXECUTIVE SUMMARY</div>
                <div className="text-green-800">Total violations processed: 847</div>
                <div className="text-green-800">Compliance rate: 94.3%</div>
                <div className="text-green-800">Revenue collected: $186,420.00</div>
              </div>
              <div className="border-2 border-green-600 p-4">
                <div className="font-bold text-green-700 mb-2">ZONE PERFORMANCE</div>
                <div className="grid grid-cols-2 gap-2 text-green-800">
                  <div>Zone A: 97.2%</div>
                  <div>Zone B: 95.8%</div>
                  <div>Zone C: 91.4%</div>
                  <div>Zone D: 93.1%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      code: (
        <div className="w-full h-full bg-white border-2 border-green-600 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center text-2xl font-bold text-green-700 mb-6">GREENWASH</div>
            <div className="border-4 border-green-600 p-6 bg-green-50">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-800 mb-2">G-41</div>
                <div className="text-lg text-green-700">CANOPY GREEN</div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">RGB Values:</div>
                <div>R: 34, G: 139, B: 34</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Hex Code:</div>
                <div>#228B22</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Approved Uses:</div>
                <div>Billboards, Signage, Large Structures</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold mb-1">Effective Date:</div>
                <div>12/01/2036</div>
              </div>
            </div>
          </div>
        </div>
      ),
      spreadsheet: (
        <div className="w-full h-full bg-white border-2 border-green-600 p-6 overflow-auto">
          <div className="font-mono text-xs">
            <div className="grid grid-cols-5 gap-px bg-green-600">
              <div className="bg-green-100 p-2 font-bold">ID</div>
              <div className="bg-green-100 p-2 font-bold">Date</div>
              <div className="bg-green-100 p-2 font-bold">Zone</div>
              <div className="bg-green-100 p-2 font-bold">Type</div>
              <div className="bg-green-100 p-2 font-bold">Amount</div>
              
              <div className="bg-white p-2">001</div>
              <div className="bg-white p-2">01/15/2037</div>
              <div className="bg-white p-2">B-EAST</div>
              <div className="bg-white p-2">Billboard</div>
              <div className="bg-white p-2">$4,850</div>
              
              <div className="bg-white p-2">002</div>
              <div className="bg-white p-2">01/16/2037</div>
              <div className="bg-white p-2">C-CHINA</div>
              <div className="bg-white p-2">Vendor</div>
              <div className="bg-white p-2">$220</div>
              
              <div className="bg-white p-2">003</div>
              <div className="bg-white p-2">01/18/2037</div>
              <div className="bg-white p-2">A-NORTH</div>
              <div className="bg-white p-2">Vehicle</div>
              <div className="bg-white p-2">$550</div>
            </div>
          </div>
        </div>
      )
    };

    return previewTypes[file.preview] || previewTypes.text;
  };

  const zoomIn = () => setZoom(Math.min(zoom + 25, 200));
  const zoomOut = () => setZoom(Math.max(zoom - 25, 50));
  const rotate = () => setRotation((rotation + 90) % 360);
  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const currentFiles = files[selectedFolder] || [];
  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : File;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white text-green-800 font-mono shadow-2xl border-2 border-green-600 transition-all duration-300 ${
        isMinimized ? 'w-96 h-16' : 'w-[95vw] h-[90vh] max-w-7xl'
      }`}>
        {/* Header Bar */}
        <div className="border-b-2 border-green-600 bg-white p-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold tracking-wider text-green-700">GREENWASH</div>
            <div className="text-xs text-green-600">FILE SYSTEM</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-green-600">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-green-100 border border-green-600"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-100 border border-red-400 text-red-600"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex h-[calc(90vh-80px)] overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r-2 border-green-600 bg-green-50 overflow-y-auto">
              <div className="p-3">
                <div className="text-xs font-bold text-green-700 mb-3 uppercase tracking-wide">Directories</div>
                <div className="space-y-1">
                  {folders.map(folder => {
                    const Icon = folder.icon;
                    const isSelected = selectedFolder === folder.id;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => {
                          setSelectedFolder(folder.id);
                          setSelectedFile(null);
                        }}
                        className={`w-full flex items-center justify-between p-2 text-left text-sm transition-all ${
                          isSelected 
                            ? 'bg-green-600 text-white' 
                            : 'hover:bg-green-100 text-green-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        <span className={`text-xs ${isSelected ? 'text-green-100' : 'text-green-600'}`}>
                          {folder.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="w-80 border-r-2 border-green-600 bg-white overflow-y-auto">
              <div className="p-3 border-b-2 border-green-600 bg-green-50">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wide">
                  {folders.find(f => f.id === selectedFolder)?.name}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {currentFiles.length} items
                </div>
              </div>
              <div className="divide-y divide-green-300">
                {currentFiles.map((file: FileItem) => {
                  const Icon = getFileIcon(file.type);
                  const isSelected = selectedFile?.id === file.id;
                  return (
                    <button
                      key={file.id}
                      onClick={() => {
                        setSelectedFile(file);
                        resetView();
                      }}
                      className={`w-full p-3 text-left hover:bg-green-50 transition-all ${
                        isSelected ? 'bg-green-100 border-l-4 border-green-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-green-800 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {file.size} • {file.date}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {selectedFile ? (
                <>
                  {/* Preview Header */}
                  <div className="border-b-2 border-green-600 bg-white p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileIcon size={20} className="text-green-600" />
                      <div>
                        <div className="text-sm font-bold text-green-800">{selectedFile.name}</div>
                        <div className="text-xs text-green-600">
                          {selectedFile.size} • {selectedFile.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={zoomOut}
                        className="p-1.5 border-2 border-green-600 hover:bg-green-50"
                        title="Zoom Out"
                      >
                        <ZoomOut size={16} />
                      </button>
                      <div className="text-xs font-bold text-green-700 w-12 text-center">
                        {zoom}%
                      </div>
                      <button
                        onClick={zoomIn}
                        className="p-1.5 border-2 border-green-600 hover:bg-green-50"
                        title="Zoom In"
                      >
                        <ZoomIn size={16} />
                      </button>
                      <button
                        onClick={rotate}
                        className="p-1.5 border-2 border-green-600 hover:bg-green-50"
                        title="Rotate"
                      >
                        <RotateCw size={16} />
                      </button>
                      <button
                        onClick={resetView}
                        className="p-1.5 border-2 border-green-600 hover:bg-green-50"
                        title="Reset View"
                      >
                        <Maximize2 size={16} />
                      </button>
                      <button
                        className="p-1.5 border-2 border-green-600 hover:bg-green-50"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-1.5 border-2 border-red-400 hover:bg-red-50 text-red-600"
                        title="Close"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
                    <div 
                      className="transition-all duration-300 ease-in-out"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: 'center'
                      }}
                    >
                      <div className="shadow-2xl">
                        {getPreviewContent(selectedFile)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-green-600">
                    <File size={64} className="mx-auto mb-4 opacity-30" />
                    <div className="text-sm">Select a file to preview</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Bar */}
        {!isMinimized && (
          <div className="border-t-2 border-green-600 bg-green-50 px-4 py-2 flex items-center justify-between text-xs">
            <div className="text-green-700">
              {currentFiles.length} items in {folders.find(f => f.id === selectedFolder)?.name}
            </div>
            {selectedFile && (
              <div className="text-green-600">
                Viewing: {selectedFile.name}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenwashFinder;
