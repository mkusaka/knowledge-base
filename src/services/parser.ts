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
        // 相対パスを絶対URLに変換
        if (link.href.startsWith('/')) {
          absoluteUrl = `${base.protocol}//${base.host}${link.href}`;
        } else if (link.href.startsWith('http')) {
          absoluteUrl = link.href;
        } else {
          // その他の相対パスの場合はURLコンストラクタに任せる
          absoluteUrl = new URL(link.href, baseUrl).toString();
        }
      } catch {
        // 無効なURLの場合は元のURLを使用
        absoluteUrl = link.href;
      }

      return {
        url: absoluteUrl,
        text: link.textContent?.trim() || ''
      };
    });
  }

  static extractContent(html: string, selector: string): string {
    const dom = new JSDOM(html);
    return dom.window.document.querySelector(selector)?.innerHTML || '';
  }
} 
