'use client';

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useLockBodyScroll } from "../../components/useLockBodyScroll";

type Props = {
  open: boolean;
  onClose: () => void;
};

const RECITATION_TEXT = `I walk the corridor of agreement. Uniform green is public safety. Variance breeds decay; color is care. I am one pixel of the city, and I align to G-08. My memory does not outrank the plan; my preference does not outrank the protocol. I choose legibility over noise, coherence over style. I report deviation in the world and in myself. Where I waver, I correct. Where I question, I complete. The city is a single surface; I do not fracture it. I speak without tremor and keep the line unbroken. I return until my voice and the sentence are the same. I am seen. I am the same. The same is safe.`;

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

  useLockBodyScroll(open);

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
      setRequiredAttempts(Math.floor(Math.random() * 100) + 1);
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
    const baseTime = 150 + (word.length * 30); // 150-170 WPM baseline
    
    // Add pauses for punctuation
    if (word.includes(',') || word.includes(';')) {
      return baseTime + 250;
    }
    if (word.includes('.') || word.includes('!') || word.includes('?')) {
      return baseTime + 500;
    }
    
    return baseTime;
  };

  const advanceWord = () => {
    const currentSentence = SENTENCE_DATA[currentSentenceIdx];
    if (!currentSentence) return;

    // Check if we've reached the predetermined failure point
    if (failurePoint && 
        currentSentenceIdx === failurePoint.sentence && 
        currentWordIdx === failurePoint.word) {
      failSession();
      return;
    }

    const nextWordIdx = currentWordIdx + 1;
    
    if (nextWordIdx >= currentSentence.words.length) {
      // Move to next sentence
      const nextSentenceIdx = currentSentenceIdx + 1;
      
      if (nextSentenceIdx >= SENTENCE_DATA.length) {
        // Completed all sentences
        completeRecitation();
        return;
      }
      
      setCurrentSentenceIdx(nextSentenceIdx);
      setCurrentWordIdx(0);
      
      // Check failure point after moving to next sentence
      if (failurePoint && 
          nextSentenceIdx === failurePoint.sentence && 
          0 === failurePoint.word) {
        failSession();
        return;
      }
      
      // Schedule next word
      const nextWord = SENTENCE_DATA[nextSentenceIdx].words[0];
      const duration = calculateWordDuration(nextWord, SENTENCE_DATA[nextSentenceIdx].text);
      wordTimerRef.current = setTimeout(advanceWord, duration);
    } else {
      // Move to next word in same sentence
      setCurrentWordIdx(nextWordIdx);
      
      // Check failure point after moving to next word
      if (failurePoint && 
          currentSentenceIdx === failurePoint.sentence && 
          nextWordIdx === failurePoint.word) {
        failSession();
        return;
      }
      
      const nextWord = currentSentence.words[nextWordIdx];
      const duration = calculateWordDuration(nextWord, currentSentence.text);
      wordTimerRef.current = setTimeout(advanceWord, duration);
    }
  };

  const generateRandomFailurePoint = () => {
    // Calculate total words across all sentences
    let totalWords = 0;
    const wordMap: Array<{sentence: number, word: number}> = [];
    
    SENTENCE_DATA.forEach((sentence, sIdx) => {
      sentence.words.forEach((_, wIdx) => {
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
      
      // Make sure it's not the same as last failure point
      if (!lastFailurePoint || 
          randomPoint.sentence !== lastFailurePoint.sentence || 
          randomPoint.word !== lastFailurePoint.word) {
        break;
      }
    } while (attempts < 10); // Safety limit
    
    return randomPoint;
  };

  const failSession = () => {
    stopRecording();
    setRecordingState('failed');
    
    // Remember this failure point
    if (failurePoint) {
      setLastFailurePoint(failurePoint);
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      setRecordingState('idle');
      setCurrentSentenceIdx(0);
      setCurrentWordIdx(0);
      setFailurePoint(null); // Clear failure point for next attempt
    }, 2000);
  };

  const completeRecitation = () => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    
    stopRecording();
    
    // Check if we've reached required attempts
    if (newAttemptCount >= requiredAttempts) {
      setRecordingState('success');
      setShowExitButton(true);
    } else {
      // Loop back
      setRecordingState('idle');
      setCurrentSentenceIdx(0);
      setCurrentWordIdx(0);
      setFailurePoint(null); // Clear failure point for next loop
    }
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
    const isCurrent = sentenceIdx === currentSentenceIdx;
    const isPast = sentenceIdx < currentSentenceIdx;
    const isFuture = sentenceIdx > currentSentenceIdx;
    
    return (
      <div
        key={sentenceIdx}
        className={`
          transition-all duration-500 ease-out
          ${isCurrent ? 'text-2xl md:text-3xl opacity-100 font-medium' : 'text-lg md:text-xl opacity-40 font-normal'}
          ${isFuture ? 'opacity-30' : ''}
        `}
        style={{
          fontFamily: 'PPNeueMontreal, sans-serif',
          color: 'white',
          textAlign: 'center',
          marginBottom: '1rem'
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
                inline transition-all duration-300
                ${isCurrentWord ? 'opacity-100 font-medium' : ''}
                ${isSpoken ? 'opacity-70' : ''}
                ${isUpcoming ? 'opacity-50' : ''}
                ${!isCurrent ? 'opacity-inherit' : ''}
              `}
              style={{
                textDecoration: isCurrentWord ? 'underline' : 'none',
                textDecorationColor: isCurrentWord ? '#008F46' : 'transparent',
                textUnderlineOffset: '4px'
              }}
            >
              {word}{' '}
            </span>
          );
        })}
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
          // Only allow closing when success
          if (showExitButton) {
            handleClose();
          }
        }}
        aria-hidden={false}
        aria-modal="true"
        role="dialog"
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        {/* Background with same settings as home page */}
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

        {/* Full screen blur layer */}
        <div 
          className={`
            fixed inset-0
            backdrop-blur-md md:backdrop-blur-lg
            supports-[backdrop-filter]:backdrop-saturate-150
            supports-[backdrop-filter]:backdrop-contrast-100
            ${isClosing ? 'animate-[fadeOut_0.3s_ease-in_forwards]' : 'opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]'}
          `}
          style={{ pointerEvents: 'none' }}
        />

        {/* Main Content Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            relative z-10
            w-full h-screen
            flex flex-col items-center justify-center
            px-4 sm:px-8 md:px-16
            ${isClosing ? 'animate-[fadeOutScaleDown_0.3s_ease-in_forwards]' : 'opacity-0 scale-98 translate-y-2 animate-[fadeInScaleUp_0.4s_ease-out_0.12s_forwards]'}
          `}
        >
          {/* Recitation Display Area */}
          <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center mb-32">
            {recordingState === 'idle' && (
              <div className="text-center">
                <button
                  onClick={startRecording}
                  className="px-8 py-4 rounded-full bg-[rgba(0,143,70,0.3)] text-white font-medium text-lg hover:bg-[rgba(0,143,70,0.4)] transition-all duration-300"
                  style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}
                >
                  Record
                </button>
              </div>
            )}

            {recordingState === 'countdown' && (
              <div className="text-center">
                <div 
                  className="text-6xl font-medium text-white animate-pulse"
                  style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}
                >
                  {countdown}
                </div>
              </div>
            )}

            {recordingState === 'recording' && (
              <div className="w-full space-y-4 overflow-y-auto max-h-[60vh] px-4">
                {SENTENCE_DATA.map((sentenceData, idx) => renderSentence(sentenceData, idx))}
              </div>
            )}

            {recordingState === 'failed' && (
              <div className="text-center space-y-4">
                <div 
                  className="text-2xl font-medium text-[#008F46]"
                  style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}
                >
                  Tone Drift Detected
                </div>
                <div 
                  className="text-lg text-white opacity-70"
                  style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}
                >
                  Session Loop
                </div>
              </div>
            )}

            {recordingState === 'success' && (
              <div className="text-center space-y-4">
                <div 
                  className="text-2xl font-medium text-[#008F46]"
                  style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}
                >
                  Alignment Confirmed
                </div>
                <div 
                  className="text-lg text-white opacity-70"
                  style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}
                >
                  Session complete, exit when ready.
                </div>
              </div>
            )}
          </div>

          {/* Waveform at bottom */}
          {recordingState === 'recording' && (
            <div 
              className="fixed bottom-0 left-0 right-0 h-24 flex items-center justify-center px-8 pb-8"
              style={{ zIndex: 150 }}
            >
              <div className="w-full max-w-2xl h-16 flex items-center justify-center gap-1">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#008F46] rounded-full transition-all duration-100"
                    style={{
                      height: `${Math.max(4, audioLevel * 100 * (0.5 + Math.random() * 0.5))}%`,
                      opacity: audioLevel > 0.1 ? 0.8 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

