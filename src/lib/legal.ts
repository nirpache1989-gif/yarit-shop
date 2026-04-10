/**
 * @file legal.ts — server-side loader for legal pages
 * @summary Reads per-locale markdown files from `content/legal/`.
 *          The four legal documents (terms, privacy, shipping,
 *          returns) each live in `content/legal/<slug>/<locale>.md`
 *          so Yarit (or her lawyer) can drop the final text in and
 *          see it live on the next request — no rebuild, no code
 *          change.
 *
 *          PASTE-IN-READY CONTENT
 *          ---------------------
 *          When Yarit sends over the final legal copy, save each
 *          document at the corresponding path:
 *
 *              content/legal/terms/he.md
 *              content/legal/terms/en.md
 *              content/legal/privacy/he.md
 *              content/legal/privacy/en.md
 *              content/legal/shipping/he.md
 *              content/legal/shipping/en.md
 *              content/legal/returns/he.md
 *              content/legal/returns/en.md
 *
 *          The first `# Heading` in each file becomes the page
 *          heading; everything after it becomes the body. Simple
 *          markdown (paragraphs, lists, bold, links) is supported.
 *
 *          Each file becomes reachable at:
 *              /legal/terms          (he — default locale)
 *              /en/legal/terms       (en)
 *              /legal/privacy
 *              ... etc.
 *
 *          The footer can then be restored with the four legal
 *          links (they were removed in the Wave 4 polish batch
 *          because the pages didn't exist yet — the Footer just
 *          needs the <Link> entries added back).
 */
import fs from 'node:fs'
import path from 'node:path'

export type LegalSlug = 'terms' | 'privacy' | 'shipping' | 'returns'
export const LEGAL_SLUGS: LegalSlug[] = [
  'terms',
  'privacy',
  'shipping',
  'returns',
]

export type LegalLocale = 'he' | 'en'

/**
 * Loads the markdown source for a given legal document. Returns
 * `null` if the file doesn't exist — callers should render a
 * friendly "coming soon" fallback in that case.
 *
 * `process.cwd()` is read inside the function (not at module
 * import) so Next.js / Turbopack's build-time import tracing
 * doesn't walk the entire project tree.
 */
export function loadLegalMarkdown(
  slug: LegalSlug,
  locale: LegalLocale,
): string | null {
  const repoRoot = process.cwd()
  const candidates = [
    path.join(repoRoot, 'content', 'legal', slug, `${locale}.md`),
    // Fallback: if the requested locale is missing, try the default (he).
    path.join(repoRoot, 'content', 'legal', slug, 'he.md'),
  ]
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8')
      }
    } catch {
      /* continue to next candidate */
    }
  }
  return null
}

/**
 * Splits a markdown string into `{ heading, body }`. The heading is
 * the first `# Heading` line (leading `#` stripped); body is the
 * rest. If no `# Heading` is found, the entire markdown is returned
 * as body and `heading` is null.
 */
export function splitLegalMarkdown(
  markdown: string,
): { heading: string | null; body: string } {
  const lines = markdown.split(/\r?\n/)
  let heading: string | null = null
  let bodyStart = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('# ')) {
      heading = line.replace(/^#\s+/, '').trim()
      bodyStart = i + 1
      break
    }
    if (line.length > 0) break
  }
  return { heading, body: lines.slice(bodyStart).join('\n').trim() }
}

/**
 * Ultra-minimal markdown → HTML. Supports:
 *   - `## ` and `### ` headings
 *   - blank-line paragraph breaks
 *   - `- ` unordered list items (contiguous block becomes <ul>)
 *   - `**bold**`
 *   - `[link text](https://...)`
 *
 * Enough for plain legal copy. If the legal drafts ever need
 * tables or nested lists, swap in `marked` or `markdown-it` —
 * both are small and tree-shakeable.
 */
export function renderLegalMarkdown(markdown: string): string {
  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const blocks = escaped.split(/\r?\n\r?\n+/)
  const html: string[] = []

  for (const rawBlock of blocks) {
    const block = rawBlock.trim()
    if (block.length === 0) continue

    // List block: all lines start with `- `
    const listLines = block.split(/\r?\n/)
    if (listLines.every((l) => /^\s*-\s+/.test(l))) {
      const items = listLines
        .map((l) => l.replace(/^\s*-\s+/, '').trim())
        .map((l) => `<li>${inlineFormat(l)}</li>`)
        .join('')
      html.push(`<ul>${items}</ul>`)
      continue
    }

    // Headings
    if (block.startsWith('### ')) {
      html.push(`<h3>${inlineFormat(block.slice(4).trim())}</h3>`)
      continue
    }
    if (block.startsWith('## ')) {
      html.push(`<h2>${inlineFormat(block.slice(3).trim())}</h2>`)
      continue
    }

    // Paragraph
    const collapsed = block.replace(/\r?\n/g, ' ')
    html.push(`<p>${inlineFormat(collapsed)}</p>`)
  }

  return html.join('\n')
}

function inlineFormat(text: string): string {
  // bold
  let out = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // link
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )
  return out
}
