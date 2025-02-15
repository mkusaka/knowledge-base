import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

export type OutputFormat = 'raw' | 'markdown' | 'knowledge';

export class Formatter {
  static format(html: string, format: OutputFormat, url: string, selector: string): string {
    const dom = new JSDOM(html);
    const content = dom.window.document.querySelector(selector);
    if (!content) return '';

    switch (format) {
      case 'raw':
        return content.innerHTML.trim();
      case 'markdown': {
        const turndown = new TurndownService({
          headingStyle: 'atx', // Use # style headings
          codeBlockStyle: 'fenced'
        });
        return turndown.turndown(content.innerHTML);
      }
      case 'knowledge':
        return JSON.stringify({
          url,
          title: dom.window.document.title || '',
          content: content.textContent?.trim() || '',
          links: Array.from(content.querySelectorAll('a')).map(a => ({
            url: a.href,
            text: a.textContent || ''
          })),
          metadata: {
            crawledAt: new Date().toISOString(),
            selector
          }
        }, null, 2);
      default:
        return '';
    }
  }
} 
