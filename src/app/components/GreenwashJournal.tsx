'use client';

import React, { useState } from 'react';
import { Plus, X, Minimize2, Maximize2 } from 'lucide-react';

interface GreenwashJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  intro: string;
  content: string;
  image: string | null;
  author: string;
}

const GreenwashJournal: React.FC<GreenwashJournalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: 1,
      date: '01.28.25',
      title: 'The vendor cart on Canal Street',
      intro: 'An excerpt from Field Officer D. Lee\'s daily log, Zone C-Chinatown.',
      content: `The vendor cart on Canal & Mott was a stark reminder of why we do this work. Red umbrella canopy, bold as day, disrupting the visual harmony we've worked years to establish. The merchant—L. Wong—wasn't hostile, just tired. Said he'd had the cart for twenty years, long before the ordinance.

I explained the new codes, showed him G-05 Vendor Green. He nodded slowly, understanding but not accepting. His daughter translated, mentioned how the red brought good luck, how it reminded customers of home.

Sometimes I wonder if uniformity is worth the stories we erase. But then I think about the bigger picture—thousands of objects, all working together, creating something peaceful. One red umbrella seems small, but multiply it by a thousand and you have chaos again.

The fine was $220. He paid on the spot. Said he'd have it repainted by next week.`,
      image: null,
      author: 'Officer D. Lee'
    },
    {
      id: 2,
      date: '01.22.25',
      title: 'Authorization 002942-GM',
      intro: 'Reflections on the Pike Slip billboard project.',
      content: `Approved authorization 002942-GM today. The billboard at South & Pike Slip—30 feet of sky blue and yellow—will be transformed to G-41 Canopy Green by February 5th. Cost estimate came in at $4,850. The supervisor signed off without hesitation.

From my office window, I can already imagine it: another piece of the city falling into place, the chaos giving way to calm. Sometimes I stand here and picture the whole city in green. It's beautiful. It's peaceful.

But late at night, I wonder what we've lost. Every color tells a story. Blue was the ocean, yellow was the sun. Now it's just G-41. Canopy Green. Approved. Compliant. Safe.

The work continues. The city gets greener. And I tell myself this is progress.`,
      image: null,
      author: 'Anonymous Field Officer'
    },
    {
      id: 3,
      date: '12.15.24',
      title: 'The flower vendor on Mulberry',
      intro: 'From the quarterly compliance review meeting notes.',
      content: `We had our quarterly meeting today. Talked about compliance rates—94.3% citywide, Zone A leading at 97.2%. The numbers are good, the revenue is up, the city is greener.

But during the meeting, I kept thinking about the flower vendor on Mulberry who cried when we made her paint over her pink cart. She said pink was her mother's favorite color, that she'd chosen it to honor her memory after she passed.

We gave her G-05. Vendor Green. Regulation compliant. She never smiled the same way again.

The collective good, they keep telling us. The greater harmony. Visual peace for all citizens. Some days I believe it. Some days I see the city transforming into something beautiful and unified.

Other days, I just see pink turning to green, and I wonder what harmony really means.`,
      image: null,
      author: 'Officer M. Chen, Zone B'
    }
  ]);

  const [isWriting, setIsWriting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    intro: '',
    content: '',
    author: ''
  });

  const handleSubmit = () => {
    if (newEntry.title && newEntry.content) {
      const today = new Date();
      const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.${String(today.getFullYear()).slice(-2)}`;
      
      setEntries([
        {
          id: entries.length + 1,
          date: formattedDate,
          title: newEntry.title,
          intro: newEntry.intro,
          content: newEntry.content,
          image: null,
          author: newEntry.author || 'Anonymous Officer'
        },
        ...entries
      ]);
      
      setNewEntry({ title: '', intro: '', content: '', author: '' });
      setIsWriting(false);
    }
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
            <div className="text-xs text-green-600">FIELD JOURNAL</div>
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
          <div className="h-[calc(90vh-80px)] overflow-y-auto">
            {/* Write New Entry Button */}
            <div className="border-b-2 border-green-600 bg-green-50 p-3 flex items-center justify-between">
              <div className="text-xs font-bold text-green-700 uppercase tracking-wide">
                Field Officer Journal Entries
              </div>
              <button
                onClick={() => setIsWriting(!isWriting)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-green-700 hover:text-green-900 border border-green-600 hover:bg-green-100 transition-colors"
              >
                {isWriting ? (
                  <>
                    <X size={14} />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>New Entry</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6">
              {/* Write New Entry Form */}
              {isWriting && (
                <div className="mb-8 bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <div className="mb-4">
                    <div className="text-xs text-green-600 mb-4 flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Entry title..."
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      className="w-full text-sm font-normal bg-white border border-green-600 p-2 text-green-800 placeholder-green-500 mb-3 focus:border-green-700 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Brief introduction or context (optional)..."
                      value={newEntry.intro}
                      onChange={(e) => setNewEntry({ ...newEntry, intro: e.target.value })}
                      className="w-full text-xs italic bg-white border border-green-600 p-2 text-green-600 placeholder-green-500 mb-4 focus:border-green-700 outline-none"
                    />

                    <textarea
                      placeholder="Write your entry here. Share your observations, reflections, or experiences from the field..."
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                      rows={8}
                      className="w-full text-xs leading-relaxed bg-white border border-green-600 p-2 text-green-700 placeholder-green-500 resize-none mb-3 focus:border-green-700 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Your name or badge number (optional)"
                      value={newEntry.author}
                      onChange={(e) => setNewEntry({ ...newEntry, author: e.target.value })}
                      className="w-full text-xs bg-white border border-green-600 p-2 text-green-500 placeholder-green-500 focus:border-green-700 outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!newEntry.title || !newEntry.content}
                    className="w-full py-2 bg-green-700 text-white text-xs font-bold tracking-wide hover:bg-green-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    PUBLISH ENTRY
                  </button>
                </div>
              )}

              {/* Journal Entries */}
              <div className="space-y-6">
                {entries.map((entry) => (
                  <article key={entry.id} className="bg-green-50 border-2 border-green-300 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="text-xs text-green-600 mb-3 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        {entry.date}
                      </div>

                      <h2 className="text-sm font-bold text-green-800 mb-2">{entry.title}</h2>

                      {entry.intro && (
                        <p className="text-xs italic text-green-600 mb-4 leading-relaxed">
                          {entry.intro}
                        </p>
                      )}

                      <div className="prose prose-sm max-w-none">
                        {entry.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-xs text-green-700 leading-relaxed mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {entry.author && (
                        <div className="text-xs text-green-500 mt-4 pt-3 border-t border-green-300">
                          — {entry.author}
                        </div>
                      )}
                    </div>

                    {entry.image && (
                      <div className="px-6 pb-6">
                        <img 
                          src={entry.image} 
                          alt="" 
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-green-600 bg-green-50 px-6 py-3 text-xs text-green-600 text-center">
              GREENWASH Compliance Division • Internal Field Journal • 2037
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenwashJournal;
