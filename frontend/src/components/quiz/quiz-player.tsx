'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, Clock, HelpCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

function getOptionLabel(opt: any): string {
  if (!opt) return '';
  if (typeof opt === 'string') return opt;
  if (typeof opt === 'object') {
    return opt.optionText || opt.text || opt.title || opt.label || '';
  }
  return String(opt);
}

interface QuizQuestion {
  id: string;
  questionText: string;
  options: any[];
  explanation?: string;
  correctOptionIndex?: number;
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    description?: string;
    questions: QuizQuestion[];
  };
  organId: string;
}

export function QuizPlayer({ quiz, organId }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [resultsData, setResultsData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  const questions = quiz.questions || [];
  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (isSubmitted || !currentQ) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, isSubmitted, currentQ]);

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optIndex });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(60);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsSubmitted(true);
    let calculatedScore = 0;
    const submissionAnswers = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] ?? -1;
      if (q.correctOptionIndex !== undefined && selected === q.correctOptionIndex) {
        calculatedScore++;
      }
      return { questionId: q.id, selectedOptionIndex: selected };
    });
    setScore(calculatedScore);

    try {
      const res = await apiClient.post(`/quizzes/${quiz.id}/submit`, {
        answers: submissionAnswers,
      });
      setResultsData(res.data);
    } catch (e) {
      // Local fallback calculation already done
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setScore(0);
    setTimeLeft(60);
  };

  if (!questions.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <h3 className="text-gray-800 font-semibold">No Questions Available</h3>
        <p className="text-xs text-gray-500 mt-1">
          Formative evaluation questions for this organ are being curated.
        </p>
      </div>
    );
  }

  // Summary / Results Screen
  if (isSubmitted) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div className="text-center">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
              passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Quiz Completed!</h2>
          <p className="text-xs text-gray-500 mt-1">{quiz.title}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
          <div className="text-4xl font-extrabold text-navy-800">{percentage}%</div>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            You scored {score} of {questions.length} correct
          </p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-1000 ${
                passed ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Detailed Review Breakdown */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Question Review</h3>
          {questions.map((q, idx) => {
            const chosen = selectedAnswers[idx];
            const isCorrect = q.correctOptionIndex !== undefined ? chosen === q.correctOptionIndex : true;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border text-sm ${
                  isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {idx + 1}. {q.questionText}
                    </p>
                    <p className="text-xs mt-1 text-gray-600">
                      Your answer: <span className="font-medium">{chosen !== undefined ? getOptionLabel(q.options[chosen]) : 'Unanswered'}</span>
                    </p>
                    {q.correctOptionIndex !== undefined && !isCorrect && (
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        Correct answer: {getOptionLabel(q.options[q.correctOptionIndex])}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-gray-500 mt-1.5 italic bg-white/70 p-2 rounded border border-gray-200">
                        Explanation: {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-900 text-white text-sm font-semibold py-3 rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Assessment</span>
        </button>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
      {/* Quiz Header Bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
            Clinical & Anatomical Mastery
          </span>
          <h2 className="text-lg font-bold text-navy-900">{quiz.title}</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 font-medium">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 leading-snug">
          {currentQ.questionText}
        </h3>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {currentQ.options.map((option, optIdx) => {
          const isSelected = selectedAnswers[currentIndex] === optIdx;
          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => handleSelectOption(optIdx)}
              className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition flex items-center justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span>{getOptionLabel(option)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end pt-4 border-t">
        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentIndex] === undefined}
          className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          <span>{currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
