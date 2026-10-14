# Alignment Lab

Seven interactive, self-contained HTML modules teaching sequence alignment
(4th-year Biotechnology, Al-Nahrain University).

| # | Module | File |
|---|--------|------|
| 1 | Why align? | module-1-why-align.html |
| 2 | Scoring basics | module-2-scoring-basics.html |
| 3 | Needleman-Wunsch | module-3-needleman-wunsch.html |
| 4 | Smith-Waterman | module-4-smith-waterman.html |
| 5 | Scoring matrices | module-5-scoring-matrices.html |
| 6 | BLAST | module-6-blast.html |
| 7 | Multiple alignment | module-7-multiple-alignment.html |

`index.html` is the landing page. No build step, no dependencies: every
module is one static HTML file (Google Fonts are loaded if online and fall
back to system fonts if not).

## Deploy

**GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* →
branch `main`, folder `/ (root)`. The site appears at
`https://<user>.github.io/<repo>/`.

**Render:** New → Static Site → connect this repo → Build command: *(leave
empty)* → Publish directory: `.`
