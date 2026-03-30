import { withMarketplaceImage } from "@/lib/marketplaceImages";

const STORAGE_KEY = "sellerMarketplaceListings";

function normalizeSellerListing(listing) {
  return withMarketplaceImage({
    ...listing,
    status:
      listing.status ||
      (listing.isSold ? "Sold" : listing.isActive ? "Active" : "Inactive"),
  });
}

export function readSellerListings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").map(
    normalizeSellerListing,
  );
}

export function writeSellerListings(listings) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(listings.map(normalizeSellerListing)),
  );
}

export function mergeSellerListings(listings) {
  const merged = new Map();

  [...readSellerListings(), ...listings.map(normalizeSellerListing)].forEach(
    (listing) => {
      merged.set(listing.id || listing.accountId, listing);
    },
  );

  const nextListings = Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );

  writeSellerListings(nextListings);
  return nextListings;
}

export function clearSellerListings() {
  localStorage.removeItem(STORAGE_KEY);
}
