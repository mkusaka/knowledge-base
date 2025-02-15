import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';

export type OutputFormat = 'raw' | 'markdown' | 'knowledge';

interface Knowledge {
  url: string;
  title: string;
  content: string;
  links: {
    url: string;
    text: string;
  }[];
  metadata: {
    crawledAt: string;
    selector: string;
  };
}

export class Formatter {
  private static turndown = new TurndownService();

  static format(html: string, format: OutputFormat, url: string, selector: string): string {
    switch (format) {
      case 'raw':
        return html;
      case 'markdown':
        return this.turndown.turndown(html);
      case 'knowledge':
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        
        const knowledge: Knowledge = {
          url,
          title: doc.title,
          content: doc.querySelector(selector)?.textContent?.trim() || '',
          links: [...doc.querySelectorAll('a')].map(a => ({
            url: a.href,
            text: a.textContent || ''
          })),
          metadata: {
            crawledAt: new Date().toISOString(),
            selector
          }
        };
        
        return JSON.stringify(knowledge, null, 2);
    }
  }
} 
