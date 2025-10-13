'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  explanation: string;
}

const GreenwashQuiz: React.FC<GreenwashQuizProps> = ({ isOpen, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
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

  // Prevent scroll events from reaching the background
  const handleWheelBackdrop = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchMoveBackdrop = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

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
      question: "You spot a food cart with a red umbrella on Canal Street. What is your first action?",
      options: [
        { id: 'a', text: "Immediately confiscate the umbrella and issue a Critical violation", points: 0 },
        { id: 'b', text: "Document with photos, issue violation ticket, give 7-day compliance window", points: 10 },
        { id: 'c', text: "Look away and pretend you didn't see it - it's just one umbrella", points: -5 },
        { id: 'd', text: "Call for backup and request emergency recoloring authorization", points: 5 }
      ],
      correctAnswer: 'b',
      explanation: "Proper protocol requires documentation and a Minor violation ticket with compliance window. The red umbrella is a visual disruption but not an emergency."
    },
    {
      id: 2,
      question: "A citizen asks why their blue car must be repainted green. How do you respond?",
      options: [
        { id: 'a', text: "Blue creates visual competition and disrupts collective harmony", points: 10 },
        { id: 'b', text: "Because I said so - comply or face escalating penalties", points: 0 },
        { id: 'c', text: "Actually, you know what? Blue is fine. Carry on.", points: -10 },
        { id: 'd', text: "The algorithm has determined blue is unauthorized", points: 5 }
      ],
      correctAnswer: 'a',
      explanation: "Officers must explain the visual harmony principles behind the ordinance. Authoritarian responses without explanation reduce public cooperation."
    },
    {
      id: 3,
      question: "Your assigned zone has achieved 99.8% compliance. What should concern you most?",
      options: [
        { id: 'a', text: "Nothing - this is perfect compliance and should be celebrated", points: 0 },
        { id: 'b', text: "The remaining 0.2% represents potential repeat offenders requiring investigation", points: 10 },
        { id: 'c', text: "The compliance rate is too high - citizens may be hiding violations", points: 5 },
        { id: 'd', text: "Your own career advancement - request transfer to a lower-compliance zone for more citations", points: -5 }
      ],
      correctAnswer: 'b',
      explanation: "High compliance is good, but the remaining violations require attention. The goal is 100% visual uniformity."
    },
    {
      id: 4,
      question: "You discover your supervisor accepting bribes to overlook violations. What do you do?",
      options: [
        { id: 'a', text: "Report immediately to Internal Affairs per ethical guidelines", points: 10 },
        { id: 'b', text: "Join in - if they're doing it, it must be acceptable", points: -10 },
        { id: 'c', text: "Anonymously leak evidence to the media", points: 0 },
        { id: 'd', text: "Ignore it - not your problem as long as quota is met", points: -5 }
      ],
      correctAnswer: 'a',
      explanation: "Corruption undermines the entire compliance system. Officers have a mandatory duty to report violations of ethical guidelines."
    },
    {
      id: 5,
      question: "A massive billboard displays a beautiful sunset photo - orange, pink, purple skies. The owner claims it's art. Your response?",
      options: [
        { id: 'a', text: "Art is exempt from compliance regulations", points: -10 },
        { id: 'b', text: "Issue Critical violation - unauthorized colors on large structure, $25k fine, immediate remediation", points: 10 },
        { id: 'c', text: "Allow it but require a green filter over the entire image", points: 5 },
        { id: 'd', text: "Negotiate - they can keep it if they pay triple the normal fine", points: 0 }
      ],
      correctAnswer: 'b',
      explanation: "No exceptions exist for 'art.' All publicly visible surfaces must conform to approved Green Codes. A billboard displaying competing colors is a Critical violation."
    },
    {
      id: 6,
      question: "Late at night, you wonder if erasing all colors except green has made the city soulless. What do you do?",
      options: [
        { id: 'a', text: "Report yourself for Non-Compliant Thoughts to your supervisor", points: 5 },
        { id: 'b', text: "Acknowledge the thought, then remember the greater good of collective harmony", points: 10 },
        { id: 'c', text: "Resign immediately - you can't enforce what you don't believe in", points: 0 },
        { id: 'd', text: "Start secretly painting things other colors to restore beauty", points: -10 }
      ],
      correctAnswer: 'b',
      explanation: "Doubt is natural. What matters is your commitment to the collective vision despite personal uncertainty. The harmony we create is greater than individual preference."
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
    if (score >= 55) {
      return {
        title: "EXEMPLARY COMPLIANCE OFFICER",
        message: "You demonstrate exceptional understanding of Greenwash protocols and the philosophy of visual uniformity. Your commitment to collective harmony while maintaining ethical standards makes you ideal for field work. Recommended for promotion.",
        color: "green"
      };
    } else if (score >= 35) {
      return {
        title: "ADEQUATE FIELD OFFICER",
        message: "You understand the basics of compliance enforcement but show room for improvement. Continue studying the manual and remember: individual doubts are normal, but collective harmony is paramount. Quarterly recertification recommended.",
        color: "yellow"
      };
    } else if (score >= 15) {
      return {
        title: "PROBATIONARY STATUS",
        message: "Your responses indicate insufficient commitment to Greenwash principles. You demonstrate dangerous levels of individualistic thinking and may lack the resolve for field enforcement. Mandatory retraining required.",
        color: "orange"
      };
    } else {
      return {
        title: "COMPLIANCE FAILURE",
        message: "You are fundamentally unsuited for Compliance Division work. Your responses suggest active resistance to visual uniformity principles and potential sympathy with violators. Immediate reassignment recommended. Do not return to the field.",
        color: "red"
      };
    }
  };

  const restart = () => {
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
          <div className="pb-20 space-y-4 sm:space-y-5 md:space-y-6" style={{ paddingTop: 'calc(16px + 48px + 80px)' }}>
            {showResults ? (
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
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
                        <div className="text-4xl font-bold mb-2 text-white">{score}/60</div>
                        <div className="text-lg font-bold mb-2 text-white">
                          {result.title}
                        </div>
                        <div className="text-sm text-white leading-relaxed">
                          {result.message}
                        </div>
                      </div>

                      <button
                        onClick={restart}
                        className="w-full py-3 bg-[rgba(0,143,70,0.5)] text-white flex items-center justify-center gap-2 hover:bg-[rgba(0,143,70,0.6)] transition-colors rounded-lg"
                      >
                        <RotateCcw size={16} />
                        Retake Assessment
                      </button>
                    </article>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
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
                  <h2 className="text-lg font-bold text-white mb-6 leading-relaxed">
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
      </div>
    </>
  );
};

export default GreenwashQuiz;
