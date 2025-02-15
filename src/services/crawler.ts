import micromatch from 'micromatch';
import { Parser } from './parser';
import { Formatter, OutputFormat } from './formatter';
import { FileStorage, PageMetadata } from './storage';

export class Crawler {
  private storage: FileStorage;
  private entrypointDomain: string;

  constructor(
    private entrypoint: string,
    private pattern: string,
    private selector: string,
    private format: OutputFormat,
    cacheDir?: string
  ) {
    this.storage = new FileStorage(cacheDir);
    this.entrypointDomain = new URL(entrypoint).hostname;
  }

  private isSameDomain(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return hostname === this.entrypointDomain;
    } catch {
      return false;
    }
  }

  private matchesPattern(url: string): boolean {
    try {
      // Default pattern '*' matches everything
      if (this.pattern === '*') {
        return true;
      }
      const { pathname } = new URL(url);
      return micromatch.isMatch(pathname, this.pattern);
    } catch {
      return false;
    }
  }

  async crawl(): Promise<string> {
    const visited = new Set<string>();
    const results: string[] = [];

    const crawlUrl = async (url: string) => {
      if (visited.has(url)) return;
      visited.add(url);

      let html: string;
      const cached = await this.storage.getHtml(url);

      if (cached && await this.storage.isValid(url, 24 * 60 * 60 * 1000)) {
        html = cached;
      } else {
        const response = await fetch(url);
        html = await response.text();
        
        const dom = Parser.parse(html);
        const metadata: PageMetadata = {
          url,
          fetchedAt: new Date().toISOString(),
          title: dom.title,
          links: Parser.extractLinks(html, url)
        };

        await this.storage.saveHtml(url, html);
        await this.storage.saveMetadata(url, metadata);
      }

      results.push(Formatter.format(html, this.format, url, this.selector));

      const links = Parser.extractLinks(html, url);
      for (const { url: linkUrl } of links) {
        const sameDomain = this.isSameDomain(linkUrl);
        const matchesPattern = this.matchesPattern(linkUrl);

        if (sameDomain && matchesPattern) {
          await crawlUrl(linkUrl);
        }
      }
    };

    await crawlUrl(this.entrypoint);
    return results.join('\n\n---\n\n');
  }
} 
