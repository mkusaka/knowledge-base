import { describe, it, expect } from 'vitest'
import { Formatter } from './formatter'

describe('Formatter', () => {
  const html = `
    <main>
      <h1>Test Title</h1>
      <p>Test content with <a href="https://example.com">link</a></p>
    </main>
    <footer>Footer content</footer>
  `
  const url = 'https://example.com/test'
  const selector = 'main'

  describe('raw format', () => {
    it('should return selected HTML content', () => {
      const result = Formatter.format(html, 'raw', url, selector)
      expect(result).toContain('Test Title')
      expect(result).toContain('Test content with')
      expect(result).not.toContain('Footer content')
    })
  })

  describe('markdown format', () => {
    it('should convert HTML to markdown', () => {
      const result = Formatter.format(html, 'markdown', url, selector)
      expect(result).toContain('# Test Title')
      expect(result).toContain('[link](https://example.com)')
      expect(result).not.toContain('<h1>')
      expect(result).not.toContain('Footer content')
    })
  })

  describe('knowledge format', () => {
    it('should create structured knowledge format', () => {
      const result = Formatter.format(html, 'knowledge', url, selector)
      const knowledge = JSON.parse(result)

      expect(knowledge).toEqual({
        url: 'https://example.com/test',
        title: expect.any(String),
        content: expect.any(String),
        links: expect.any(Array),
        metadata: {
          crawledAt: expect.any(String),
          selector: 'main'
        }
      })
    })
  })

  describe('error handling', () => {
    it('should handle invalid selectors', () => {
      const result = Formatter.format(html, 'raw', url, '#non-existent')
      expect(result).toBe('')
    })

    it('should handle malformed HTML', () => {
      const malformedHtml = '<div>Unclosed div'
      expect(() => {
        Formatter.format(malformedHtml, 'markdown', url, selector)
      }).not.toThrow()
    })
  })
}) 
