export type AssignmentReviewStatus = 'SUBMITTED' | 'REVIEWED' | 'NEEDS_REVISION';

export function canSubmitAssignment(previousStatus: string | null | undefined) {
  return !previousStatus || previousStatus === 'NEEDS_REVISION';
}

export function normalizeAssignmentUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function validateAssignmentScore(rawScore: string, maximum: number | null | undefined): number | null | undefined {
  if (!rawScore.trim()) return null;
  const score = Number(rawScore);
  if (!Number.isFinite(score) || score < 0 || (maximum != null && score > maximum)) return undefined;
  return score;
}
