'use client';

import React, { useState } from 'react';
import { Maximize2, CheckCircle, Trash2, X, Minimize2 } from 'lucide-react';

interface GreenwashFormsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GreenwashForms: React.FC<GreenwashFormsProps> = ({ isOpen, onClose }) => {
  const [leftSize, setLeftSize] = useState(50);
  const [authSubmitted, setAuthSubmitted] = useState(false);
  const [violationSubmitted, setViolationSubmitted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const emptyAuthForm = {
    permitId: '',
    dateIssued: '',
    fieldOfficer: '',
    workerId: '',
    assignedZone: '',
    objectType: 'billboard',
    location: '',
    dimensions: '',
    existingColor: '',
    approvedGreenCode: '',
    authorizedAction: 'replace',
    observations: '',
    estimatedCost: '',
    expectedDate: '',
    officerSignature: '',
    supervisingAuthority: ''
  };

  const emptyViolationForm = {
    ticketNo: '',
    date: '',
    zone: '',
    name: '',
    objectType: 'other',
    location: '',
    currentColor: '',
    approvedGreenCode: '',
    violations: {
      notPaintedGreen: false,
      unauthorizedNonGreen: false,
      displayCompetingColors: false,
      obstruction: false
    },
    fine: '',
    description: '',
    severity: 'minor',
    officer: ''
  };

  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [violationForm, setViolationForm] = useState(emptyViolationForm);
  const [activeExamples, setActiveExamples] = useState(true);

  const examples = [
    {
      name: "Billboard Replacement - Pike Slip",
      type: "auth",
      data: {
        permitId: "002942-GM",
        dateIssued: "01/22/2037",
        fieldOfficer: "D. LEE",
        workerId: "229-B",
        assignedZone: "ZONE B-EAST RIVER",
        objectType: "billboard",
        location: "SOUTH ST & PIKE SLIP",
        dimensions: "30 FT X 20 FT",
        existingColor: "SKY BLUE WITH YELLOW",
        approvedGreenCode: "G-41 (CANOPY GREEN)",
        authorizedAction: "replace",
        observations: "BILLBOARD IN UNAUTHORIZED COLORS. FULL REPLACEMENT REQUIRED FOR VISIBILITY.",
        estimatedCost: "4,850.00",
        expectedDate: "02/05/2037",
        officerSignature: "D. LEE",
        supervisingAuthority: "J. ALVAREZ"
      }
    },
    {
      name: "Vendor Cart Violation - Canal St",
      type: "violation",
      data: {
        ticketNo: "UN-2037-032",
        date: "01/28/2037",
        zone: "C-CHINATOWN",
        name: "MERCHANT CART - L. WONG",
        objectType: "other",
        location: "CANAL ST & MOTT ST",
        currentColor: "RED W/ WHITE",
        approvedGreenCode: "G-05 (VENDOR)",
        violations: {
          notPaintedGreen: true,
          unauthorizedNonGreen: false,
          displayCompetingColors: true,
          obstruction: false
        },
        fine: "220.00",
        description: "UNAUTHORIZED RED UMBRELLA CANOPY ON ACTIVE VENDOR CART, CREATING VISUAL DISRUPTION.",
        severity: "minor",
        officer: "D.LEE (229-B)"
      }
    }
  ];

  const loadExample = (example: any) => {
    if (example.type === 'auth') {
      setAuthForm(example.data);
    } else {
      setViolationForm(example.data);
    }
  };

  const clearAuthForm = () => {
    setAuthForm(emptyAuthForm);
  };

  const clearViolationForm = () => {
    setViolationForm(emptyViolationForm);
  };

  const expandLeft = () => setLeftSize(70);
  const expandRight = () => setLeftSize(30);
  const reset = () => setLeftSize(50);

  const handleAuthSubmit = () => {
    setAuthSubmitted(true);
    setTimeout(() => {
      setAuthSubmitted(false);
      setAuthForm(emptyAuthForm);
    }, 1000);
  };

  const handleViolationSubmit = () => {
    setViolationSubmitted(true);
    setTimeout(() => {
      setViolationSubmitted(false);
      setViolationForm(emptyViolationForm);
    }, 1000);
  };

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
            <div className="text-xs text-green-600">COMPLIANCE DIVISION</div>
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
          <>
            {/* Examples Bar */}
            {activeExamples && (
              <div className="border-b border-green-300 bg-green-50 p-3 flex gap-2 overflow-x-auto items-center">
                <div className="text-xs text-green-700 mr-2 flex items-center whitespace-nowrap font-bold">LOAD EXAMPLE:</div>
                {examples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadExample(example)}
                    className="text-xs px-3 py-1.5 border border-green-600 bg-white hover:bg-green-100 transition-all whitespace-nowrap"
                  >
                    {example.name}
                  </button>
                ))}
                <button
                  onClick={() => setActiveExamples(false)}
                  className="ml-auto text-xs px-3 py-1.5 border border-red-400 bg-white hover:bg-red-50 text-red-600 transition-all whitespace-nowrap flex items-center gap-1"
                >
                  <X size={14} />
                  Hide Examples
                </button>
              </div>
            )}

            {!activeExamples && (
              <div className="border-b border-green-300 bg-green-50 p-2 flex justify-center">
                <button
                  onClick={() => setActiveExamples(true)}
                  className="text-xs px-3 py-1.5 border border-green-600 bg-white hover:bg-green-100 transition-all"
                >
                  Show Examples
                </button>
              </div>
            )}

            {/* Main Split View */}
            <div className="flex h-[calc(90vh-120px)]">
              {/* Left Form - Authorization */}
              <div 
                className="border-r-2 border-green-300 overflow-y-auto transition-all duration-500 ease-in-out bg-white"
                style={{ width: `${leftSize}%` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-green-700">AUTHORIZATION FORM</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={clearAuthForm} 
                        className="p-1.5 hover:bg-green-100 border border-green-600 flex items-center gap-1 px-2 text-xs"
                        title="Clear form"
                      >
                        <Trash2 size={14} />
                        Clear
                      </button>
                      <button onClick={expandLeft} className="p-1.5 hover:bg-green-100 border border-green-600">
                        <Maximize2 size={16} />
                      </button>
                      {leftSize !== 50 && (
                        <button onClick={reset} className="text-xs px-2 py-1 border border-green-600 hover:bg-green-100">
                          RESET
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">PERMIT ID NO:</label>
                        <input
                          type="text"
                          value={authForm.permitId}
                          onChange={(e) => setAuthForm({...authForm, permitId: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">DATE ISSUED:</label>
                        <input
                          type="text"
                          value={authForm.dateIssued}
                          onChange={(e) => setAuthForm({...authForm, dateIssued: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">FIELD OFFICER:</label>
                        <input
                          type="text"
                          value={authForm.fieldOfficer}
                          onChange={(e) => setAuthForm({...authForm, fieldOfficer: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">WORKER ID #:</label>
                        <input
                          type="text"
                          value={authForm.workerId}
                          onChange={(e) => setAuthForm({...authForm, workerId: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">ASSIGNED ZONE:</label>
                      <input
                        type="text"
                        value={authForm.assignedZone}
                        onChange={(e) => setAuthForm({...authForm, assignedZone: e.target.value})}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-2">TYPE OF OBJECT:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['vehicle', 'bench', 'billboard', 'building', 'other'].map(type => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="authObjectType"
                              value={type}
                              checked={authForm.objectType === type}
                              onChange={(e) => setAuthForm({...authForm, objectType: e.target.value})}
                              className="accent-green-600"
                            />
                            <span className="text-xs uppercase">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">LOCATION ADDRESS:</label>
                      <input
                        type="text"
                        value={authForm.location}
                        onChange={(e) => setAuthForm({...authForm, location: e.target.value})}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">DIMENSIONS/SIZE:</label>
                        <input
                          type="text"
                          value={authForm.dimensions}
                          onChange={(e) => setAuthForm({...authForm, dimensions: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">EXISTING COLOR:</label>
                        <input
                          type="text"
                          value={authForm.existingColor}
                          onChange={(e) => setAuthForm({...authForm, existingColor: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">APPROVED GREEN CODE:</label>
                      <input
                        type="text"
                        value={authForm.approvedGreenCode}
                        onChange={(e) => setAuthForm({...authForm, approvedGreenCode: e.target.value})}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-2">AUTHORIZED ACTION:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['applyGreenPaint', 'replace', 'confiscate', 'other'].map(action => (
                          <label key={action} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="authorizedAction"
                              value={action}
                              checked={authForm.authorizedAction === action}
                              onChange={(e) => setAuthForm({...authForm, authorizedAction: e.target.value})}
                              className="accent-green-600"
                            />
                            <span className="text-xs uppercase">{action.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">INSPECTOR OBSERVATIONS:</label>
                      <textarea
                        value={authForm.observations}
                        onChange={(e) => setAuthForm({...authForm, observations: e.target.value})}
                        rows={3}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">ESTIMATED COST:</label>
                        <input
                          type="text"
                          value={authForm.estimatedCost}
                          onChange={(e) => setAuthForm({...authForm, estimatedCost: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">EXPECTED DATE:</label>
                        <input
                          type="text"
                          value={authForm.expectedDate}
                          onChange={(e) => setAuthForm({...authForm, expectedDate: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">FIELD OFFICER SIGNATURE:</label>
                        <input
                          type="text"
                          value={authForm.officerSignature}
                          onChange={(e) => setAuthForm({...authForm, officerSignature: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">SUPERVISING AUTHORITY:</label>
                        <input
                          type="text"
                          value={authForm.supervisingAuthority}
                          onChange={(e) => setAuthForm({...authForm, supervisingAuthority: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleAuthSubmit}
                        disabled={authSubmitted}
                        className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 border-2 border-green-800 text-white font-bold transition-all text-sm tracking-wider disabled:opacity-50"
                      >
                        {authSubmitted ? (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle size={16} />
                            SUBMITTED
                          </span>
                        ) : (
                          'SUBMIT AUTHORIZATION FORM'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Form - Violation */}
              <div 
                className="overflow-y-auto transition-all duration-500 ease-in-out bg-white"
                style={{ width: `${100 - leftSize}%` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-green-700">NONCOMPLIANCE VIOLATION TICKET</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={clearViolationForm} 
                        className="p-1.5 hover:bg-green-100 border border-green-600 flex items-center gap-1 px-2 text-xs"
                        title="Clear form"
                      >
                        <Trash2 size={14} />
                        Clear
                      </button>
                      <button onClick={expandRight} className="p-1.5 hover:bg-green-100 border border-green-600">
                        <Maximize2 size={16} />
                      </button>
                      {leftSize !== 50 && (
                        <button onClick={reset} className="text-xs px-2 py-1 border border-green-600 hover:bg-green-100">
                          RESET
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">TICKET NO:</label>
                        <input
                          type="text"
                          value={violationForm.ticketNo}
                          onChange={(e) => setViolationForm({...violationForm, ticketNo: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">DATE:</label>
                        <input
                          type="text"
                          value={violationForm.date}
                          onChange={(e) => setViolationForm({...violationForm, date: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">ZONE:</label>
                        <input
                          type="text"
                          value={violationForm.zone}
                          onChange={(e) => setViolationForm({...violationForm, zone: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">NAME (IF APPLICABLE):</label>
                      <input
                        type="text"
                        value={violationForm.name}
                        onChange={(e) => setViolationForm({...violationForm, name: e.target.value})}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-2">OBJECT TYPE:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['vehicle', 'bench', 'billboard', 'other'].map(type => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="violationObjectType"
                              value={type}
                              checked={violationForm.objectType === type}
                              onChange={(e) => setViolationForm({...violationForm, objectType: e.target.value})}
                              className="accent-green-600"
                            />
                            <span className="text-xs uppercase">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">LOCATION:</label>
                      <input
                        type="text"
                        value={violationForm.location}
                        onChange={(e) => setViolationForm({...violationForm, location: e.target.value})}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">CURRENT COLOR:</label>
                        <input
                          type="text"
                          value={violationForm.currentColor}
                          onChange={(e) => setViolationForm({...violationForm, currentColor: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-green-700 font-bold block mb-1">APPROVED GREEN CODE:</label>
                        <input
                          type="text"
                          value={violationForm.approvedGreenCode}
                          onChange={(e) => setViolationForm({...violationForm, approvedGreenCode: e.target.value})}
                          className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-2">NATURE OF VIOLATION:</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={violationForm.violations.notPaintedGreen}
                            onChange={(e) => setViolationForm({
                              ...violationForm,
                              violations: {...violationForm.violations, notPaintedGreen: e.target.checked}
                            })}
                            className="accent-green-600"
                          />
                          <span className="text-xs">Object not painted green</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={violationForm.violations.unauthorizedNonGreen}
                            onChange={(e) => setViolationForm({
                              ...violationForm,
                              violations: {...violationForm.violations, unauthorizedNonGreen: e.target.checked}
                            })}
                            className="accent-green-600"
                          />
                          <span className="text-xs">Unauthorized non-green replacement</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={violationForm.violations.displayCompetingColors}
                            onChange={(e) => setViolationForm({
                              ...violationForm,
                              violations: {...violationForm.violations, displayCompetingColors: e.target.checked}
                            })}
                            className="accent-green-600"
                          />
                          <span className="text-xs">Display of competing colors (red, blue, etc.)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={violationForm.violations.obstruction}
                            onChange={(e) => setViolationForm({
                              ...violationForm,
                              violations: {...violationForm.violations, obstruction: e.target.checked}
                            })}
                            className="accent-green-600"
                          />
                          <span className="text-xs">Obstruction of greening operations</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">FINE: $</label>
                      <input
                        type="text"
                        value={violationForm.fine}
                        onChange={(e) => setViolationForm({...violationForm, fine: e.target.value})}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">BRIEF DESCRIPTION:</label>
                      <textarea
                        value={violationForm.description}
                        onChange={(e) => setViolationForm({...violationForm, description: e.target.value})}
                        rows={3}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-2">SEVERITY:</label>
                      <div className="flex gap-4">
                        {['minor', 'major', 'critical'].map(sev => (
                          <label key={sev} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="severity"
                              value={sev}
                              checked={violationForm.severity === sev}
                              onChange={(e) => setViolationForm({...violationForm, severity: e.target.value})}
                              className="accent-green-600"
                            />
                            <span className="text-xs uppercase">{sev}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-green-700 font-bold block mb-1">OFFICER:</label>
                      <input
                        type="text"
                        value={violationForm.officer}
                        onChange={(e) => setViolationForm({...violationForm, officer: e.target.value})}
                        className="w-full bg-white border-2 border-green-600 p-2 text-sm focus:border-green-700 outline-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleViolationSubmit}
                        disabled={violationSubmitted}
                        className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 border-2 border-green-800 text-white font-bold transition-all text-sm tracking-wider disabled:opacity-50"
                      >
                        {violationSubmitted ? (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle size={16} />
                            SUBMITTED
                          </span>
                        ) : (
                          'SUBMIT VIOLATION TICKET'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GreenwashForms;
