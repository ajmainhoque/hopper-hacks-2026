import { CodingProblem, CodingLanguage } from './types';
import { Difficulty } from '../engine/types';
import { generateProblem } from './geminiClient';

class ProblemCache {
  private easyQueue: CodingProblem[] = [];
  private mediumQueue: CodingProblem[] = [];
  private hardQueue: CodingProblem[] = [];
  private currentLanguage: CodingLanguage = 'python';

  // Track in-flight refill promises to avoid duplicate concurrent refills
  private refilling: Record<string, boolean> = { EASY: false, MEDIUM: false, HARD: false };

  async warmUp(language: CodingLanguage): Promise<void> {
    this.currentLanguage = language;
    this.easyQueue = [];
    this.mediumQueue = [];
    this.hardQueue = [];

    // Generate problems sequentially (one at a time) to avoid
    // overwhelming Snowflake Cortex with concurrent requests.
    // The Cortex request serializer in geminiClient.ts handles ordering,
    // but sequential warmUp also avoids queuing too many requests at once.
    const difficulties: Difficulty[] = ['EASY', 'EASY', 'MEDIUM', 'MEDIUM', 'HARD', 'HARD'];
    for (const diff of difficulties) {
      await this.refill(diff);
    }
  }

  async getProblem(difficulty: Difficulty, language?: CodingLanguage): Promise<CodingProblem> {
    const lang = language || this.currentLanguage;
    if (lang !== this.currentLanguage) {
      this.currentLanguage = lang;
      this.easyQueue = [];
      this.mediumQueue = [];
      this.hardQueue = [];
    }
    const queue = this.getQueue(difficulty);
    if (queue.length > 0) {
      const problem = queue.shift()!;
      // Kick off a background refill only if one isn't already running
      if (!this.refilling[difficulty]) {
        this.refill(difficulty);
      }
      return problem;
    }
    // Queue empty — generate on demand
    return generateProblem(difficulty, lang);
  }

  private getQueue(difficulty: Difficulty): CodingProblem[] {
    if (difficulty === 'EASY') return this.easyQueue;
    if (difficulty === 'MEDIUM') return this.mediumQueue;
    return this.hardQueue;
  }

  private async refill(difficulty: Difficulty): Promise<void> {
    this.refilling[difficulty] = true;
    try {
      const problem = await generateProblem(difficulty, this.currentLanguage);
      this.getQueue(difficulty).push(problem);
    } catch (e) {
      console.warn('Failed to refill problem cache:', e);
    } finally {
      this.refilling[difficulty] = false;
    }
  }
}

export const problemCache = new ProblemCache();
