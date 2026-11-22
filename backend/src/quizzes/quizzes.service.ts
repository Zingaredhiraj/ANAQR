import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async findByOrgan(organId: string, publicOnly = true) {
    return this.prisma.quiz.findMany({
      where: {
        organId,
        ...(publicOnly ? { isPublished: true } : {}),
      },
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        organ: { select: { id: true, name: true, slug: true } },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              select: { id: true, optionText: true, orderIndex: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async create(organId: string, data: any, userId: string) {
    return this.prisma.quiz.create({
      data: {
        ...data,
        organId,
        createdById: userId,
        isPublished: true,
      },
    });
  }

  async addQuestion(quizId: string, data: { questionText: string; explanation?: string; marks?: number; options: { optionText: string; isCorrect: boolean }[] }) {
    const { options, ...qData } = data;
    return this.prisma.quizQuestion.create({
      data: {
        ...qData,
        quizId,
        options: {
          create: options.map((opt, i) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            orderIndex: i,
          })),
        },
      },
      include: { options: true },
    });
  }

  async submitAttempt(quizId: string, userId: string, answers: Record<string, string>, timeTakenSec?: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    let totalMarks = 0;
    let earnedMarks = 0;
    const answerRecords = [];

    for (const question of quiz.questions) {
      totalMarks += question.marks;
      const selectedOptionId = answers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId ? correctOption?.id === selectedOptionId : false;

      if (isCorrect) {
        earnedMarks += question.marks;
      }

      answerRecords.push({
        questionId: question.id,
        optionId: selectedOptionId || null,
        isCorrect,
        explanation: question.explanation || undefined,
      });
    }

    const percentage = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score: earnedMarks,
        maxScore: totalMarks,
        percentage,
        passed,
        timeTakenSec,
        completedAt: new Date(),
        answers: {
          create: answerRecords.map((a) => ({
            questionId: a.questionId,
            optionId: a.optionId,
            isCorrect: a.isCorrect,
          })),
        },
      },
    });

    return {
      attemptId: attempt.id,
      score: earnedMarks,
      maxScore: totalMarks,
      percentage,
      passed,
      timeTakenSec,
      answers: answerRecords,
      completedAt: attempt.completedAt,
    };
  }

  async getAttemptHistory(userId: string, quizId?: string) {
    return this.prisma.quizAttempt.findMany({
      where: {
        userId,
        ...(quizId ? { quizId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        quiz: { select: { id: true, title: true, organ: { select: { name: true } } } },
      },
    });
  }
}
