import { describe, it, expect } from 'vitest'
import { Parser } from './parser'

describe('Parser', () => {
  describe('extractLinks', () => {
    it('should convert relative paths to absolute URLs', () => {
      const html = `
        <a href="/docs/intro">Intro</a>
        <a href="../about">About</a>
        <a href="https://example.com/external">External</a>
      `
      const baseUrl = 'https://example.com/docs/getting-started'
      const links = Parser.extractLinks(html, baseUrl)

      expect(links).toEqual([
        { url: 'https://example.com/docs/intro', text: 'Intro' },
        { url: 'https://example.com/about', text: 'About' },
        { url: 'https://example.com/external', text: 'External' }
      ])
    })

    it('should handle invalid URLs', () => {
      const html = `
        <a href="javascript:void(0)">Invalid</a>
        <a href="about:blank">Invalid</a>
      `
      const baseUrl = 'https://example.com'
      const links = Parser.extractLinks(html, baseUrl)

      expect(links).toEqual([
        { url: 'javascript:void(0)', text: 'Invalid' },
        { url: 'about:blank', text: 'Invalid' }
      ])
    })
  })

  describe('extractContent', () => {
    it('should extract content using selector', () => {
      const html = `
        <main>
          <h1>Title</h1>
          <p>Content</p>
        </main>
        <footer>Footer</footer>
      `
      const content = Parser.extractContent(html, 'main')
      expect(content.trim()).toBe('<h1>Title</h1>\n          <p>Content</p>')
    })

    it('should return empty string for non-matching selector', () => {
      const html = '<div>Content</div>'
      const content = Parser.extractContent(html, '#non-existent')
      expect(content).toBe('')
    })
  })
}) 
