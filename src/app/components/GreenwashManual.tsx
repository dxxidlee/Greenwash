'use client';

import React, { useState, useRef, useCallback } from 'react';
import { BookOpen, ChevronDown, ChevronRight, AlertTriangle, Scale, Eye, Shield, FileText, X, Search, Minimize2, Maximize2 } from 'lucide-react';
import { useLockBodyScroll } from '../../components/useLockBodyScroll';

interface GreenwashManualProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ManualSection {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

const GreenwashManual: React.FC<GreenwashManualProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('intro');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef<HTMLElement | null>(null);

  useLockBodyScroll(isOpen);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400); // Match animation duration
  }, [onClose]);

  // ESC to close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  // Focus trap (minimal) + restore
  React.useEffect(() => {
    if (isOpen) {
      prevActive.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      prevActive.current?.focus?.();
    }
  }, [isOpen]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const sections: ManualSection[] = [
    {
      id: 'intro',
      title: 'Introduction',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="border-2 border-green-600 bg-green-50 p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-3">GREENWASH COMPLIANCE MANUAL</h2>
            <div className="text-sm text-green-700 space-y-2">
              <p>Edition 4.1 | Effective Date: January 1, 2037</p>
              <p>Classification: OFFICIAL USE ONLY</p>
              <p>Distribution: Compliance Division Personnel</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-green-800">Purpose & Scope</h3>
            <div className="border-l-4 border-green-600 pl-4 text-sm text-green-800 leading-relaxed">
              This manual serves as the definitive reference for all Compliance Division field officers, 
              administrative staff, and authorized personnel operating under the Greenwash Municipal Ordinance 
              of 2031. All visual elements within city limits must conform to approved green specifications 
              unless explicitly exempted by the Supervising Authority.
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-600 p-4 flex gap-3">
              <AlertTriangle className="text-yellow-700 flex-shrink-0" size={20} />
              <div className="text-sm text-yellow-800">
                <div className="font-bold mb-1">CRITICAL NOTICE</div>
                Failure to adhere to protocols outlined in this manual may result in disciplinary action, 
                suspension of field credentials, or termination. All officers are required to complete 
                quarterly compliance certification.
              </div>
            </div>

            <h3 className="text-lg font-bold text-green-800 mt-6">Core Principles</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold text-green-700 text-sm mb-1">UNIFORMITY</div>
                <div className="text-xs text-green-600">All public-facing objects must display approved green hues</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold text-green-700 text-sm mb-1">VISIBILITY</div>
                <div className="text-xs text-green-600">Non-compliant colors disrupt visual harmony</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold text-green-700 text-sm mb-1">COMPLIANCE</div>
                <div className="text-xs text-green-600">Mandatory cooperation with all directives</div>
              </div>
              <div className="border-2 border-green-600 p-3">
                <div className="font-bold text-green-700 text-sm mb-1">ENFORCEMENT</div>
                <div className="text-xs text-green-600">Swift remediation of violations required</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'codes',
      title: 'Green Code Registry',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="border-2 border-green-600 bg-green-50 p-4">
            <h2 className="text-xl font-bold text-green-800 mb-2">APPROVED GREEN CODES</h2>
            <p className="text-xs text-green-600">Updated: January 2037 | Total Codes: 41</p>
          </div>

          <div className="space-y-3">
            {[
              { code: 'G-01', name: 'Forest Green', rgb: '34, 139, 34', hex: '#228B22', use: 'General Purpose' },
              { code: 'G-05', name: 'Vendor Green', rgb: '46, 125, 50', hex: '#2E7D32', use: 'Food Carts, Mobile Vendors' },
              { code: 'G-12', name: 'Vehicle Green', rgb: '27, 94, 32', hex: '#1B5E20', use: 'Personal Vehicles, Taxis' },
              { code: 'G-18', name: 'Building Green', rgb: '56, 142, 60', hex: '#388E3C', use: 'Exterior Walls, Facades' },
              { code: 'G-23', name: 'Signage Green', rgb: '67, 160, 71', hex: '#43A047', use: 'Commercial Signs, Billboards' },
              { code: 'G-29', name: 'Bench Green', rgb: '76, 175, 80', hex: '#4CAF50', use: 'Public Seating, Street Furniture' },
              { code: 'G-35', name: 'Infrastructure Green', rgb: '102, 187, 106', hex: '#66BB6A', use: 'Bridges, Utilities' },
              { code: 'G-41', name: 'Canopy Green', rgb: '129, 199, 132', hex: '#81C784', use: 'Awnings, Large Structures' }
            ].map(code => (
              <div key={code.code} className="border-2 border-green-600 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-lg font-bold text-green-800">{code.code}</div>
                    <div className="text-sm text-green-700">{code.name}</div>
                  </div>
                  <div 
                    className="w-16 h-16 border-2 border-green-800 flex-shrink-0"
                    style={{ backgroundColor: code.hex }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-green-600 font-bold">RGB:</div>
                    <div className="text-green-800 font-mono">{code.rgb}</div>
                  </div>
                  <div>
                    <div className="text-green-600 font-bold">HEX:</div>
                    <div className="text-green-800 font-mono">{code.hex}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-green-600 font-bold">Approved Use:</div>
                    <div className="text-green-800">{code.use}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-red-50 border-2 border-red-600 p-4">
            <div className="font-bold text-red-800 text-sm mb-2">PROHIBITED COLORS</div>
            <div className="text-xs text-red-700 space-y-1">
              <p>• RED (all shades) - Competing visual priority</p>
              <p>• BLUE (all shades) - Non-compliant hue family</p>
              <p>• YELLOW (all shades) - Visual disruption</p>
              <p>• ORANGE (all shades) - Unauthorized warmth</p>
              <p>• PURPLE (all shades) - Non-standard chromatic value</p>
              <p>• Any color not listed in the approved Green Code Registry</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'procedures',
      title: 'Field Procedures',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div className="border-2 border-green-600 bg-green-50 p-4">
            <h2 className="text-xl font-bold text-green-800">STANDARD OPERATING PROCEDURES</h2>
          </div>

          {[
            {
              id: 'inspection',
              title: 'Section 3.1 - Inspection Protocol',
              items: [
                'Officer must verify zone assignment before beginning patrol',
                'Visual inspection must occur from minimum distance of 15 feet',
                'Document all non-compliant objects with photographic evidence',
                'Cross-reference object color against approved Green Code Registry',
                'Record exact location using municipal grid coordinates',
                'Complete inspection log within 2 hours of observation'
              ]
            },
            {
              id: 'violation',
              title: 'Section 3.2 - Violation Documentation',
              items: [
                'Issue Noncompliance Violation Ticket (Form UN-2037)',
                'Photograph object from minimum 3 angles',
                'Measure object dimensions for replacement estimation',
                'Identify owner/operator if present',
                'Assess severity level: Minor, Major, or Critical',
                'Submit ticket to Compliance Tribunal within 24 hours',
                'Affix notice of violation to object if safe to do so'
              ]
            },
            {
              id: 'authorization',
              title: 'Section 3.3 - Authorization Processing',
              items: [
                'Complete Authorization Form (Form 002942-GM series)',
                'Obtain Supervising Authority approval signature',
                'Coordinate with approved green paint vendors',
                'Schedule remediation within compliance window',
                'Verify completion with post-remediation inspection',
                'Submit final documentation with before/after photos',
                'Close case file in central database'
              ]
            },
            {
              id: 'enforcement',
              title: 'Section 3.4 - Enforcement Escalation',
              items: [
                'First offense: Warning + 7-day compliance period',
                'Second offense: Fine + mandatory immediate recoloring',
                'Third offense: Fine escalation + confiscation authority',
                'Critical violations: Immediate remediation order',
                'Repeat offenders: Referral to Compliance Tribunal',
                'Officer may request backup for hostile situations',
                'Emergency authority protocols apply for public safety threats'
              ]
            }
          ].map(section => (
            <div key={section.id} className="border-2 border-green-600">
              <button
                onClick={() => toggleItem(section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
              >
                <div className="font-bold text-green-800 text-sm">{section.title}</div>
                {expandedItems[section.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              {expandedItems[section.id] && (
                <div className="p-4 border-t-2 border-green-600 bg-white">
                  <ul className="space-y-2 text-xs text-green-800">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-green-600 font-bold">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'penalties',
      title: 'Penalty Structure',
      icon: Scale,
      content: (
        <div className="space-y-4">
          <div className="border-2 border-green-600 bg-green-50 p-4">
            <h2 className="text-xl font-bold text-green-800">FINE SCHEDULE & PENALTIES</h2>
            <p className="text-xs text-green-600 mt-1">Updated: January 1, 2037</p>
          </div>

          <div className="space-y-3">
            <div className="border-2 border-green-600 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-green-800">MINOR VIOLATIONS</div>
                <div className="text-sm text-green-600">Severity Level: 1</div>
              </div>
              <div className="space-y-2 text-xs text-green-800">
                <div className="flex justify-between border-b border-green-300 pb-1">
                  <span>Small object (under 2 sq ft)</span>
                  <span className="font-bold">$50 - $150</span>
                </div>
                <div className="flex justify-between border-b border-green-300 pb-1">
                  <span>Medium object (2-20 sq ft)</span>
                  <span className="font-bold">$150 - $350</span>
                </div>
                <div className="flex justify-between">
                  <span>First-time offender discount</span>
                  <span className="font-bold text-green-600">-25%</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-orange-600 p-4 bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-orange-800">MAJOR VIOLATIONS</div>
                <div className="text-sm text-orange-600">Severity Level: 2</div>
              </div>
              <div className="space-y-2 text-xs text-orange-800">
                <div className="flex justify-between border-b border-orange-300 pb-1">
                  <span>Large object (20-100 sq ft)</span>
                  <span className="font-bold">$500 - $2,000</span>
                </div>
                <div className="flex justify-between border-b border-orange-300 pb-1">
                  <span>Vehicle non-compliance</span>
                  <span className="font-bold">$750 - $1,500</span>
                </div>
                <div className="flex justify-between border-b border-orange-300 pb-1">
                  <span>Commercial signage</span>
                  <span className="font-bold">$1,000 - $3,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Mandatory immediate recoloring</span>
                  <span className="font-bold text-orange-600">REQUIRED</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-red-600 p-4 bg-red-50">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-red-800">CRITICAL VIOLATIONS</div>
                <div className="text-sm text-red-600">Severity Level: 3</div>
              </div>
              <div className="space-y-2 text-xs text-red-800">
                <div className="flex justify-between border-b border-red-300 pb-1">
                  <span>Massive structure (100+ sq ft)</span>
                  <span className="font-bold">$5,000 - $25,000</span>
                </div>
                <div className="flex justify-between border-b border-red-300 pb-1">
                  <span>Billboard/public advertising</span>
                  <span className="font-bold">$10,000 - $50,000</span>
                </div>
                <div className="flex justify-between border-b border-red-300 pb-1">
                  <span>Building facade non-compliance</span>
                  <span className="font-bold">$25,000 - $100,000</span>
                </div>
                <div className="flex justify-between border-b border-red-300 pb-1">
                  <span>Willful resistance to remediation</span>
                  <span className="font-bold">$50,000 + confiscation</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency remediation order</span>
                  <span className="font-bold text-red-600">IMMEDIATE</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-purple-600 p-4 bg-purple-50">
              <div className="font-bold text-purple-800 mb-3">REPEAT OFFENDER ESCALATION</div>
              <div className="space-y-2 text-xs text-purple-800">
                <div className="flex justify-between">
                  <span>2nd offense within 12 months</span>
                  <span className="font-bold">Fine × 2</span>
                </div>
                <div className="flex justify-between">
                  <span>3rd offense within 12 months</span>
                  <span className="font-bold">Fine × 3 + 30-day remediation duty</span>
                </div>
                <div className="flex justify-between">
                  <span>4+ offenses within 12 months</span>
                  <span className="font-bold">Permanent suspension + asset confiscation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 border-2 border-gray-600 p-4">
            <div className="font-bold text-gray-800 text-sm mb-2">PAYMENT & APPEALS</div>
            <div className="text-xs text-gray-700 space-y-1">
              <p>• Payment due within 30 days of violation notice</p>
              <p>• Appeals must be filed within 7 days to Compliance Tribunal</p>
              <p>• Failure to pay results in escalation to collections + license suspension</p>
              <p>• Community service option available for qualifying offenders</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'authority',
      title: 'Officer Authority',
      icon: Eye,
      content: (
        <div className="space-y-4">
          <div className="border-2 border-green-600 bg-green-50 p-4">
            <h2 className="text-xl font-bold text-green-800">COMPLIANCE OFFICER AUTHORITY</h2>
          </div>

          <div className="border-2 border-green-600 p-4">
            <h3 className="font-bold text-green-800 mb-3">GRANTED POWERS</h3>
            <div className="space-y-3 text-sm text-green-800">
              <div className="border-l-4 border-green-600 pl-3">
                <div className="font-bold mb-1">Visual Inspection Rights</div>
                <div className="text-xs">Officers may inspect any publicly visible object within assigned zone without warrant or prior notice.</div>
              </div>
              <div className="border-l-4 border-green-600 pl-3">
                <div className="font-bold mb-1">Citation Authority</div>
                <div className="text-xs">Officers may issue Noncompliance Violation Tickets (NVT) for any violation observed during active duty.</div>
              </div>
              <div className="border-l-4 border-green-600 pl-3">
                <div className="font-bold mb-1">Immediate Remediation Orders</div>
                <div className="text-xs">For Critical violations, officers may order immediate recoloring or temporary covering of non-compliant objects.</div>
              </div>
              <div className="border-l-4 border-green-600 pl-3">
                <div className="font-bold mb-1">Confiscation Rights</div>
                <div className="text-xs">Small objects (under 10 sq ft) may be confiscated for repeat offenses or willful non-compliance.</div>
              </div>
              <div className="border-l-4 border-green-600 pl-3">
                <div className="font-bold mb-1">Database Access</div>
                <div className="text-xs">Officers have read/write access to Central Compliance Database for violation history and tracking.</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-red-600 p-4 bg-red-50">
            <h3 className="font-bold text-red-800 mb-3">LIMITATIONS & RESTRICTIONS</h3>
            <div className="space-y-3 text-sm text-red-800">
              <div className="border-l-4 border-red-600 pl-3">
                <div className="font-bold mb-1">No Interior Access</div>
                <div className="text-xs">Officers may NOT enter private property without owner consent or judicial warrant.</div>
              </div>
              <div className="border-l-4 border-red-600 pl-3">
                <div className="font-bold mb-1">Zone Boundaries</div>
                <div className="text-xs">Officers may only operate within assigned zones. Cross-zone enforcement requires supervisor approval.</div>
              </div>
              <div className="border-l-4 border-red-600 pl-3">
                <div className="font-bold mb-1">Use of Force</div>
                <div className="text-xs">Officers have NO authority to use physical force. Police assistance required for hostile situations.</div>
              </div>
              <div className="border-l-4 border-red-600 pl-3">
                <div className="font-bold mb-1">Fine Modifications</div>
                <div className="text-xs">Officers may NOT negotiate or modify fine amounts. All penalties follow published schedule.</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-yellow-600 p-4 bg-yellow-50">
            <h3 className="font-bold text-yellow-800 mb-3">ETHICAL GUIDELINES</h3>
            <ul className="space-y-2 text-xs text-yellow-800">
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Officers must remain impartial and enforce regulations uniformly regardless of personal relationships</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Acceptance of bribes or favors results in immediate termination and criminal prosecution</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Officers must report suspected corruption within the division to Internal Affairs</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Respectful treatment of all citizens required. Harassment or discrimination prohibited</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>Officers must complete mandatory quarterly ethics training</span>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  if (!isOpen) return null;

  return (
    <>
      {/* Exit X — positioned at top right corner of screen, completely separate */}
      <button
        onClick={handleClose}
        aria-label="Close"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 200
        }}
        className={`
          inline-flex items-center justify-center
          h-12 w-12
          rounded-full
          shadow-[0_2px_12px_rgba(0,0,0,0.06)]
          bg-[rgba(0,143,70,0.3)]
          noise-surface
          text-white
          hover:bg-[rgba(0,143,70,0.4)]
          transition-all duration-500 ease-out
          focus:outline-none focus:ring-2 focus:ring-white/30
          ${isClosing ? 'animate-[fadeOutScale_0.4s_ease-in_forwards]' : 'opacity-0 scale-95 animate-[fadeInScale_0.4s_ease-out_0.08s_forwards]'}
        `}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div
        ref={backdropRef}
        onClick={handleClose}
        aria-hidden={false}
        aria-modal="true"
        role="dialog"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent"
      >
        {/* Full screen blur layer with smooth animation */}
        <div 
          className={`
            fixed inset-0
            backdrop-blur-md md:backdrop-blur-lg
            supports-[backdrop-filter]:backdrop-saturate-150
            supports-[backdrop-filter]:backdrop-contrast-100
            backdrop-boost no-blur-fallback
            ${isClosing ? 'animate-[fadeOut_0.32s_ease-in_forwards]' : 'opacity-0 animate-[fadeIn_0.32s_ease-out_forwards]'}
          `}
        />

        {/* Manual container - no visible container */}
        <div
          ref={panelRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={`
            relative z-10
            w-[92vw] sm:w-[86vw] md:w-auto
            h-screen
            max-w-[32rem] md:max-w-[34rem]
            focus:outline-none
            ${isClosing ? 'animate-[fadeOutScaleDown_0.4s_ease-in_forwards]' : 'opacity-0 scale-95 translate-y-4 animate-[fadeInScaleUp_0.4s_ease-out_0.16s_forwards]'}
          `}
        >
        {/* Scrollable manual content with top/bottom spacing */}
        <div className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar">
          <div className="pt-20 pb-20 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Manual Header */}
            <article
              className={`
                relative
                rounded-2xl md:rounded-[24px]
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                bg-[rgba(0,143,70,0.3)]
                noise-surface
                p-4 sm:p-5 md:p-6
                scroll-mt-6
                opacity-0 translate-y-4
                animate-[fadeInUp_0.32s_ease-out_forwards]
              `}
            >
              <div className="text-center">
                <div className="text-sm tracking-wide uppercase text-white mb-2">GREENWASH COMPLIANCE MANUAL</div>
                <h1 className="text-xl font-bold text-white mb-2">Officer Reference Guide</h1>
                <div className="text-sm text-white">Edition 4.1 • January 2037</div>
              </div>
            </article>

            {/* Search */}
            <article
              className={`
                relative
                rounded-2xl md:rounded-[24px]
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                bg-[rgba(0,143,70,0.3)]
                noise-surface
                p-4 sm:p-5 md:p-6
                scroll-mt-6
                opacity-0 translate-y-4
                animate-[fadeInUp_0.32s_ease-out_forwards]
              `}
              style={{ animationDelay: '100ms' }}
            >
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
                <input
                  type="text"
                  placeholder="Search manual..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[rgba(0,143,70,0.2)] border border-white/30 text-white text-sm focus:outline-none focus:border-white rounded"
                />
              </div>
            </article>

            {/* Sections Navigation */}
            <article
              className={`
                relative
                rounded-2xl md:rounded-[24px]
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                bg-[rgba(0,143,70,0.3)]
                noise-surface
                p-4 sm:p-5 md:p-6
                scroll-mt-6
                opacity-0 translate-y-4
                animate-[fadeInUp_0.32s_ease-out_forwards]
              `}
              style={{ animationDelay: '200ms' }}
            >
              <div className="mb-4">
                <div className="text-sm font-bold text-white mb-3">Table of Contents:</div>
                <div className="space-y-2">
                  {sections.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-2 p-3 text-left transition-all rounded-lg ${
                          isActive 
                            ? 'bg-[rgba(0,143,70,0.5)] text-white' 
                            : 'bg-[rgba(0,143,70,0.2)] hover:bg-[rgba(0,143,70,0.4)] text-white'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{section.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>

            {/* Current Section Content */}
            {currentSection && (
              <article
                className={`
                  relative
                  rounded-2xl md:rounded-[24px]
                  shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                  bg-[rgba(0,143,70,0.3)]
                  noise-surface
                  p-4 sm:p-5 md:p-6
                  scroll-mt-6
                  opacity-0 translate-y-4
                  animate-[fadeInUp_0.32s_ease-out_forwards]
                `}
                style={{ animationDelay: '300ms' }}
              >
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white mb-4">{currentSection.title}</h2>
                  <div className="text-sm text-white leading-relaxed">
                    {currentSection.content}
                  </div>
                </div>
              </article>
            )}

            {/* Quick Reference */}
            <article
              className={`
                relative
                rounded-2xl md:rounded-[24px]
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                bg-[rgba(0,143,70,0.3)]
                noise-surface
                p-4 sm:p-5 md:p-6
                scroll-mt-6
                opacity-0 translate-y-4
                animate-[fadeInUp_0.32s_ease-out_forwards]
              `}
              style={{ animationDelay: '400ms' }}
            >
              <div className="mb-4">
                <div className="text-sm font-bold text-white mb-3">Quick Reference:</div>
                <div className="space-y-2 text-xs text-white">
                  <div className="flex justify-between">
                    <span>Total Codes:</span>
                    <span className="font-bold">41</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Zones:</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="font-bold">Jan 2037</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default GreenwashManual;
