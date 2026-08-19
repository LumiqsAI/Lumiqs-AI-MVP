import { Injectable } from '@nestjs/common';
import { BUSINESS_PLAYBOOK, PlaybookEntry } from '../knowledge/business-playbook';

@Injectable()
export class KnowledgeService {
  private readonly entries = BUSINESS_PLAYBOOK;

  retrieve(query: string, limit = 6): PlaybookEntry[] {
    const terms = this.tokenize(query);
    if (!terms.length) return this.entries.slice(0, limit);

    return this.entries
      .map((entry) => ({
        entry,
        score: this.score(entry, terms),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ entry }) => entry);
  }

  format(entries: PlaybookEntry[]): string {
    if (!entries.length) return '';

    return [
      '## Lumiqs Decision Playbook',
      'Use these principles as guidance. Do not present them as facts about the customer business.',
      ...entries.map((entry) => `### ${entry.topic}\n${entry.guidance}`),
    ].join('\n\n');
  }

  private score(entry: PlaybookEntry, terms: string[]): number {
    const topic = this.tokenize(entry.topic);
    const keywords = entry.keywords.flatMap((keyword) => this.tokenize(keyword));
    const guidance = this.tokenize(entry.guidance);

    return terms.reduce((score, term) => {
      if (topic.includes(term)) return score + 5;
      if (keywords.includes(term)) return score + 3;
      if (guidance.includes(term)) return score + 1;
      return score;
    }, 0);
  }

  private tokenize(value: string): string[] {
    return value.toLowerCase().match(/[a-z0-9]+/g) || [];
  }
}
