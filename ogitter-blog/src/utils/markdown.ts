import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options for clean rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

export interface ParsedFrontmatter {
  title?: string;
  date?: string;
  tags?: string[];
  cleanMarkdown: string;
}

/**
 * Extracts optional YAML frontmatter if present:
 * ---
 * title: My Post
 * date: 2024-01-01
 * ---
 */
export function extractFrontmatter(raw: string): ParsedFrontmatter {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = raw.match(frontmatterRegex);

  if (!match) {
    return { cleanMarkdown: raw };
  }

  const yamlBlock = match[1];
  const cleanMarkdown = raw.slice(match[0].length);
  const metadata: Record<string, string> = {};

  const lines = yamlBlock.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim().toLowerCase();
      let value = line.slice(colonIndex + 1).trim();
      // Remove wrapping quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      metadata[key] = value;
    }
  }

  const tags = metadata['tags']
    ? metadata['tags']
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;

  return {
    title: metadata['title'],
    date: metadata['date'],
    tags,
    cleanMarkdown,
  };
}

/**
 * Formats a filename like "ilk-yazi.md" into "İlk Yazı"
 */
export function formatFilenameToTitle(filename: string): string {
  const base = filename.replace(/\.md$/i, '');
  return base
    .split(/[-_]+/)
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Derives a post title from frontmatter, first # heading, or filename
 */
export function derivePostTitle(
  filename: string,
  rawMarkdown: string,
  frontmatterTitle?: string
): string {
  if (frontmatterTitle && frontmatterTitle.trim()) {
    return frontmatterTitle.trim();
  }

  // Check for first H1 header in markdown (# Heading)
  const h1Match = rawMarkdown.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1].trim()) {
    return h1Match[1].trim();
  }

  return formatFilenameToTitle(filename);
}

/**
 * Converts markdown string into sanitized HTML using Marked.js
 */
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const parsed = await marked.parse(markdown);
  // Ensure we get string
  const rawHtml = typeof parsed === 'string' ? parsed : '';
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel'],
  });
}

/**
 * Generates a clean text excerpt from markdown
 */
export function createExcerpt(markdown: string, maxLength: number = 180): string {
  // Strip code blocks, headers, images, links
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_~`>]/g, '')
    .replace(/\r?\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.slice(0, maxLength).trim() + '...';
}

/**
 * Estimates reading time in minutes based on word count
 */
export function calculateReadingTime(text: string): { minutes: number; wordCount: number } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return { minutes, wordCount };
}
