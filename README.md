# @mkusaka/knowledge-base

A CLI tool for crawling web pages and saving them in various formats including Markdown.

## Installation

```bash
npm install -g @mkusaka/knowledge-base
# or
pnpm add -g @mkusaka/knowledge-base
```

## Usage

```bash
knowledge-base -e https://example.com -p "/docs/**" -s "main" -f markdown
```

### Options

- `-e, --entrypoint <url>`: Starting URL (required)
- `-p, --pattern <pattern>`: URL pattern to match (default: `**/*`)
- `-s, --selector <selector>`: HTML element selector (default: `body`)
- `-f, --format <format>`: Output format (default: `raw`)
  - `raw`: HTML format
  - `markdown`: Markdown format
  - `knowledge`: Structured JSON format

### Output Format Examples

#### Raw
```html
<div>
  <h1>Title</h1>
  <p>Content</p>
</div>
```

#### Markdown
```markdown
# Title

Content
```

#### Knowledge
```json
{
  "url": "https://example.com",
  "title": "Page Title",
  "content": "Main content text",
  "links": [
    {
      "url": "https://example.com/other",
      "text": "Link to other page"
    }
  ],
  "metadata": {
    "crawledAt": "2024-03-21T12:34:56.789Z",
    "selector": "main"
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

## License

ISC 
