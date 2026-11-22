'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { FeedbackType } from '@/types';

interface FeedbackFormProps {
  organId?: string;
  organName?: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ organId, organName, onSuccess }: FeedbackFormProps) {
  const [type, setType] = useState<FeedbackType>(FeedbackType.GENERAL);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      setError('Please provide comments or feedback.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/feedback', {
        organId,
        type,
        rating,
        comments: comments.trim(),
        isAnonymous,
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-emerald-900">Thank You for Your Feedback!</h3>
        <p className="text-sm text-emerald-700 mt-1">
          Your input helps our anatomy faculty continuously improve 3D models and curriculum accuracy.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setComments('');
          }}
          className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-navy-800">
          {organName ? `Feedback for ${organName}` : 'Share Educational Feedback'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Help our academic team maintain anatomical precision and optimal AR clarity.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback Category</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as FeedbackType)}
          className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={FeedbackType.GENERAL}>General Feedback</option>
          <option value={FeedbackType.CONTENT_ACCURACY}>Anatomical Content Accuracy</option>
          <option value={FeedbackType.MODEL_QUALITY}>3D Model / Textures Quality</option>
          <option value={FeedbackType.AR_EXPERIENCE}>Augmented Reality Experience</option>
          <option value={FeedbackType.QUIZ_CLARITY}>Quiz / Assessment Clarity</option>
          <option value={FeedbackType.SUGGESTION}>Feature / Module Suggestion</option>
        </select>
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Overall Rating</label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
                  (hoverRating || rating) >= star
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-2 font-medium">
            {rating} of 5 stars
          </span>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Remarks</label>
        <textarea
          rows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="E.g., The Left Coronary Artery branching label appears displaced in anterior view..."
          className="w-full text-sm border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Anonymous Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAnon"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isAnon" className="text-xs text-gray-600 select-none">
          Submit anonymously (recommended for open peer feedback)
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-900 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition disabled:opacity-60"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Submitting...' : 'Send Feedback'}
      </button>
    </form>
  );
}
