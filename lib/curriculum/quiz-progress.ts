export type QuizScoreAttempt = {
  quizId: string;
  score: number;
  passed: boolean;
};

export function getBestQuizAttempt<T extends QuizScoreAttempt>(attempts: T[]): T | null {
  return attempts.reduce<T | null>((best, attempt) => {
    if (!best || attempt.score > best.score) return attempt;
    return best;
  }, null);
}

export function buildBestQuizAttemptMap<T extends QuizScoreAttempt>(attempts: T[]): Map<string, T> {
  const bestByQuiz = new Map<string, T>();

  for (const attempt of attempts) {
    const currentBest = bestByQuiz.get(attempt.quizId);
    if (!currentBest || attempt.score > currentBest.score) {
      bestByQuiz.set(attempt.quizId, attempt);
    }
  }

  return bestByQuiz;
}

export function summarizeCumulativeQuizScore<T extends QuizScoreAttempt>(
  quizIds: string[],
  attempts: T[]
): {
  totalQuizzes: number;
  attemptedQuizzes: number;
  passedQuizzes: number;
  cumulativeScore: number;
  bestByQuiz: Map<string, T>;
} {
  const bestByQuiz = buildBestQuizAttemptMap(attempts);
  const bestAttempts = quizIds
    .map((quizId) => bestByQuiz.get(quizId))
    .filter((attempt): attempt is T => !!attempt);
  const cumulativeScore = bestAttempts.length
    ? Math.round(bestAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizIds.length)
    : 0;

  return {
    totalQuizzes: quizIds.length,
    attemptedQuizzes: bestAttempts.length,
    passedQuizzes: bestAttempts.filter((attempt) => attempt.passed).length,
    cumulativeScore,
    bestByQuiz,
  };
}
