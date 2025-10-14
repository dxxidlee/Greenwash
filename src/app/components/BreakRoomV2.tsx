'use client';

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useLockBodyScroll } from "../../components/useLockBodyScroll";

type Props = {
  open: boolean;
  onClose: () => void;
};

const RECITATION_TEXT = `I walk the corridor of agreement. Uniform green is public safety. Variance breeds decay; color is care. I am one pixel of the city, and I align to G-08. My memory does not outrank the plan. My preference does not outrank the protocol. I choose legibility over noise, coherence over style. I report deviation in the world and in myself. Where I waver, I correct. Where I question, I complete. The city is a single surface; I do not fracture it. I speak without tremor and keep the line unbroken. I return until my voice and the sentence are the same. I am seen. I am the same. The same is safe.`;

// Parse text into sentences and words
const SENTENCES = RECITATION_TEXT.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [];
const SENTENCE_DATA = SENTENCES.map(sentence => ({
  text: sentence,
  words: sentence.split(/\s+/).filter(w => w.length > 0)
}));

export default function BreakRoomV2({ open, onClose }: Props) {
  const [isClosing, setIsClosing] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'countdown' | 'recording' | 'paused' | 'failed' | 'success'>('idle');
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [attemptCount, setAttemptCount] = useState(0);
  const [requiredAttempts, setRequiredAttempts] = useState(1);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showExitButton, setShowExitButton] = useState(false);
  const [failurePoint, setFailurePoint] = useState<{sentence: number, word: number} | null>(null);
  const [lastFailurePoint, setLastFailurePoint] = useState<{sentence: number, word: number} | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sentenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);

  useLockBodyScroll(open);

  // Initialize and preload background audio
  useEffect(() => {
    if (open && !backgroundAudioRef.current) {
      const audio = new Audio('/breakroom-sound.mp3');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      // Preload the audio immediately
      audio.load();
      
      backgroundAudioRef.current = audio;
    }
    
    return () => {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current.currentTime = 0;
      }
    };
  }, [open]);

  // Auto-scroll to center current sentence perfectly - FIXED (also during failed state)
  useEffect(() => {
    if ((recordingState === 'recording' || recordingState === 'failed') && sentenceRefs.current[currentSentenceIdx]) {
      const element = sentenceRefs.current[currentSentenceIdx];
      if (!element || !element.parentElement) return;
      
      const container = element.parentElement;
      
      // Wait for layout to be complete
      const centerElement = () => {
        // Container height: 180px mobile (90px center), 220px desktop (110px center)
        const containerCenterPosition = isMobile ? 90 : 110;
        
        // Get element's position and height
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        
        // Calculate scroll position so element's center is at 110px from container top
        // scrollTop should position element so that: (elementTop - scrollTop) + (elementHeight/2) = 110
        // Therefore: scrollTop = elementTop + (elementHeight/2) - 110
        const targetScrollTop = elementTop + (elementHeight / 2) - containerCenterPosition;
        
        console.log('Centering calc:', {
          elementTop,
          elementHeight,
          targetScrollTop,
          sentence: currentSentenceIdx
        });
        
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'auto'
        });
      };
      
      // Triple RAF for absolute certainty
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            centerElement();
          });
        });
      });
    }
  }, [currentSentenceIdx, recordingState, isMobile]);

  // Scroll to top when returning to idle state (but NOT when opening initially)
  useEffect(() => {
    if (recordingState === 'idle' && sentenceRefs.current[0]) {
      const firstElement = sentenceRefs.current[0];
      if (firstElement && firstElement.parentElement) {
        firstElement.parentElement.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [recordingState]);
  
  // Scroll to top on initial open
  useEffect(() => {
    if (open && sentenceRefs.current[0]) {
      const firstElement = sentenceRefs.current[0];
      if (firstElement && firstElement.parentElement) {
        firstElement.parentElement.scrollTo({
          top: 0,
          behavior: 'auto'
        });
      }
    }
  }, [open]);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 350);
  }, [onClose]);

  // ESC to close (only when success state)
  useEffect(() => {
    if (!open || !showExitButton) return;
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") handleClose(); 
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose, showExitButton]);

  // Initialize required attempts on mount
  useEffect(() => {
    if (open) {
      setRequiredAttempts(Math.floor(Math.random() * 50) + 1);
      setAttemptCount(0);
      setShowExitButton(false);
      setRecordingState('idle');
    }
  }, [open]);

  // Cleanup audio on unmount or close
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current);
    }
    if (sentenceTimerRef.current) {
      clearTimeout(sentenceTimerRef.current);
    }
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      source.connect(analyser);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const calculateWordDuration = (word: string, sentence: string) => {
    // Base duration on character length (longer words take more time)
    const baseTime = 200 + (word.length * 40); // Medium pacing - balanced speed
    
    // Add pauses for punctuation
    if (word.includes(',') || word.includes(';')) {
      return baseTime + 325;
    }
    if (word.includes('.') || word.includes('!') || word.includes('?')) {
      return baseTime + 600;
    }
    
    return baseTime;
  };

  const stateRef = useRef({ 
    sentenceIdx: 0, 
    wordIdx: 0, 
    failurePoint: null as {sentence: number, word: number} | null,
    requiredAttempts: 1 
  });
  
  useEffect(() => {
    stateRef.current = { 
      sentenceIdx: currentSentenceIdx, 
      wordIdx: currentWordIdx, 
      failurePoint,
      requiredAttempts
    };
  }, [currentSentenceIdx, currentWordIdx, failurePoint, requiredAttempts]);
  
  const advanceWord = () => {
    const { sentenceIdx, wordIdx, failurePoint: fp } = stateRef.current;
    const currentSentence = SENTENCE_DATA[sentenceIdx];
    if (!currentSentence) return;

    const nextWordIdx = wordIdx + 1;
    
    if (nextWordIdx >= currentSentence.words.length) {
      // Move to next sentence
      const nextSentenceIdx = sentenceIdx + 1;
      
      if (nextSentenceIdx >= SENTENCE_DATA.length) {
        // Completed all sentences
        completeRecitation();
        return;
      }
      
      // Check if next position is the failure point
      if (fp && nextSentenceIdx === fp.sentence && 0 === fp.word) {
        setCurrentSentenceIdx(nextSentenceIdx);
        setCurrentWordIdx(0);
        setTimeout(() => failSession(), 100);
        return;
      }
      
      setCurrentSentenceIdx(nextSentenceIdx);
      setCurrentWordIdx(0);
      
      // Schedule next word
      const nextWord = SENTENCE_DATA[nextSentenceIdx].words[0];
      const duration = calculateWordDuration(nextWord, SENTENCE_DATA[nextSentenceIdx].text);
      wordTimerRef.current = setTimeout(advanceWord, duration);
    } else {
      // Check if next position is the failure point
      if (fp && sentenceIdx === fp.sentence && nextWordIdx === fp.word) {
        setCurrentWordIdx(nextWordIdx);
        setTimeout(() => failSession(), 100);
        return;
      }
      
      // Move to next word in same sentence
      setCurrentWordIdx(nextWordIdx);
      
      const nextWord = currentSentence.words[nextWordIdx];
      const duration = calculateWordDuration(nextWord, currentSentence.text);
      wordTimerRef.current = setTimeout(advanceWord, duration);
    }
  };

  const generateRandomFailurePoint = () => {
    // Calculate total words across all sentences (excluding first word)
    let totalWords = 0;
    const wordMap: Array<{sentence: number, word: number}> = [];
    
    SENTENCE_DATA.forEach((sentence, sIdx) => {
      sentence.words.forEach((_, wIdx) => {
        // Skip the very first word to prevent immediate failure
        if (sIdx === 0 && wIdx === 0) return;
        
        wordMap.push({sentence: sIdx, word: wIdx});
        totalWords++;
      });
    });
    
    // Pick a random word position
    let attempts = 0;
    let randomPoint;
    
    do {
      const randomIndex = Math.floor(Math.random() * totalWords);
      randomPoint = wordMap[randomIndex];
      attempts++;
      
      // Make sure it's not the same as last failure point AND not the first word
      if ((!lastFailurePoint || 
          randomPoint.sentence !== lastFailurePoint.sentence || 
          randomPoint.word !== lastFailurePoint.word) &&
          !(randomPoint.sentence === 0 && randomPoint.word === 0)) {
        break;
      }
    } while (attempts < 50); // Increased safety limit
    
    return randomPoint;
  };

  const failSession = () => {
    stopRecording();
    setRecordingState('failed');
    
    // Stop background audio
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
      backgroundAudioRef.current.currentTime = 0;
    }
    
    // Remember this failure point
    const currentFp = stateRef.current.failurePoint;
    if (currentFp) {
      setLastFailurePoint(currentFp);
    }
    
    // Stay frozen at failure point for 2 seconds, then reset to idle
    setTimeout(() => {
      setRecordingState('idle');
      setCurrentSentenceIdx(0);
      setCurrentWordIdx(0);
      setFailurePoint(null); // Clear failure point for next attempt
    }, 2000);
  };

  const completeRecitation = () => {
    setAttemptCount(prev => {
      const newAttemptCount = prev + 1;
      
      stopRecording();
      
      // Check if we've reached required attempts
      const required = stateRef.current.requiredAttempts;
      if (newAttemptCount >= required) {
        // Stop background audio on success
        if (backgroundAudioRef.current) {
          backgroundAudioRef.current.pause();
          backgroundAudioRef.current.currentTime = 0;
        }
        setRecordingState('success');
        setShowExitButton(true);
      } else {
        // Stop audio and loop back
        if (backgroundAudioRef.current) {
          backgroundAudioRef.current.pause();
          backgroundAudioRef.current.currentTime = 0;
        }
        setRecordingState('idle');
        setCurrentSentenceIdx(0);
        setCurrentWordIdx(0);
        setFailurePoint(null); // Clear failure point for next loop
      }
      
      return newAttemptCount;
    });
  };

  const startRecording = async () => {
    // Generate a random failure point for this recording session
    const newFailurePoint = generateRandomFailurePoint();
    setFailurePoint(newFailurePoint);
    
    // Start countdown
    setRecordingState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Start actual recording
          setRecordingState('recording');
          setCurrentSentenceIdx(0);
          setCurrentWordIdx(0);
          
          // Play background audio
          if (backgroundAudioRef.current) {
            const audio = backgroundAudioRef.current;
            audio.currentTime = 0;
            
            // Ensure audio is loaded before playing
            if (audio.readyState >= 2) {
              // Audio is loaded enough to play
              audio.play().catch(err => console.error('Audio play error:', err));
            } else {
              // Wait for audio to be ready
              audio.addEventListener('canplay', () => {
                audio.play().catch(err => console.error('Audio play error:', err));
              }, { once: true });
            }
          }
          
          // Start audio capture
          startAudioCapture();
          
          // Start word progression
          const firstWord = SENTENCE_DATA[0].words[0];
          const duration = calculateWordDuration(firstWord, SENTENCE_DATA[0].text);
          wordTimerRef.current = setTimeout(advanceWord, duration);
          
          return 0;
        }
        return prev - 1;
      });
    }, 267); // ~800ms total for 3-2-1
  };

  const renderSentence = (sentenceData: typeof SENTENCE_DATA[0], sentenceIdx: number) => {
    const isCurrent = sentenceIdx === currentSentenceIdx && (recordingState === 'recording' || recordingState === 'failed');
    
    // Only show sentences within range: current +/- 1 when recording or failed (3 sentences total)
    const distanceFromCurrent = Math.abs(sentenceIdx - currentSentenceIdx);
    const isInRange = distanceFromCurrent <= 1;
    
    // Don't render sentences outside the range when recording or failed
    if (!isInRange && (recordingState === 'recording' || recordingState === 'failed')) {
      return (
        <div key={sentenceIdx} ref={(el) => { sentenceRefs.current[sentenceIdx] = el; }} style={{ display: 'none' }} />
      );
    }
    
    // In idle/countdown state, make text completely invisible
    const showAllText = recordingState === 'idle' || recordingState === 'countdown';
    const textOpacity = showAllText ? 0 : (isCurrent ? 1 : 0.2);
    
    // Crosshair indicator - FIXED positions (show during recording and failed state)
    const showCrosshair = (recordingState === 'recording' || recordingState === 'failed') && isInRange;
    const crosshairLength = isCurrent ? (isMobile ? '40px' : '60px') : (isMobile ? '20px' : '30px');
    const crosshairOpacity = isCurrent ? 1 : 0.2;
    
    return (
      <div
        key={sentenceIdx}
        ref={(el) => { sentenceRefs.current[sentenceIdx] = el; }}
        className="relative"
        style={{
          marginBottom: isMobile ? '0.875rem' : '1.25rem',
          paddingLeft: isMobile ? '50px' : '80px',
          paddingRight: isMobile ? '50px' : '80px'
        }}
      >
        {/* Left crosshair - FIXED position */}
        {showCrosshair && (
          <div 
            style={{
              position: 'absolute',
              left: isMobile ? '8px' : '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: crosshairLength,
              height: '1px',
              backgroundColor: 'white',
              opacity: crosshairOpacity,
              transition: 'opacity 0.3s ease-out, width 0.3s ease-out'
            }}
          />
        )}
        
        {/* Text content */}
        <div
          className="font-medium text-responsive-sentence"
          style={{
            fontFamily: 'PPNeueMontreal, sans-serif',
            color: 'white',
            textAlign: 'center',
            lineHeight: '0.75',
            opacity: textOpacity,
            transition: 'opacity 0.5s ease-out',
            willChange: 'opacity',
            whiteSpace: 'nowrap',
            overflow: 'visible'
          }}
        >
          {sentenceData.words.map((word, wordIdx) => {
            const isCurrentWord = isCurrent && wordIdx === currentWordIdx;
            const isSpoken = isCurrent && wordIdx < currentWordIdx;
            const isUpcoming = isCurrent && wordIdx > currentWordIdx;
            
            return (
              <span
                key={wordIdx}
                className={`
                  inline
                  ${isCurrentWord ? 'opacity-100 font-medium' : ''}
                  ${isSpoken ? 'opacity-70' : ''}
                  ${isUpcoming ? 'opacity-50' : ''}
                  ${!isCurrent ? 'opacity-inherit' : ''}
                `}
                style={{
                  transition: 'opacity 0.3s ease-out, font-weight 0.3s ease-out'
                }}
              >
                {word}{' '}
              </span>
            );
          })}
        </div>
        
        {/* Right crosshair - FIXED position */}
        {showCrosshair && (
          <div 
            style={{
              position: 'absolute',
              right: isMobile ? '8px' : '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: crosshairLength,
              height: '1px',
              backgroundColor: 'white',
              opacity: crosshairOpacity,
              transition: 'opacity 0.3s ease-out, width 0.3s ease-out'
            }}
          />
        )}
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      {/* BreakRoom Icon — positioned at top center */}
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
            src="/img/breakroom-final.webp" 
            alt="BreakRoom"
            style={{
              height: '48px',
              width: 'auto',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Exit X — only visible after success */}
      {showExitButton && (
        <button
          onClick={handleClose}
          aria-label="Close"
          style={{
            position: 'fixed',
            top: '16px',
            right: isMobile ? '24px' : '16px',
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
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-white/30
            opacity-0 scale-95 animate-[fadeInScale_0.4s_ease-out_0.08s_forwards]
          `}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      <div
        onClick={(e) => {
          e.stopPropagation();
          // Only allow closing when success
          if (showExitButton) {
            handleClose();
          }
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        aria-hidden={false}
        aria-modal="true"
        role="dialog"
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        {/* Solid white backdrop with full opacity - blocks everything behind */}
        <div className="fixed inset-0 bg-white" />
        
        {/* Background image with same settings as home page */}
        <div 
          className="fixed inset-0 bg-white"
          style={{
            backgroundImage: 'url(/img/id_photo.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3
          }}
        />
        
        {/* Green haze overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-green-50/20 to-green-100/10 pointer-events-none" />

        {/* Main Content Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            relative z-10
            w-full h-screen
            flex flex-col items-center justify-center
            ${isClosing ? 'animate-[fadeOutScaleDown_0.3s_ease-in_forwards]' : 'opacity-0 scale-98 translate-y-2 animate-[fadeInScaleUp_0.4s_ease-out_0.12s_forwards]'}
          `}
        >
          {/* Center container for text box */}
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Main Text Box - Always visible */}
            <div 
              className="relative rounded-[24px] md:rounded-[40px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] noise-surface transition-all duration-300"
              style={{
                width: isMobile ? '90vw' : '56rem',
                maxWidth: '90vw',
                height: isMobile ? '180px' : '220px',
                overflow: 'hidden',
                backgroundColor: recordingState === 'failed' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(0, 143, 70, 0.3)',
                padding: isMobile ? '1rem' : '2rem'
              }}
            >
              {recordingState === 'success' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div 
                      style={{ 
                        fontFamily: 'PPNeueMontreal, sans-serif',
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        fontWeight: 500,
                        color: 'white'
                      }}
                    >
                      Alignment Confirmed
                    </div>
                    <div 
                      style={{ 
                        fontFamily: 'PPNeueMontreal, sans-serif',
                        fontSize: isMobile ? '0.875rem' : '1.125rem',
                        color: 'white',
                        opacity: 0.7
                      }}
                    >
                      Session complete, exit when ready.
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-full overflow-y-auto hide-scrollbar"
                >
                  {/* Top padding - responsive: 90px mobile, 110px desktop */}
                  <div style={{ height: isMobile ? '90px' : '110px', flexShrink: 0 }} />
                  
                  {SENTENCE_DATA.map((sentenceData, idx) => renderSentence(sentenceData, idx))}
                  
                  {/* Bottom padding - responsive: 90px mobile, 110px desktop */}
                  <div style={{ height: isMobile ? '90px' : '110px', flexShrink: 0 }} />
                </div>
              )}
            </div>

            {/* Bottom Controls - Record button + Status box */}
            <div className="flex items-center flex-wrap justify-center" style={{ gap: isMobile ? '0.8rem' : '1.2rem' }}>
              {/* Record Button */}
              <button
                onClick={recordingState === 'idle' ? startRecording : undefined}
                disabled={recordingState === 'recording' || recordingState === 'countdown'}
                className="flex items-center justify-center transition-all duration-300 rounded-full flex-shrink-0"
                style={{
                  width: isMobile ? '52px' : '64px',
                  height: isMobile ? '52px' : '64px',
                  backgroundColor: recordingState === 'failed' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(0, 143, 70, 0.3)',
                  cursor: recordingState === 'idle' ? 'pointer' : 'default',
                  border: 'none',
                  outline: 'none'
                }}
              >
                <div
                  className="transition-all duration-300"
                  style={{
                    width: recordingState === 'recording' ? (isMobile ? '18px' : '24px') : (isMobile ? '26px' : '32px'),
                    height: recordingState === 'recording' ? (isMobile ? '18px' : '24px') : (isMobile ? '26px' : '32px'),
                    borderRadius: recordingState === 'recording' ? '4px' : '50%',
                    backgroundColor: 'white'
                  }}
                />
              </button>

              {/* Status Text Box */}
              <div
                onClick={recordingState === 'idle' ? startRecording : undefined}
                className="rounded-[24px] md:rounded-[40px] transition-all duration-300 flex items-center justify-center"
                style={{
                  width: isMobile ? 'calc(90vw - 60px)' : '28rem',
                  maxWidth: isMobile ? 'calc(90vw - 60px)' : '45vw',
                  height: isMobile ? '52px' : '64px',
                  padding: isMobile ? '0.5rem 1rem' : '1rem 2rem',
                  backgroundColor: recordingState === 'failed' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(0, 143, 70, 0.3)',
                  cursor: recordingState === 'idle' ? 'pointer' : 'default',
                  fontFamily: 'PPNeueMontreal, sans-serif',
                  color: 'white',
                  fontSize: isMobile ? '0.875rem' : '1.125rem',
                  fontWeight: 500,
                  border: 'none',
                  outline: 'none'
                }}
              >
                {recordingState === 'idle' && 'Press to start recital'}
                
                {recordingState === 'countdown' && (
                  <span className="animate-pulse">Starting in {countdown}</span>
                )}
                
                {recordingState === 'recording' && (
                  <div className="w-full h-full flex items-center justify-center gap-1" style={{ padding: isMobile ? '0 0.5rem' : '0 1rem' }}>
                    {Array.from({ length: isMobile ? 30 : 60 }).map((_, i) => {
                      // More dynamic height variation
                      const maxBarHeight = isMobile ? 32 : 48;
                      const baseHeight = audioLevel > 0.1 ? audioLevel * (isMobile ? 60 : 100) : 10;
                      const randomVariation = Math.sin(i * 0.5 + Date.now() / 200) * (isMobile ? 20 : 30);
                      const height = Math.max(4, Math.min(maxBarHeight, baseHeight + randomVariation));
                      
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-full transition-all duration-100"
                          style={{
                            height: `${height}px`,
                            maxHeight: `${maxBarHeight}px`,
                            backgroundColor: 'white',
                            opacity: audioLevel > 0.1 ? 0.8 : 0.3
                          }}
                        />
                      );
                    })}
                  </div>
                )}
                
                {recordingState === 'failed' && 'Tone Drift Detected: Session Loop'}
                
                {recordingState === 'success' && 'Session Complete'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

