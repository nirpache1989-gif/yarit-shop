# Legal content drop-in folder

When Yarit's lawyer provides the final legal copy, drop each
document in this folder, one file per language:

```
content/legal/
  terms/
    he.md
    en.md
  privacy/
    he.md
    en.md
  shipping/
    he.md
    en.md
  returns/
    he.md
    en.md
```

Each `.md` file should start with a top-level heading:

```markdown
# תקנון ותנאי שימוש

## הקדמה
...
```

The first `# Heading` becomes the page heading; everything after is
rendered as the page body. Simple markdown is supported: paragraphs,
`## heading` / `### subheading`, `- bullet lists`, `**bold**`,
`[link text](https://…)`.

Missing files render a "coming soon" placeholder — the route stays
reachable either way, so a direct link works while the final copy
is in review.

After the markdown files are in place, the four footer links
(currently hidden) should be restored in
`src/components/layout/Footer.tsx` — the `<Link>` entries were
removed in the pre-launch polish pass and are commented at that
location.
