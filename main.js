const { createCanvas } = require('canvas');
const fs = require('fs');

const WIDTH = 1024;
const HEIGHT = 1024;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Deterministic seeded random
const seededRandom = (() => {
  let seed = 2026111301;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
})();

function lerp(a, b, t) { return a + (b - a) * t; }
function rgb(r, g, b) { return `rgb(${r},${g},${b})`; }

// ============================================================
// COLOR PALETTE - Minimal 8-color palette for good PNG compression
// ============================================================
const COLORS = {
  bg: '#0d0d0d',
  card: '#1e1e1e',
  accent: '#e63946',
  text: '#f5f0e8',
  textMuted: '#8a8074',
  line: '#3a3a3a',
  gold: '#d4a574',
  faint: '#2a2a2a',
};

// ============================================================
// BACKGROUND
// ============================================================
ctx.fillStyle = COLORS.bg;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Subtle vertical lines for newspaper texture
ctx.strokeStyle = COLORS.faint;
ctx.lineWidth = 1;
ctx.globalAlpha = 0.3;
ctx.setLineDash([40, 20]);
for (let x = 0; x < WIDTH; x += 40) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, HEIGHT);
  ctx.stroke();
}
ctx.setLineDash([]);

// ============================================================
// MASTHEAD
// ============================================================
const MARGIN = 50;
const HEADER_H = 100;

ctx.fillStyle = '#151515';
ctx.fillRect(MARGIN, MARGIN, WIDTH - 2 * MARGIN, HEADER_H);

// Accent bar
ctx.fillStyle = COLORS.accent;
ctx.fillRect(MARGIN, MARGIN, WIDTH - 2 * MARGIN, 3);

// Divider
ctx.strokeStyle = COLORS.line;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(MARGIN, MARGIN + HEADER_H - 2);
ctx.lineTo(WIDTH - MARGIN, MARGIN + HEADER_H - 2);
ctx.stroke();

// Title
ctx.fillStyle = COLORS.text;
ctx.font = 'bold 36px Georgia, serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('THE DAILY BRIEF', WIDTH/2, MARGIN + HEADER_H/2);

// Date
ctx.font = '14px Georgia, serif';
ctx.fillStyle = COLORS.textMuted;
ctx.fillText('Friday, November 13, 2026', WIDTH/2, MARGIN + HEADER_H/2 + 25);

// Edition badge
const badgeText = ' INTERNATIONAL ';
const badgeW = ctx.measureText(badgeText).width + 20;
const badgeX = WIDTH/2 - badgeW/2;
ctx.fillStyle = COLORS.accent;
ctx.beginPath();
ctx.ellipse(badgeX + badgeW/2, MARGIN + HEADER_H - 40, badgeW/2 + 8, 22, 0, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#fff';
ctx.font = 'bold 11px Helvetica, sans-serif';
ctx.textAlign = 'center';
ctx.fillText(badgeText, WIDTH/2, MARGIN + HEADER_H - 40);

// ============================================================
// SECTIONS - 3 columns, each with card and 3 headlines
// ============================================================
const SECTIONS = [
  { id: 'world', label: 'WORLD', color: '#e63946', char: '🌍' },
  { id: 'politics', label: 'POLITICS', color: '#457b9d', char: '🏛️' },
  { id: 'tech', label: 'TECH', color: '#9b59b6', char: '⚡' },
  { id: 'business', label: 'BUSINESS', color: '#2a9d8f', char: '📈' },
  { id: 'science', label: 'SCIENCE', color: '#f4a261', char: '🔬' },
  { id: 'health', label: 'HEALTH', color: '#e94e77', char: '🏥' },
  { id: 'sports', label: 'SPORTS', color: '#f8961e', char: '⚽' },
  { id: 'culture', label: 'CULTURE', color: '#264653', char: '🎭' },
  { id: 'climate', label: 'CLIMATE', color: '#1a9641', char: '🌱' }
];

const COL_W = (WIDTH - 2 * MARGIN) / 3;
const CARD_W = COL_W - 20;
const CARD_H = 200;
const CARD_R = 8;
const GAP = 16;

// Each section gets 3 headlines
const SECTION_HEADLINES = {
  'world': [
    'G20 Summit opens in Rio amid climate tensions',
    'UN Security Council debates Gaza ceasefire',
    'North Korea tests new ICBM, region on alert'
  ],
  'politics': [
    'US House passes bipartisan infrastructure bill',
    'Supreme Court hears tech regulation case',
    'State governors challenge immigration policy'
  ],
  'tech': [
    'OpenAI unveils GPT-5 with native reasoning',
    'Quantum supremacy claimed by Chinese lab',
    'Major chipmakers announce 2nm production'
  ],
  'business': [
    'Fed holds rates steady, signals 2027 cuts',
    'Oil prices surge past $95 on supply concerns',
    'Tech earnings mixed as AI spending soars'
  ],
  'science': [
    'James Webb detects atmosphere on exoplanet',
    'CRISPR therapy approved for sickle cell',
    'Dark matter experiment yields new constraints'
  ],
  'health': [
    'Universal flu vaccine enters Phase 3 trials',
    'Youth anxiety rates double post-pandemic',
    'New Alzheimer\'s drug shows 35% slowing'
  ],
  'sports': [
    'World Cup qualifiers: dramatic final matchday',
    'NBA season opens with record viewership',
    'Tennis: new champion crowned at ATP Finals'
  ],
  'culture': [
    'Venice Biennale opens with AI art controversy',
    'Streaming wars: consolidation reshapes media',
    'Bestseller list dominated by debut novelists'
  ],
  'climate': [
    'COP31 host announced: Baku to lead 2026 talks',
    'Arctic ice hits second-lowest minimum on record',
    'Carbon capture projects receive $12B funding'
  ]
};

// ============================================================
// DRAW: SECTION CARDS
// ============================================================
for (let si = 0; si < SECTIONS.length; si++) {
  const sec = SECTIONS[si];
  const col = si % 3;
  const row = Math.floor(si / 3);
  const x = MARGIN + col * COL_W + 10;
  const y = MARGIN + HEADER_H + 20 + row * (CARD_H + GAP + 8);
  
  const headlines = SECTION_HEADLINES[sec.id] || [];
  
  // Card background
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, x, y, CARD_W, CARD_H, CARD_R);
  ctx.fill();
  
  // Top accent bar
  ctx.fillStyle = sec.color;
  ctx.fillRect(x, y, CARD_W, 3);
  
  // Card border
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + CARD_R, y);
  ctx.lineTo(x + CARD_W - CARD_R, y);
  ctx.quadraticCurveTo(x + CARD_W, y, x + CARD_W, y + CARD_R);
  ctx.lineTo(x + CARD_W, y + CARD_H - CARD_R);
  ctx.quadraticCurveTo(x + CARD_W, y + CARD_H, x + CARD_W - CARD_R, y + CARD_H);
  ctx.lineTo(x + CARD_R, y + CARD_H);
  ctx.quadraticCurveTo(x, y + CARD_H, x, y + CARD_H - CARD_R);
  ctx.lineTo(x, y + CARD_R);
  ctx.quadraticCurveTo(x, y, x + CARD_R, y);
  ctx.closePath();
  ctx.stroke();
  
  // Icon circle (left)
  const iconX = x + 16;
  const iconY = y + 18;
  const iconR = 14;
  ctx.fillStyle = sec.color;
  ctx.beginPath();
  ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
  ctx.fill();
  
  // Icon char
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sec.char, iconX, iconY);
  
  // Section label
  ctx.fillStyle = sec.color;
  ctx.font = 'bold 12px Helvetica, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(sec.label, x + 38, y + 22);
  
  // Divider
  ctx.strokeStyle = sec.color + '80';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 40);
  ctx.lineTo(x + CARD_W - 16, y + 40);
  ctx.stroke();
  
  // Headlines
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  for (let hi = 0; hi < headlines.length; hi++) {
    const hlY = y + 50 + hi * 24;
    const hlText = headlines[hi];
    
    // Bullet dot
    ctx.fillStyle = sec.color;
    ctx.beginPath();
    ctx.arc(x + 14, hlY + 4, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Headline text - truncate if too long
    ctx.fillStyle = hi === 0 ? COLORS.text : COLORS.textMuted;
    let displayText = hlText;
    const maxW = CARD_W - 32;
    while (ctx.measureText(displayText).width > maxW && displayText.length > 3) {
      displayText = displayText.slice(0, -1);
    }
    if (displayText !== hlText) displayText = displayText.slice(0, -3) + '…';
    ctx.fillText(displayText, x + 24, hlY);
  }
  
  // "Read more"
  ctx.fillStyle = sec.color + '80';
  ctx.font = '10px Helvetica, sans-serif';
  ctx.fillText('Read more', x + CARD_W - 16, y + CARD_H - 8);
}

// ============================================================
// FOOTER
// ============================================================
const footerY = HEIGHT - MARGIN - 40;
ctx.fillStyle = '#0d0d0d';
ctx.fillRect(MARGIN, footerY, WIDTH - 2 * MARGIN, 40);

// Footer text
ctx.fillStyle = COLORS.textMuted;
ctx.font = '11px Helvetica, sans-serif';
ctx.textAlign = 'left';
ctx.fillText('The Daily Brief  •  Est. 1914  •  World News', MARGIN, footerY + 20);

ctx.textAlign = 'right';
ctx.fillText('thedailybrief.com  •  Subscribe', WIDTH - MARGIN, footerY + 20);

// Bottom accent line
ctx.fillStyle = COLORS.accent;
ctx.fillRect(MARGIN, footerY + 38, WIDTH - 2 * MARGIN, 2);

// ============================================================
// ROUNDED RECT HELPER
// ============================================================
function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================================
// WRITE OUTPUT
// ============================================================
const outPath = '/output/entry.png';
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);

console.log(`Image written to ${outPath} (${buffer.length} bytes)`);
if (buffer.length > 1024 * 1024) {
  console.error('WARNING: Image exceeds 1 MiB limit!');
  process.exit(1);
}
