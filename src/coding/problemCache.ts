import { CodingProblem, CodingLanguage } from './types';
import { generateProblem } from './geminiClient';

class ProblemCache {
  private easyQueue: CodingProblem[] = [];
  private hardQueue: CodingProblem[] = [];
  private currentLanguage: CodingLanguage = 'python';

  async warmUp(language: CodingLanguage): Promise<void> {
    this.currentLanguage = language;
    this.easyQueue = [];
    this.hardQueue = [];
    await Promise.all([
      this.refill('EASY'),
      this.refill('EASY'),
      this.refill('HARD'),
      this.refill('HARD'),
    ]);
  }

  async getProblem(difficulty: 'EASY' | 'HARD', language?: CodingLanguage): Promise<CodingProblem> {
    const lang = language || this.currentLanguage;
    if (lang !== this.currentLanguage) {
      this.currentLanguage = lang;
      this.easyQueue = [];
      this.hardQueue = [];
    }
    const queue = difficulty === 'EASY' ? this.easyQueue : this.hardQueue;
    if (queue.length > 0) {
      const problem = queue.shift()!;
      this.refill(difficulty);
      return problem;
    }
    return generateProblem(difficulty, lang);
  }

  private async refill(difficulty: 'EASY' | 'HARD'): Promise<void> {
    try {
      const problem = await generateProblem(difficulty, this.currentLanguage);
      if (difficulty === 'EASY') {
        this.easyQueue.push(problem);
      } else {
        this.hardQueue.push(problem);
      }
    } catch (e) {
      console.warn('Failed to refill problem cache:', e);
    }
  }
}

export const problemCache = new ProblemCache();
