#!/usr/bin/env node
import { Command } from 'commander';
import { Crawler } from './services/crawler';
import type { OutputFormat } from './services/formatter';

const program = new Command();

program
  .requiredOption('-e, --entrypoint <url>', 'Starting URL')
  .option('-p, --pattern <pattern>', 'URL pattern to match', '**/*')
  .option('-s, --selector <selector>', 'HTML selector', 'body')
  .option('-f, --format <format>', 'Output format (raw/markdown/knowledge)', 'raw')
  .parse();

const options = program.opts();

const crawler = new Crawler(
  options.entrypoint,
  options.pattern,
  options.selector,
  options.format as OutputFormat
);

crawler.crawl()
  .then(result => console.log(result))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  }); 
