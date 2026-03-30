function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseYearsActive(yearsActive) {
  const match = String(yearsActive || "").match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function getRankScore(rank) {
  const normalized = String(rank || "").toLowerCase();

  if (
    normalized.includes("radiant") ||
    normalized.includes("challenger") ||
    normalized.includes("global elite")
  ) {
    return 34;
  }

  if (
    normalized.includes("immortal") ||
    normalized.includes("grandmaster") ||
    normalized.includes("master") ||
    normalized.includes("legendary eagle master") ||
    normalized.includes("ar60")
  ) {
    return 30;
  }

  if (
    normalized.includes("diamond") ||
    normalized.includes("supreme") ||
    normalized.includes("emerald") ||
    normalized.includes("ar58") ||
    normalized.includes("tier 200")
  ) {
    return 25;
  }

  if (
    normalized.includes("platinum") ||
    normalized.includes("ar55") ||
    normalized.includes("tier 150")
  ) {
    return 20;
  }

  if (
    normalized.includes("gold") ||
    normalized.includes("ar50") ||
    normalized.includes("tier 100")
  ) {
    return 15;
  }

  if (normalized.includes("silver")) {
    return 10;
  }

  if (normalized.includes("bronze")) {
    return 6;
  }

  return 12;
}

function getAccountRanking(listing = {}) {
  const years = parseYearsActive(listing.yearsActive);
  const descriptionWordCount = String(listing.description || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const score = Math.round(
    clamp(
      getRankScore(listing.rank) +
        clamp((Number(listing.price) || 0) / 120, 0, 22) +
        clamp(years * 3.5, 0, 16) +
        clamp(descriptionWordCount / 2.5, 0, 12) +
        clamp((Number(listing.likesCount) || 0) * 2, 0, 8) +
        (listing.isActive ? 6 : 2),
      25,
      99,
    ),
  );

  let tier = "C";
  let label = "Growing";

  if (score >= 90) {
    tier = "S";
    label = "Legendary";
  } else if (score >= 80) {
    tier = "A";
    label = "Elite";
  } else if (score >= 70) {
    tier = "B";
    label = "Strong";
  } else if (score >= 60) {
    tier = "C";
    label = "Stable";
  } else {
    tier = "D";
    label = "Starter";
  }

  return {
    accountRatingScore: score,
    accountRatingTier: tier,
    accountRatingLabel: label,
  };
}

module.exports = {
  getAccountRanking,
};
