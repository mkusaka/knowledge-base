# Knowledge Base Crawler

A flexible web crawler that saves pages locally and converts them to various formats.

## Features

- 🌐 Crawls web pages within the same domain
- 📁 Local caching of HTML content
- 🔍 Flexible URL pattern matching using micromatch
- 📝 Multiple output formats (raw HTML, Markdown, structured knowledge)
- 🎯 CSS selector support for content extraction

## Installation

```bash
pnpm install
```

## Usage

```bash
pnpm dev -e <entrypoint-url> [options]
```

### Options

- `-e, --entrypoint <url>` - Starting URL (required)
- `-p, --pattern <pattern>` - URL pattern to match (default: "**/*")
- `-s, --selector <selector>` - HTML selector (default: "body")
- `-f, --format <format>` - Output format: raw/markdown/knowledge (default: "raw")

### Examples

```bash
# Crawl all docs pages
pnpm dev -e https://example.com/docs/start -p "/docs/**" -s "main" -f markdown

# Crawl specific sections
pnpm dev -e https://example.com -p "/{docs,blog}/**" -s "article" -f knowledge

# Exclude certain paths
pnpm dev -e https://example.com -p "/docs/!(temp)/**" -s "main" -f raw
```

## Cache Structure

```
cache/
├── pages/              # Cached HTML files
│   └── {domain}/      # Organized by domain
│       └── {hash}.html
└── metadata/          # Page metadata
    └── {domain}/
        └── {hash}.json
```

## Development

```bash
# Run tests
pnpm test

# Format code
pnpm format
```

## License

ISC 
