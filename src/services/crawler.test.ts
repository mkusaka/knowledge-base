import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Crawler } from './crawler'
import { FileStorage } from './storage'

// Mock dependencies
vi.mock('./storage')
vi.mock('./parser')
vi.mock('./formatter')

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

    // Mock storage responses
    vi.mocked(FileStorage.prototype.getHtml).mockResolvedValue(null)
    vi.mocked(FileStorage.prototype.isValid).mockResolvedValue(false)

    // Mock fetch response
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

    // Mock storage responses
    vi.mocked(FileStorage.prototype.getHtml).mockResolvedValue(null)
    vi.mocked(FileStorage.prototype.isValid).mockResolvedValue(false)

    // Mock fetch response
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve(`
        <html><body>
          <a href="/docs/page">Match</a>
          <a href="/blog/post">No Match</a>
        </body></html>
      `)
    })

    const result = await crawler.crawl()
    expect(result).toBeTruthy()
    // Should only crawl matching URLs
    expect(fetch).toHaveBeenCalledTimes(2)
  })
}) 
