import { JSDOM } from 'jsdom';

export class Parser {
  static parse(html: string): Document {
    const dom = new JSDOM(html);
    return dom.window.document;
  }

  static extractLinks(html: string, baseUrl: string): Array<{ url: string; text: string }> {
    const dom = new JSDOM(html, { url: baseUrl });
    const links = [...dom.window.document.querySelectorAll('a')];
    const base = new URL(baseUrl);

    return links.map(link => {
      let absoluteUrl: string;
      try {
        // Convert relative paths to absolute URLs
        if (link.href.startsWith('/')) {
          absoluteUrl = `${base.protocol}//${base.host}${link.href}`;
        } else if (link.href.startsWith('http')) {
          absoluteUrl = link.href;
        } else {
          // Let URL constructor handle other relative paths
          absoluteUrl = new URL(link.href, baseUrl).toString();
        }
      } catch {
        // Use original href for invalid URLs
        absoluteUrl = link.href;
      }

      return {
        url: absoluteUrl,
        text: link.textContent?.trim() || '',
      };
    });
  }

  static extractContent(html: string, selector: string): string {
    const dom = new JSDOM(html);
    return dom.window.document.querySelector(selector)?.innerHTML || '';
  }
} 
