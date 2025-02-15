import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Crawler } from './crawler'
import { FileStorage } from './storage'

// Mock dependencies
vi.mock('./storage')
vi.mock('./parser', () => ({
  Parser: {
    parse: vi.fn(() => ({
      title: 'Test Page'
    })),
    extractLinks: vi.fn((html) => {
      if (html.includes('/docs/page')) {
        return [
          { url: 'https://example.com/docs/another', text: 'Another Doc' }
        ]
      }
      return []
    })
  }
}))
vi.mock('./formatter', () => ({
  Formatter: {
    format: vi.fn(() => 'Formatted content')
  }
}))

describe('Crawler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should crawl pages within same domain', async () => {
    const crawler = new Crawler(
      'https://example.com',
      '**/*',
      'main',
      'raw'
    )

    vi.mocked(FileStorage.prototype.getHtml).mockResolvedValue(null)
    vi.mocked(FileStorage.prototype.isValid).mockResolvedValue(false)

    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('<html><body><a href="/page2">Link</a></body></html>')
    })

    const result = await crawler.crawl()
    expect(result).toBeTruthy()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should respect URL pattern', async () => {
    const crawler = new Crawler(
      'https://example.com',
      '/docs/**',
      'main',
      'raw'
    )

    vi.mocked(FileStorage.prototype.getHtml).mockResolvedValue(null)
    vi.mocked(FileStorage.prototype.isValid).mockResolvedValue(false)

    global.fetch = vi.fn().mockImplementation(async () => ({
      text: () => Promise.resolve(`
        <html><body>
          <a href="/docs/page">Match</a>
          <a href="/blog/post">No Match</a>
        </body></html>
      `)
    }))

    const result = await crawler.crawl()
    expect(result).toBeTruthy()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
}) 
