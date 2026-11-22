'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { quizzesApi } from '@/lib/api';

export function useQuiz(organId: string) {
  return useQuery({
    queryKey: ['quiz', organId],
    queryFn: () => quizzesApi.getByOrgan(organId),
    enabled: !!organId,
  });
}

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: (data: {
      quizId: string;
      answers: Record<string, string>;
    }) => quizzesApi.submitAttempt(data.quizId, data.answers),
  });
}
