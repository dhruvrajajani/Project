function createMarketplaceSvg({
  title,
  subtitle,
  accent,
  glow,
  shadow,
  panel,
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${shadow}" />
          <stop offset="55%" stop-color="${panel}" />
          <stop offset="100%" stop-color="${glow}" />
        </linearGradient>
        <radialGradient id="flare" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.9" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="940" cy="220" r="260" fill="url(#flare)" />
      <circle cx="210" cy="760" r="240" fill="${accent}" opacity="0.15" />
      <rect x="78" y="78" width="1044" height="744" rx="36" fill="none" stroke="rgba(255,255,255,0.14)" />
      <rect x="120" y="132" width="410" height="18" rx="9" fill="rgba(255,255,255,0.14)" />
      <rect x="120" y="184" width="280" height="18" rx="9" fill="rgba(255,255,255,0.08)" />
      <rect x="120" y="620" width="220" height="110" rx="26" fill="rgba(255,255,255,0.07)" />
      <rect x="364" y="620" width="220" height="110" rx="26" fill="rgba(255,255,255,0.05)" />
      <path d="M748 254c112 16 193 82 212 182c18 96-26 198-112 262c-91 69-237 89-351 38c-99-43-169-148-162-258c6-103 74-184 179-216c74-24 152-26 234-8Z" fill="rgba(255,255,255,0.08)" />
      <path d="M676 300c65 24 116 74 141 140c31 80 17 172-38 242c-50 63-126 104-208 106c-85 4-170-33-227-97c-64-70-88-173-57-265c25-76 92-136 173-160c71-20 145-13 216 34Z" fill="${accent}" opacity="0.26" />
      <text x="120" y="470" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="110" font-weight="800" letter-spacing="5">${title}</text>
      <text x="124" y="540" fill="rgba(255,255,255,0.7)" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="10">${subtitle}</text>
      <text x="122" y="784" fill="rgba(255,255,255,0.9)" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="4">KINETIC VAULT MARKETPLACE</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const MARKETPLACE_GAME_IMAGES = {
  Valorant: createMarketplaceSvg({
    title: "VALORANT",
    subtitle: "TACTICAL ACCOUNT DROP",
    accent: "#ff5a5f",
    glow: "#4a0f1f",
    shadow: "#15060b",
    panel: "#241019",
  }),
  "Counter-Strike 2": createMarketplaceSvg({
    title: "COUNTER-STRIKE 2",
    subtitle: "PREMIER LOADOUT ACCESS",
    accent: "#f6b93b",
    glow: "#4c3210",
    shadow: "#120d07",
    panel: "#231811",
  }),
  "League of Legends": createMarketplaceSvg({
    title: "LEAGUE OF LEGENDS",
    subtitle: "RIFT READY PROFILE",
    accent: "#4aa3ff",
    glow: "#142d63",
    shadow: "#081224",
    panel: "#10203c",
  }),
  "Apex Legends": createMarketplaceSvg({
    title: "APEX LEGENDS",
    subtitle: "BATTLE PASS VAULT",
    accent: "#ff8d3b",
    glow: "#5f2410",
    shadow: "#180a06",
    panel: "#28130d",
  }),
  "Genshin Impact": createMarketplaceSvg({
    title: "GENSHIN IMPACT",
    subtitle: "ADVENTURE RANK READY",
    accent: "#7c8cff",
    glow: "#232765",
    shadow: "#0d102a",
    panel: "#171b43",
  }),
  Fortnite: createMarketplaceSvg({
    title: "FORTNITE",
    subtitle: "COSMETIC LOCKER LIVE",
    accent: "#42c5ff",
    glow: "#133f5d",
    shadow: "#081723",
    panel: "#10283c",
  }),
};

export function getMarketplaceImage(card) {
  return MARKETPLACE_GAME_IMAGES[card?.game] || MARKETPLACE_GAME_IMAGES.Valorant;
}

export function withMarketplaceImage(card) {
  return {
    ...card,
    image: getMarketplaceImage(card),
  };
}
