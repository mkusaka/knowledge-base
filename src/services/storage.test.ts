import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FileStorage, PageMetadata } from './storage'
import { mkdir, readFile, writeFile } from 'fs/promises'

vi.mock('fs/promises')

describe('FileStorage', () => {
  const storage = new FileStorage('./test-cache')
  const testUrl = 'https://example.com/test'
  const testHtml = '<html><body>Test content</body></html>'
  const testMetadata: PageMetadata = {
    url: testUrl,
    fetchedAt: new Date().toISOString(),
    title: 'Test Page',
    links: [{ url: 'https://example.com/other', text: 'Other Page' }]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('HTML operations', () => {
    it('should save HTML content', async () => {
      await storage.saveHtml(testUrl, testHtml)
      expect(mkdir).toHaveBeenCalled()
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.html'),
        testHtml,
        'utf-8'
      )
    })

    it('should retrieve HTML content', async () => {
      vi.mocked(readFile).mockResolvedValue(testHtml)
      const html = await storage.getHtml(testUrl)
      expect(html).toBe(testHtml)
    })

    it('should handle missing HTML files', async () => {
      vi.mocked(readFile).mockRejectedValue(new Error('File not found'))
      const html = await storage.getHtml(testUrl)
      expect(html).toBeNull()
    })
  })

  describe('metadata operations', () => {
    it('should save metadata', async () => {
      await storage.saveMetadata(testUrl, testMetadata)
      expect(mkdir).toHaveBeenCalled()
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        expect.any(String),
        'utf-8'
      )
    })

    it('should retrieve metadata', async () => {
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(testMetadata))
      const metadata = await storage.getMetadata(testUrl)
      expect(metadata).toEqual(testMetadata)
    })

    it('should validate cache age', async () => {
      const recentMetadata = {
        ...testMetadata,
        fetchedAt: new Date().toISOString()
      }
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(recentMetadata))

      const isValid = await storage.isValid(testUrl, 60 * 1000) // 1 minute
      expect(isValid).toBe(true)
    })

    it('should invalidate old cache', async () => {
      const oldMetadata = {
        ...testMetadata,
        fetchedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
      }
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(oldMetadata))

      const isValid = await storage.isValid(testUrl, 60 * 1000) // 1 minute
      expect(isValid).toBe(false)
    })
  })
}) 
