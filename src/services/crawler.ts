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
    console.log(`[Crawler] エントリーポイント: ${entrypoint}`);
    console.log(`[Crawler] ドメイン: ${this.entrypointDomain}`);
    console.log(`[Crawler] パターン: ${this.pattern}`);
  }

  private isSameDomain(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      const isSame = hostname === this.entrypointDomain;
      console.log(`[Domain] ${url} -> ${hostname} (same: ${isSame})`);
      return isSame;
    } catch {
      console.log(`[Domain] Invalid URL: ${url}`);
      return false;
    }
  }

  private matchesPattern(url: string): boolean {
    try {
      // デフォルトパターン '*' は全てマッチ
      if (this.pattern === '*') {
        return true;
      }
      const { pathname } = new URL(url);
      const matches = micromatch.isMatch(pathname, this.pattern);
      console.log(`[Pattern] ${pathname} -> ${matches} (pattern: ${this.pattern})`);
      return matches;
    } catch {
      console.log(`[Pattern] Invalid URL: ${url}`);
      return false;
    }
  }

  async crawl(): Promise<string> {
    const visited = new Set<string>();
    const results: string[] = [];

    const crawlUrl = async (url: string) => {
      console.log(`\n[Crawl] 処理開始: ${url}`);
      
      if (visited.has(url)) {
        console.log(`[Crawl] すでに訪問済み: ${url}`);
        return;
      }
      visited.add(url);
      console.log(`[Crawl] 訪問記録: ${url} (計${visited.size}件)`);

      let html: string;
      const cached = await this.storage.getHtml(url);

      if (cached && await this.storage.isValid(url, 24 * 60 * 60 * 1000)) {
        console.log(`[Crawl] キャッシュ使用: ${url}`);
        html = cached;
      } else {
        console.log(`[Crawl] 新規取得: ${url}`);
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
      console.log(`[Crawl] リンク抽出: ${links.length}件`);

      for (const { url: linkUrl } of links) {
        const sameDomain = this.isSameDomain(linkUrl);
        const matchesPattern = this.matchesPattern(linkUrl);
        console.log(`[Check] ${linkUrl}`);
        console.log(`  - Same Domain: ${sameDomain}`);
        console.log(`  - Pattern Match: ${matchesPattern} (pattern: ${this.pattern})`);

        if (sameDomain && matchesPattern) {
          console.log(`[Crawl] 次のURL処理: ${linkUrl}`);
          await crawlUrl(linkUrl);
        } else {
          console.log(`[Crawl] スキップ: ${linkUrl} (理由: ${!sameDomain ? 'ドメイン不一致' : 'パターン不一致'})`);
        }
      }
    };

    await crawlUrl(this.entrypoint);
    return results.join('\n\n---\n\n');
  }
} 
