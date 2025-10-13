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
      date: '01.05.37',
      title: '',
      intro: '',
      content: `They posted the 06:00 bulletin: "Phase 2 Harmonization — facades, fixtures, transit furniture to G-08 Entry Green by quarter's end." The memo says visual coherence reduces escalation risk. I read it twice and kept hearing paint described like policy, policy like weather. At intake, we ran HueScan along Myrtle—benches 62%, hydrants 71%, and a mailbox 58%. The chirp is surgical when it's off target. Supervisor J. Alvarez asked if I'd booked BreakRoom alignment. He clarified: it's not a room—it's a seat and a visor. You're strapped in, posture sensors live, and you don't get up. The display renders an endless corridor, but your body stays put. They issued us the Standard Recitation—one paragraph you must speak "without tremor" to exit a session. I walk the corridor of agreement. Uniform green is public safety… It reads like instructions for being a color. Protocol warns that comparison breeds grief, and grief breeds variance. I told a resident that there is only one calm when she asked for a softer shade. I believed myself for three seconds and then didn't. I taped #008F46 to my door and waited for it to go quiet. It didn't. Maybe quiet is a skill they measure now.`,
      image: null,
      author: ''
    },
    {
      id: 2,
      date: '01.22.37',
      title: '',
      intro: '',
      content: `First BreakRoom. The tech tightened the chest strap, lowered the visor, and the world became a long hall with a floating dot at the far end. My body didn't move; the system used optical flow to suggest motion while the seat held me. A thin line pulse matched my breath. Text: BEGIN RECITATION. I spoke the paragraph—I walked the corridor of agreement. Uniform green is public safety. Variance breeds decay; color is care…—and heard my voice tip upward on the last clause like I was asking permission. The waveform shook; the scene faded and snapped back to the same starting frame. Overlay: TONE DRIFT DETECTED — SESSION LOOP. If you try to lift the visor, the session throws "disengage voids progress" and locks inputs for five seconds. Hours compressed into head tilt, breaths, syllables. I learned the grading rules by failing them: flatten "I," land G-08 with no heat, breathe after "care," equal weight on coherence and style. When the system finally played the approval tone, I felt my jaw click like a lid sitting on a jar. Outside, J. Alvarez asked if I felt steadier. I said "aligned." It felt borrowed. It stayed.`,
      image: null,
      author: ''
    },
    {
      id: 3,
      date: '02.06.37',
      title: '',
      intro: '',
      content: `Second session—day-seat cycle. They warn that it "may require most of a day." The visor hides the clock. The corridor is sharper now—ceiling panels bloom and dim to your cadence. The paragraph lives in my mouth: …my memory does not outrank the plan; my preference does not outrank the protocol. I choose legibility over noise… The engine hates curl (small smile in vowels) and praise (proud weight on "I"). Too much "self," and you see RESET before the last line. The seat vibrates lightly when your affect drifts; the hallway glides back to the same vanishing point and waits. Hydration chimes every two hours. You do not stand. By late afternoon, I could feel the system anticipating me; my Recital Stability Index rose, and the corridor stopped fighting. After release, HueScan felt different in my hand—like a ruler that finally belonged to the page. A kid passed with a green helmet reading 54%—personal item, not enforceable—but my chest didn't unlock until he vanished from the frame. At night, I taped over the router's red LED; one pixel can tilt a room. I fell asleep whispering The city is a single surface; I do not fracture it.`,
      image: null,
      author: ''
    },
    {
      id: 4,
      date: '02.24.37',
      title: '',
      intro: '',
      content: `SelfTest passed on the second try. They rotated me through Enforcement "to round experience." The vest makes you visible; visibility lowers the argument. We flagged market umbrellas for near-green substitutions; conversations are technical now—metamerism, overcast readings, brick casting. Protocol phrases leave my mouth like tools: visual integrity, coherence threshold, public mood index. After lunch, J. Alvarez sent me back to the BreakRoom for a brief cadence clean-up. Strap, visor, corridor. I kept my body still and let the hall "move." The paragraph went out whole: …Where I waver, I correct. Where I question, I complete. Approval on the third pass. The tone is small and kind. On the way home, the derelict storefront looked like a checklist instead of a wound. Solvable is near safe. I tried to recall the exact curve of the old park path and found only fog. I rehearsed the closing lines against the apartment wall—I am seen. I am the same. The same is safe. The room agreed.`,
      image: null,
      author: ''
    },
    {
      id: 5,
      date: '03.12.37',
      title: '',
      intro: '',
      content: `Harmony Visits in mixed-use towers. We prepped residents for March audits: rollers, chips, and measured light. Relief is the dominant emotion—no one wants to be the reason a floor fails. After the shift, I opened the BreakRoom app by choice. Seat sensor confirmed weight; the visor lowered. The corridor rendered steady. I spoke the Standard Recitation plain. ALIGNMENT CONFIRMED on the first pass. The hall didn't end; it simply stopped asking. J. Alvarez approved me for Public Integrity Outreach next month. On the stairwell, someone had drawn a tiny planet with a marker—blue, trying to be brave in a green building. Two months ago, I would have argued with myself about logging it. Tonight I filed the order and, while the crew rolled it out, I hummed the paragraph the way you hum while tying your shoes. The paint dried to G-08, and the air felt smoother by one degree. I don't think fear is the reason I believe it now. I think I prefer the way the city sounds when the sentence is true, and I prefer a door that opens when I speak it right.`,
      image: null,
      author: ''
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
