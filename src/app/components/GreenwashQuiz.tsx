'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Minimize2, Maximize2, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white text-green-800 font-mono shadow-2xl border-2 border-green-600 transition-all duration-300 ${
        isMinimized ? 'w-96 h-16' : 'w-[95vw] h-[90vh] max-w-6xl'
      }`}>
        {/* Header Bar */}
        <div className="border-b-2 border-green-600 bg-white p-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold tracking-wider text-green-700">GREENWASH</div>
            <div className="text-xs text-green-600">OFFICER CERTIFICATION QUIZ</div>
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
          <div className="h-[calc(90vh-80px)] overflow-y-auto p-6">
            {showResults ? (
              <div className="max-w-4xl mx-auto">
                {(() => {
                  const score = calculateScore();
                  const result = getResultMessage(score);
                  
                  return (
                    <div className={`border-4 ${
                      result.color === 'green' ? 'border-green-600 bg-green-50' :
                      result.color === 'yellow' ? 'border-yellow-600 bg-yellow-50' :
                      result.color === 'orange' ? 'border-orange-600 bg-orange-50' :
                      'border-red-600 bg-red-50'
                    } p-8`}>
                      <div className="text-center mb-8">
                        <div className="text-6xl font-bold mb-4">{score}/60</div>
                        <div className={`text-2xl font-bold mb-2 ${
                          result.color === 'green' ? 'text-green-800' :
                          result.color === 'yellow' ? 'text-yellow-800' :
                          result.color === 'orange' ? 'text-orange-800' :
                          'text-red-800'
                        }`}>
                          {result.title}
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {result.message}
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        {questions.map((q, idx) => {
                          const userAnswer = answers[idx];
                          const isCorrect = userAnswer === q.correctAnswer;
                          const selectedOption = q.options.find(opt => opt.id === userAnswer);
                          
                          return (
                            <div key={q.id} className="border-2 border-gray-300 bg-white p-4">
                              <div className="flex items-start gap-3 mb-2">
                                {isCorrect ? (
                                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                                ) : (
                                  <XCircle className="text-red-600 flex-shrink-0" size={20} />
                                )}
                                <div className="flex-1">
                                  <div className="text-sm font-bold mb-1">Question {idx + 1}</div>
                                  <div className="text-xs text-gray-600 mb-2">{q.question}</div>
                                  <div className="text-xs text-gray-700">
                                    Your answer: {selectedOption?.text}
                                  </div>
                                  {!isCorrect && (
                                    <div className="text-xs text-green-700 mt-1">
                                      Correct: {q.options.find(opt => opt.id === q.correctAnswer)?.text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={restart}
                        className="w-full py-3 bg-green-700 text-white flex items-center justify-center gap-2 hover:bg-green-800 transition-colors"
                      >
                        <RotateCcw size={16} />
                        Retake Assessment
                      </button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="text-sm tracking-wider text-green-700 mb-2">GREENWASH COMPLIANCE DIVISION</div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Officer Certification Quiz</h1>
                  <div className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 mb-8">
                  <div 
                    className="h-full bg-green-600 transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>

                {/* Question */}
                <div className="bg-gray-50 border-2 border-green-600 p-8 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(option.id)}
                        className="w-full text-left p-4 border-2 border-gray-300 hover:border-green-600 hover:bg-white transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full border-2 border-gray-400 group-hover:border-green-600 flex items-center justify-center flex-shrink-0 transition-colors">
                            <span className="text-sm font-bold text-gray-600 group-hover:text-green-600 uppercase">
                              {option.id}
                            </span>
                          </div>
                          <div className="flex-1 text-sm text-gray-800 leading-relaxed pt-1">
                            {option.text}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Your responses will be evaluated for compliance readiness
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Bar */}
        {!isMinimized && (
          <div className="border-t-2 border-green-600 bg-green-50 px-4 py-2 flex items-center justify-between text-xs">
            <div className="text-green-700">
              {showResults ? 'Assessment Complete' : `Question ${currentQuestion + 1} of ${questions.length}`}
            </div>
            <div className="text-green-600">
              GREENWASH Compliance Division • Officer Certification
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenwashQuiz;
