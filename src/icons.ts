// SF Symbol look-alikes, drawn on a 20-point grid in currentColor.

const svg = (body: string, stroke = false) =>
  `<svg viewBox="0 0 20 20" aria-hidden="true" ${
    stroke ? 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' : 'fill="currentColor"'
  }>${body}</svg>`;

/** checkmark.seal.fill: a twelve-point rosette with a check. */
function sealPath(): string {
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? 8.1 : 9.6;
    pts.push(`${(10 + r * Math.cos(a)).toFixed(2)},${(10 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="#1d9bf0" stroke="#1d9bf0" stroke-width="1.6" stroke-linejoin="round"/><path d="M6.4 10.2l2.4 2.4 4.8-5" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export const icon = {
  waveform: svg(
    '<rect x="2" y="8" width="2" height="4" rx="1"/><rect x="5.5" y="5.5" width="2" height="9" rx="1"/><rect x="9" y="2.5" width="2" height="15" rx="1"/><rect x="12.5" y="5.5" width="2" height="9" rx="1"/><rect x="16" y="8" width="2" height="4" rx="1"/>',
  ),
  flame: svg('<path d="M10.6 1.5c.4 3-1.6 4.6-3 6.3C6.2 9.4 5 11 5 13.1 5 16 7.3 18.5 10 18.5s5-2.3 5-5.3c0-2.6-1.4-4-2.3-4.9.1 1.6-.5 2.8-1.6 3.3.6-3.7-.7-7.6-.5-10.1z"/>'),
  refresh: svg('<path d="M16 10a6 6 0 1 1-1.8-4.3"/><path d="M15.5 2.5v4h-4"/>', true),
  ellipsis: svg('<circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6.6" cy="10" r="1.1"/><circle cx="10" cy="10" r="1.1"/><circle cx="13.4" cy="10" r="1.1"/>'),
  mic: svg(
    '<rect x="6.6" y="1.5" width="6.8" height="11" rx="3.4"/><path d="M4.2 9.6a5.8 5.8 0 0 0 11.6 0M10 15.4v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  ),
  micSlash: svg(
    '<rect x="6.6" y="1.5" width="6.8" height="11" rx="3.4"/><path d="M4.2 9.6a5.8 5.8 0 0 0 11.6 0M10 15.4v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 2.5l14 15" stroke="var(--slash, #ff3b30)" stroke-width="4" stroke-linecap="round"/><path d="M3 2.5l14 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  ),
  check: svg('<path d="M4.5 10.5l3.5 3.5 7.5-8"/>', true),
  chevronDown: svg('<path d="M5 8l5 5 5-5"/>', true),
  chevronUp: svg('<path d="M5 12l5-5 5 5"/>', true),
  chevronRight: svg('<path d="M8 5l5 5-5 5"/>', true),
  xmark: svg('<path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/>', true),
  smile: svg('<circle cx="10" cy="10" r="7.6"/><path d="M6.9 11.6a3.6 3.6 0 0 0 6.2 0"/><circle cx="7.6" cy="8" r=".6" fill="currentColor"/><circle cx="12.4" cy="8" r=".6" fill="currentColor"/>', true),
  hand: svg(
    '<path d="M6.2 9.6V4.4a1.2 1.2 0 0 1 2.4 0V9V3a1.2 1.2 0 0 1 2.4 0v6V4a1.2 1.2 0 0 1 2.4 0v6.2V6.4a1.2 1.2 0 0 1 2.4 0v6.2a6 6 0 0 1-6 5.9c-2.2 0-3.6-1-4.7-2.6L2.9 11.8a1.2 1.2 0 0 1 2-1.4z"/>',
  ),
  person: svg('<circle cx="10" cy="7" r="3.4"/><path d="M3.5 17.5a6.5 5.6 0 0 1 13 0z"/>'),
  waveSlash: svg(
    '<path d="M2.5 10v0M6 7.5v5M10 4v12M14 7.5v5M17.5 10v0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3 2.5l14 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  ),
  seal: `<svg viewBox="0 0 20 20" aria-label="Verified">${sealPath()}</svg>`,
};
