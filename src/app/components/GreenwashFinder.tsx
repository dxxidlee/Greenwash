'use client';

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface GreenwashFinderProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Item {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  status?: string;
}

const GreenwashFinder: React.FC<GreenwashFinderProps> = ({ isOpen, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filters = [
    { id: 'violations', label: 'Violations' },
    { id: 'authorizations', label: 'Authorizations' },
    { id: 'reports', label: 'Reports' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'codes', label: 'Codes' },
    { id: 'archived', label: 'Archived' }
  ];

  const items: Item[] = [
    { id: 1, title: 'Vendor Cart Violation', subtitle: 'UN-2037-032', category: 'violations', date: '01/28/2037', status: 'New' },
    { id: 2, title: 'Billboard Authorization', subtitle: '002942-GM', category: 'authorizations', date: '01/22/2037' },
    { id: 3, title: 'Canal Street Evidence', subtitle: 'Photo Documentation', category: 'evidence', date: '01/28/2037' },
    { id: 4, title: 'Q1 Compliance Report', subtitle: 'Zone B-East River', category: 'reports', date: '01/31/2037' },
    { id: 5, title: 'Green Code G-41', subtitle: 'Canopy Green', category: 'codes', date: '12/01/2036' },
    { id: 6, title: 'Pike Slip Authorization', subtitle: '002943-GM', category: 'authorizations', date: '01/23/2037' },
    { id: 7, title: 'Violation Stats Q1', subtitle: 'Spreadsheet', category: 'reports', date: '01/15/2037' },
    { id: 8, title: 'Chinatown Zone Report', subtitle: 'Compliance Analysis', category: 'reports', date: '01/30/2037' },
    { id: 9, title: 'Green Code G-05', subtitle: 'Vendor Green', category: 'codes', date: '12/01/2036' },
    { id: 10, title: 'Evidence Photo 001', subtitle: 'IMG_2037_0128_001', category: 'evidence', date: '01/28/2037' },
    { id: 11, title: 'Evidence Photo 002', subtitle: 'IMG_2037_0128_002', category: 'evidence', date: '01/28/2037' },
    { id: 12, title: 'Monthly Summary Jan', subtitle: 'Text Document', category: 'archived', date: '01/31/2037' }
  ];

  const filteredItems = selectedFilter === 'all' 
    ? items 
    : items.filter(item => item.category === selectedFilter);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4"
    >
      {/* Blur backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-md md:backdrop-blur-lg"
        onClick={onClose}
      />
      
      {/* Content */}
      <div 
        className="relative w-full h-[90vh] z-10"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}
      >
        {/* Close button */}
      <button
          onClick={onClose}
          className="fixed top-4 right-4 z-60 p-3 rounded-full transition-all"
        style={{
            backgroundColor: 'rgba(0, 143, 70, 0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid #FFFFFF'
          }}
        >
          <X size={20} color="#FFFFFF" />
      </button>

        {/* Scrollable content */}
        <div 
          className="overflow-y-auto hide-scrollbar h-full"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>
                Greenwash File System
              </h1>
              <p className="text-sm text-white opacity-80">
                Compliance Files & Records
              </p>
              </div>

            {/* Filter Pills */}
            <div className="flex justify-center mb-12">
              <div className={`flex gap-3 flex-wrap transition-all duration-300 ease-out ${
                showFilters ? 'justify-start' : 'justify-center'
              }`}>
              {/* Main trigger button - moves to left when filters show */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 rounded-full font-medium"
                style={{
                  backgroundColor: showFilters ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 143, 70, 0.3)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: showFilters ? '1px solid #008F46' : '1px solid rgba(255, 255, 255, 0.3)',
                  color: showFilters ? '#008F46' : '#FFFFFF',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                What are you looking for? →
              </button>

              {/* Filter options - staggered spring fade-up reveal */}
              {filters.map((filter, index) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-6 py-3 rounded-full font-medium ${
                    showFilters ? '' : 'pointer-events-none'
                  }`}
                  style={{
                    backgroundColor: selectedFilter === filter.id ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 143, 70, 0.3)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: selectedFilter === filter.id ? '1px solid #008F46' : '1px solid rgba(255, 255, 255, 0.3)',
                    color: selectedFilter === filter.id ? '#008F46' : '#FFFFFF',
                    opacity: showFilters ? 1 : 0,
                    transform: showFilters ? 'translateY(0)' : 'translateY(6px)',
                    transition: `all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`,
                    transitionDelay: showFilters ? `${(index + 1) * 40}ms` : `${(filters.length - index) * 20}ms`
                  }}
                >
                  {filter.label}
                </button>
              ))}
              </div>
            </div>

            {/* Grid of items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  <div 
                    className="rounded-2xl overflow-hidden mb-3 relative"
                    style={{
                      backgroundColor: 'rgba(0, 143, 70, 0.3)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      aspectRatio: '1/1'
                    }}
                  >
                    {/* Placeholder for image */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-white opacity-50 text-xs">
                        {item.category.toUpperCase()}
                      </div>
                    </div>

                    {/* Status badge */}
                    {item.status && (
                      <div 
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          color: '#008F46'
                        }}
                      >
                        {item.status}
                  </div>
                    )}
                  </div>

                  {/* Item info */}
                  <div className="px-2">
                    <h3 className="text-white font-medium text-sm mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white opacity-70 text-xs mb-1">
                      {item.subtitle}
                    </p>
                    <p className="text-white opacity-50 text-xs">
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white opacity-50">
                  No items found in this category
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
  );
};

export default GreenwashFinder;
