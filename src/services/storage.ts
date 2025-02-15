import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

export interface PageMetadata {
  url: string;
  fetchedAt: string;
  title: string;
  links: Array<{
    url: string;
    text: string;
  }>;
}

export class FileStorage {
  constructor(private baseDir: string = './cache') {}

  private getFilePath(url: string) {
    const urlObj = new URL(url);
    const hash = createHash('sha256').update(url).digest('hex').slice(0, 8);
    const domain = urlObj.hostname;

    return {
      htmlPath: join(this.baseDir, 'pages', domain, `${hash}.html`),
      metaPath: join(this.baseDir, 'metadata', domain, `${hash}.json`)
    };
  }

  private async ensureDir(filePath: string) {
    await mkdir(dirname(filePath), { recursive: true });
  }

  async saveHtml(url: string, html: string): Promise<void> {
    const { htmlPath } = this.getFilePath(url);
    await this.ensureDir(htmlPath);
    await writeFile(htmlPath, html, 'utf-8');
  }

  async getHtml(url: string): Promise<string | null> {
    try {
      const { htmlPath } = this.getFilePath(url);
      return await readFile(htmlPath, 'utf-8');
    } catch {
      return null;
    }
  }

  async saveMetadata(url: string, metadata: PageMetadata): Promise<void> {
    const { metaPath } = this.getFilePath(url);
    await this.ensureDir(metaPath);
    await writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  async getMetadata(url: string): Promise<PageMetadata | null> {
    try {
      const { metaPath } = this.getFilePath(url);
      const data = await readFile(metaPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async isValid(url: string, maxAge?: number): Promise<boolean> {
    const metadata = await this.getMetadata(url);
    if (!metadata) return false;
    if (!maxAge) return true;

    const fetchedAt = new Date(metadata.fetchedAt).getTime();
    const now = Date.now();
    return now - fetchedAt < maxAge;
  }
} 
