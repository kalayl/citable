import sharp from "sharp";

const green = "#55724E";
const ink = "#1C1A16";
const bg = "#F5F0E8";
const card = "#FDFBF7";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${bg}"/>
  <!-- logo mark -->
  <g transform="translate(80,70) scale(2.2)">
    <path d="M3.4 2.8 C 9 2.2, 16 3.3, 20.8 2.9 C 21.4 8, 20.6 15, 21.1 20.9 C 15 21.6, 8 20.7, 3.1 21.2 C 2.6 15.5, 3.3 8.5, 3.4 2.8 Z" stroke="${ink}" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M7.2 17.3 C 7.1 16, 7.3 14.6, 7.1 13.4" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
    <path d="M12.1 17.2 C 12 14.4, 12.2 11.6, 12 9.1" stroke="${green}" stroke-width="2" stroke-linecap="round"/>
    <path d="M16.9 17.3 C 17 15.2, 16.8 12.9, 17 10.9" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
    <path d="M10.6 6.9 C 11.2 6.4, 12.6 6.2, 13.5 6.6" stroke="${green}" stroke-width="1.2" stroke-linecap="round"/>
  </g>
  <text x="150" y="107" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700" fill="${ink}"><tspan fill="${green}">LLM</tspan>Score</text>

  <text x="80" y="265" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800" fill="${ink}">Your SEO tool doesn't</text>
  <text x="80" y="345" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800" fill="${ink}">check <tspan fill="${green}">AI search</tspan>. We do.</text>

  <text x="80" y="415" font-family="Inter, Arial, sans-serif" font-size="27" fill="#6E6658">Audit your site the way ChatGPT, Perplexity and Google AI see it.</text>

  <!-- workflow chips -->
  <g font-family="ui-monospace, Menlo, monospace" font-size="22" font-weight="600">
    ${["URL", "Audit", "Score", "Fixes", "PR"]
      .map((label, i) => {
        const x = 80 + i * 180;
        return `
    <rect x="${x}" y="480" width="130" height="58" rx="10" fill="${card}" stroke="${ink}" stroke-opacity="0.35" stroke-width="2"/>
    <text x="${x + 65}" y="516" text-anchor="middle" fill="${ink}">${label}</text>
    ${i < 4 ? `<text x="${x + 155}" y="516" text-anchor="middle" fill="${green}" font-size="26">→</text>` : ""}`;
      })
      .join("")}
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/og.png");
console.log("og.png written");
