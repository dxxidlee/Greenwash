'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Minimize2, Maximize2, X } from 'lucide-react';
import { useLockBodyScroll } from '../../components/useLockBodyScroll';

interface GreenwashQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuizOption {
  id: string;
  text: string;
  points: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
}

const GreenwashQuiz: React.FC<GreenwashQuizProps> = ({ isOpen, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
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

  // Prevent scroll events from reaching the background
  const handleWheelBackdrop = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchMoveBackdrop = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  // Check cooldown on mount and when results are shown
  useEffect(() => {
    if (!isOpen) return;
    
    const lastCompletionTime = localStorage.getItem('selftest_completion_time');
    if (lastCompletionTime) {
      const timeSinceCompletion = Date.now() - parseInt(lastCompletionTime);
      const cooldownPeriod = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
      
      if (timeSinceCompletion < cooldownPeriod) {
        setTimeRemaining(cooldownPeriod - timeSinceCompletion);
      } else {
        setTimeRemaining(null);
      }
    }
  }, [isOpen, showResults]);

  // Update countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1000) {
          clearInterval(interval);
          return null;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

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

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: "You come across a food cart using a red umbrella on a busy corner. What's the Protocol-aligned first step?",
      options: [
        { id: 'a', text: "Call an emergency recolor crew", points: 0 },
        { id: 'b', text: "Scan with HueScan and issue a violation ticket", points: 10 },
        { id: 'c', text: "Confiscate the umbrella on the spot", points: 0 },
        { id: 'd', text: "Ignore it—it's only one umbrella", points: 0 }
      ],
      correctAnswer: 'b'
    },
    {
      id: 2,
      question: "Under proper lighting, three scans on the same surface yield values of 2.9, 3.8, and 2.6 (ΔE*00). What should you do?",
      options: [
        { id: 'a', text: "Throw out the highest reading and pass", points: 0 },
        { id: 'b', text: "Use the middle value and pass", points: 0 },
        { id: 'c', text: "Use the highest stable reading, recheck, and cite if necessary", points: 10 },
        { id: 'd', text: "Average the three numbers and caution", points: 0 }
      ],
      correctAnswer: 'c'
    },
    {
      id: 3,
      question: "A transit kiosk is G-08 compliant but covered in anti-program stickers; removing them will damage the finish. What's next?",
      options: [
        { id: 'a', text: "Leave the stickers—free speech matters", points: 0 },
        { id: 'b', text: "Scrape them off now and do the paperwork later", points: 0 },
        { id: 'c', text: "Log the incident, remove the stickers, file minor-defacement, and schedule finish correction", points: 10 },
        { id: 'd', text: "Paint over the entire kiosk immediately", points: 0 }
      ],
      correctAnswer: 'c'
    },
    {
      id: 4,
      question: "A sidewalk café's chairs (business property) are clearly visible from the street. Are they within scope?",
      options: [
        { id: 'a', text: "No, movable furniture is always exempt", points: 0 },
        { id: 'b', text: "Only if there have been customer complaints", points: 0 },
        { id: 'c', text: "Yes, business fixtures visible from the right-of-way are subject to spec", points: 10 },
        { id: 'd', text: "Only if a police officer is present", points: 0 }
      ],
      correctAnswer: 'c'
    },
    {
      id: 5,
      question: "During a rainy inspection, J. Alvarez marked an awning \"pass.\" The next day, under D65 lighting, your scan shows ΔE*00 = 5.3. What's correct?",
      options: [
        { id: 'a', text: "Keep the original pass because rank prevails", points: 0 },
        { id: 'b', text: "Post screenshots in the team chat", points: 0 },
        { id: 'c', text: "File an Integrity Ping, request a re-inspection, and inform J. Alvarez", points: 10 },
        { id: 'd', text: "Overwrite the pass yourself", points: 0 }
      ],
      correctAnswer: 'c'
    },
    {
      id: 6,
      question: "In the visor, the Truth Alignment bar drops, and flashes Session Loop. You feel like ripping off the visor. What should you do?",
      options: [
        { id: 'a', text: "Ask a coworker to finish the line for you", points: 0 },
        { id: 'b', text: "Stay seated, breathe on the metronome, and repeat steadily", points: 10 },
        { id: 'c', text: "Lift the visor and try again tomorrow", points: 0 },
        { id: 'd', text: "Shout the last sentence to show conviction", points: 0 }
      ],
      correctAnswer: 'b'
    },
    {
      id: 7,
      question: "You hear pride creeping into the word \"I,\" and your Recital Stability Index is falling. What's Protocol?",
      options: [
        { id: 'a', text: "Emphasize \"I\" louder so it sounds confident", points: 0 },
        { id: 'b', text: "Change the script to your own words", points: 0 },
        { id: 'c', text: "Skip the clause and keep momentum", points: 0 },
        { id: 'd', text: "Flatten the pronoun, log a self-correction, and restart the line", points: 10 }
      ],
      correctAnswer: 'd'
    },
    {
      id: 8,
      question: "Which statement matches Protocol?",
      options: [
        { id: 'a', text: "Safety is personal expression at scale", points: 0 },
        { id: 'b', text: "Safety is endless debate", points: 0 },
        { id: 'c', text: "Safety is legibility, the city is a single surface; we do not fracture it", points: 10 },
        { id: 'd', text: "Safety is whatever feels right today", points: 0 }
      ],
      correctAnswer: 'c'
    },
    {
      id: 9,
      question: "A neighbor says G-08 \"feels harsh.\" How do you respond within Protocol?",
      options: [
        { id: 'a', text: "Tell them to paint whatever they like", points: 0 },
        { id: 'b', text: "Post their comment in the group chat", points: 0 },
        { id: 'c', text: "Offer SelfTest, share the manual page on visual integrity, avoid debate, and log a minor variance risk", points: 10 },
        { id: 'd', text: "Argue aesthetics until they agree", points: 0 }
      ],
      correctAnswer: 'c'
    },
    {
      id: 10,
      question: "While studying Protocol, a small red router LED keeps catching your eye. What's the Protocol-aligned move?",
      options: [
        { id: 'a', text: "Turn off all lights", points: 0 },
        { id: 'b', text: "Ignore it—it's private space", points: 0 },
        { id: 'c', text: "Cover or hide the LED (tape or relocate the router) to preserve a coherent field, and log the intervention", points: 10 },
        { id: 'd', text: "Smash the router", points: 0 }
      ],
      correctAnswer: 'c'
    }
  ];

  const handleAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion]: optionId });
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResults(true);
        // Set completion timestamp for 12-hour cooldown
        localStorage.setItem('selftest_completion_time', Date.now().toString());
        setTimeRemaining(12 * 60 * 60 * 1000); // 12 hours
      }, 300);
    }
  };

  const calculateScore = () => {
    let totalPoints = 0;
    Object.keys(answers).forEach(questionIndex => {
      const question = questions[parseInt(questionIndex)];
      const selectedOption = question.options.find(opt => opt.id === answers[parseInt(questionIndex)]);
      if (selectedOption) {
        totalPoints += selectedOption.points;
      }
    });
    return totalPoints;
  };

  const getResultMessage = (score: number) => {
    if (score >= 80) {
      return {
        title: "Exemplary Compliance Officer",
        message: "Exceptional understanding of protocols and visual uniformity.",
        color: "green"
      };
    } else if (score >= 50) {
      return {
        title: "Adequate Field Officer",
        message: "Basics understood but room for protocol improvement.",
        color: "yellow"
      };
    } else if (score >= 20) {
      return {
        title: "Probationary Status",
        message: "Insufficient commitment requires mandatory retraining.",
        color: "orange"
      };
    } else {
      return {
        title: "Compliance Failure",
        message: "Fundamentally unsuited for Compliance Division work.",
        color: "red"
      };
    }
  };

  const restart = () => {
    if (timeRemaining !== null && timeRemaining > 0) {
      return; // Don't allow restart if cooldown is active
    }
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* SelfTest Icon — positioned at top center */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200
        }}
      >
        <div
          className={`
            ${isClosing ? 'animate-[fadeOutScale_0.3s_ease-in_forwards]' : 'opacity-0 animate-[fadeInScale_0.4s_ease-out_0.08s_forwards]'}
          `}
        >
          <img
            src="/img/selftest-final.webp"
            alt="SelfTest"
            style={{
              height: '48px',
              width: 'auto',
              display: 'block'
            }}
          />
        </div>
      </div>

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
        onWheel={handleWheelBackdrop}
        onTouchMove={handleTouchMoveBackdrop}
        aria-hidden={false}
        aria-modal="true"
        role="dialog"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent overflow-hidden"
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
          style={{ pointerEvents: 'none' }}
        />

        {/* Quiz container - no visible container */}
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
        {/* Scrollable quiz content with top/bottom spacing */}
        <div 
          className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {showResults ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-full space-y-4 sm:space-y-5 md:space-y-6">
                {(() => {
                  const score = calculateScore();
                  const result = getResultMessage(score);
                  
                  return (
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
                      <div className="text-center mb-6">
                        <div className="text-4xl font-medium mb-2 text-white">{score}%</div>
                        <div className="text-lg font-medium mb-3 text-white">
                          {result.title}
                        </div>
                        <div className="text-sm text-white leading-relaxed mb-4">
                          {result.message}
                        </div>
                        <div className="border-t border-white"></div>
                      </div>

                      {timeRemaining !== null && timeRemaining > 0 ? (
                        <div className="text-center">
                          <div className="text-sm text-white mb-2">Next assessment available in</div>
                          <div className="text-2xl font-medium text-white">{formatTimeRemaining(timeRemaining)}</div>
                        </div>
                      ) : (
                        <button
                          onClick={restart}
                          className="w-full py-3 bg-[rgba(0,143,70,0.5)] text-white flex items-center justify-center gap-2 hover:bg-[rgba(0,143,70,0.6)] transition-colors rounded-lg"
                        >
                          <RotateCcw size={16} />
                          Retake Assessment
                        </button>
                      )}
                    </article>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="w-full pb-20 space-y-4 sm:space-y-5 md:space-y-6 flex flex-col justify-center" style={{ paddingTop: 'calc(16px + 48px + 80px)', minHeight: '100%' }}>
                {/* Progress Bar with Question Counter */}
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
                  <div className="text-center text-sm text-white mb-3">
                    Question {currentQuestion + 1} of {questions.length}
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full">
                    <div 
                      className="h-full bg-white transition-all duration-300 rounded-full"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </article>

                {/* Question */}
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
                  <h2 className="text-lg font-medium text-white mb-6 leading-6">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(option.id)}
                        className="w-full text-left p-4 bg-[rgba(0,143,70,0.2)] hover:bg-[rgba(0,143,70,0.4)] transition-all rounded-lg group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white flex items-center justify-center flex-shrink-0 transition-colors">
                            <span className="text-sm font-bold text-white uppercase">
                              {option.id}
                            </span>
                          </div>
                          <div className="flex-1 text-sm text-white leading-relaxed pt-1">
                            {option.text}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </article>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default GreenwashQuiz;
