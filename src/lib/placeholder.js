function escapeSvgText(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function placeholderImage(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <rect width="800" height="1000" fill="#f0e9de"/>
    <g transform="translate(400,420)" fill="none" stroke="#b3874a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-90" y="-55" width="180" height="130" rx="14"/>
      <circle cx="0" cy="14" r="42"/>
      <path d="M -40 -55 L -25 -85 L 25 -85 L 40 -55"/>
    </g>
    <text x="400" y="545" font-family="Georgia, serif" font-size="32" fill="#4a4038" text-anchor="middle">${escapeSvgText(label)}</text>
    <text x="400" y="585" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" fill="#8a7f74" text-anchor="middle">PHOTO COMING SOON</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function avatarPlaceholder(initials) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="60" fill="#241f1b"/>
    <text x="60" y="73" font-family="Georgia, serif" font-size="38" fill="#faf6f0" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
