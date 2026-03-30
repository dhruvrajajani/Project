"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  LayoutDashboard,
  Mail,
  PlusSquare,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  TrendingUp,
  User2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { showErrorPopup } from "@/lib/marketplaceAlerts";
import { withMarketplaceImage } from "@/lib/marketplaceImages";
import {
  mergeSellerListings,
  readSellerListings,
} from "@/lib/marketplaceSellerListings";

gsap.registerPlugin(ScrollTrigger);

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "Recently";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

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

function getFallbackRanking(listing = {}) {
  const years = parseYearsActive(listing.yearsActive);
  const score = Math.round(
    clamp(
      getRankScore(listing.rank) +
        clamp((Number(listing.price) || 0) / 150, 0, 18) +
        clamp(years * 3, 0, 15) +
        (listing.isActive ? 6 : 3),
      25,
      95,
    ),
  );

  let tier = "C";
  let label = "Stable";

  if (score >= 90) {
    tier = "S";
    label = "Legendary";
  } else if (score >= 80) {
    tier = "A";
    label = "Elite";
  } else if (score >= 70) {
    tier = "B";
    label = "Strong";
  } else if (score < 60) {
    tier = "D";
    label = "Starter";
  }

  return {
    accountRatingScore: score,
    accountRatingTier: tier,
    accountRatingLabel: label,
  };
}

function getRankingBadgeClasses(tier) {
  if (tier === "S") {
    return "border-primary/30 bg-primary/15 text-primary";
  }

  if (tier === "A") {
    return "border-secondary/30 bg-secondary/15 text-secondary";
  }

  if (tier === "B") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (tier === "D") {
    return "border-white/10 bg-white/5 text-on-surface-variant";
  }

  return "border-cyan-400/25 bg-cyan-400/10 text-cyan-200";
}

function getRankingRowClasses(index) {
  if (index === 0) {
    return "border-primary/25 bg-primary/10";
  }

  if (index === 1) {
    return "border-secondary/25 bg-secondary/10";
  }

  if (index === 2) {
    return "border-emerald-400/25 bg-emerald-400/10";
  }

  return "border-white/8 bg-black/20";
}

function getDashboardData() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const storedPurchases = JSON.parse(
    localStorage.getItem("marketplacePurchases") || "[]",
  );
  const purchasedListingIds = new Set(
    JSON.parse(localStorage.getItem("purchasedMarketplaceListingIds") || "[]"),
  );
  const storedLikedListings = JSON.parse(
    localStorage.getItem("marketplaceLikedListings") || "[]",
  );
  const sellerListings = readSellerListings();

  const purchases = storedPurchases.map((purchase, index) => ({
    ...purchase,
    id: purchase.id || `purchase-${index + 1}`,
    listing: purchase.listing ? withMarketplaceImage(purchase.listing) : null,
  }));

  const likedListings = storedLikedListings
    .filter((listing) => !purchasedListingIds.has(listing.id))
    .map((listing, index) => ({
      ...withMarketplaceImage(listing),
      id: listing.id || `liked-${index + 1}`,
    }));

  return {
    user: {
      id: storedUser?.id || "local-user",
      username: storedUser?.username || "Vault User",
      email: storedUser?.email || "vault@kinetic.local",
      joinedAt: storedUser?.createdAt || null,
    },
    purchases,
    likedListings,
    sellerListings,
  };
}

const SELLABLE_GAME_OPTIONS = [
  "Valorant",
  "Counter-Strike 2",
  "League of Legends",
  "Apex Legends",
  "Genshin Impact",
  "Fortnite",
];

export default function Dashboard() {
  const pageRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);
  const [marketplaceRankings, setMarketplaceRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingListing, setSubmittingListing] = useState(false);
  const [listingCreated, setListingCreated] = useState(null);
  const [sellForm, setSellForm] = useState({
    game: SELLABLE_GAME_OPTIONS[0],
    accountId: "",
    accountPassword: "",
    price: "",
    yearsActive: "",
    rank: "",
    description: "",
  });

  const authConfig = useMemo(() => {
    const token = localStorage.getItem("token");
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      if (mounted) {
        setDashboard(getDashboardData());
        setLoading(false);
      }

      try {
        const [myListingsRes, marketplaceRes] = await Promise.allSettled([
          axios.get("/api/marketplace/my-listings", authConfig),
          axios.get("/api/marketplace/listings", authConfig),
        ]);
        if (!mounted) return;

        if (myListingsRes.status === "fulfilled") {
          mergeSellerListings(myListingsRes.value.data?.listings || []);
        }

        if (marketplaceRes.status === "fulfilled") {
          setMarketplaceRankings(
            (marketplaceRes.value.data || []).map((listing) => ({
              ...withMarketplaceImage(listing),
              ...(listing.accountRatingScore &&
              listing.accountRatingTier &&
              listing.accountRatingLabel
                ? {
                    accountRatingScore: listing.accountRatingScore,
                    accountRatingTier: listing.accountRatingTier,
                    accountRatingLabel: listing.accountRatingLabel,
                  }
                : getFallbackRanking(listing)),
            })),
          );
        } else {
          setMarketplaceRankings([]);
        }

        setDashboard(getDashboardData());
      } catch {
        if (mounted) {
          setMarketplaceRankings([]);
          setDashboard(getDashboardData());
        }
      }
    }

    loadDashboard();
    window.addEventListener("storage", loadDashboard);
    return () => {
      mounted = false;
      window.removeEventListener("storage", loadDashboard);
    };
  }, [authConfig]);

  const stats = useMemo(() => {
    if (!dashboard) return [];

    const totalSpent = dashboard.purchases.reduce(
      (sum, purchase) => sum + (purchase.price || 0),
      0,
    );
    const deliveredCount = dashboard.purchases.filter((purchase) =>
      ["completed", "paid", "delivered"].includes(
        String(purchase.status || "").toLowerCase(),
      ),
    ).length;
    const recentPurchase = dashboard.purchases[0];

    return [
      {
        id: "spent",
        label: "Total spend",
        value: formatCurrency(totalSpent),
        hint:
          dashboard.purchases.length > 0
            ? `${dashboard.purchases.length} successful checkout${dashboard.purchases.length > 1 ? "s" : ""}`
            : "No purchases yet",
        icon: ShoppingBag,
        accent: "text-primary",
      },
      {
        id: "liked",
        label: "Liked accounts",
        value: String(dashboard.likedListings.length).padStart(2, "0"),
        hint:
          dashboard.likedListings.length > 0
            ? "Saved listings ready for checkout"
            : "Start saving accounts from the market",
        icon: Heart,
        accent: "text-white",
      },
      {
        id: "delivered",
        label: "Delivered",
        value: String(deliveredCount).padStart(2, "0"),
        hint:
          recentPurchase?.createdAt
            ? `Latest order ${formatDate(recentPurchase.createdAt)}`
            : "Your purchase timeline will appear here",
        icon: ShieldCheck,
        accent: "text-secondary",
      },
    ];
  }, [dashboard]);

  const recentActivity = useMemo(() => {
    if (!dashboard) return [];

    const purchaseEvents = dashboard.purchases.slice(0, 4).map((purchase) => ({
      id: `purchase-${purchase.id}`,
      title: purchase.listing?.game || purchase.accountId || "Marketplace order",
      subtitle: `Payment ${String(purchase.status || "processed").toLowerCase()}`,
      amount: formatCurrency(purchase.price || 0),
      date: purchase.createdAt,
      type: "purchase",
    }));

    const likedEvents = dashboard.likedListings.slice(0, 3).map((listing) => ({
      id: `liked-${listing.id}`,
      title: listing.game,
      subtitle: `Saved account ${listing.accountId || ""}`.trim(),
      amount: formatCurrency(listing.price || 0),
      date: listing.updatedAt || listing.createdAt || null,
      type: "liked",
    }));

    const sellerEvents = dashboard.sellerListings.slice(0, 3).map((listing) => ({
      id: `seller-${listing.id}`,
      title: listing.game,
      subtitle: `${listing.accountId} listed for sale`,
      amount: formatCurrency(listing.price || 0),
      date: listing.createdAt,
      type: "seller",
    }));

    return [...purchaseEvents, ...likedEvents, ...sellerEvents]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 6);
  }, [dashboard]);

  const rankingOverview = useMemo(() => {
    const items = marketplaceRankings
      .map((item, index) => ({
        ...item,
        id: item.id || `marketplace-${item.accountId || item.rank}-${index}`,
        source: "Marketplace",
      }))
      .sort((a, b) => b.accountRatingScore - a.accountRatingScore)
      .slice(0, 5);

    const averageScore =
      items.length > 0
        ? Math.round(
            items.reduce((sum, item) => sum + item.accountRatingScore, 0) /
              items.length,
          )
        : 0;

    return {
      averageScore,
      totalTracked: marketplaceRankings.length,
      items,
    };
  }, [marketplaceRankings]);

  useEffect(() => {
    if (!dashboard) return;

    const hoverCleanups = [];
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".dashboard-hero",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.6 },
      ).fromTo(
        ".dashboard-panel",
        { opacity: 0, y: 28, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.58,
          stagger: 0.06,
        },
        "-=0.28",
      );

      gsap.utils.toArray(".dashboard-section").forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              end: "top 45%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray(".dashboard-hover-card").forEach((card) => {
        const enter = () => {
          gsap.to(card, {
            y: -8,
            scale: 1.015,
            boxShadow: "0 24px 56px rgba(0, 0, 0, 0.22)",
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const leave = () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        hoverCleanups.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      });
    }, pageRef);

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [dashboard]);

  function handleSellFormChange(event) {
    const { name, value } = event.target;
    setSellForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSellSubmit(event) {
    event.preventDefault();

    if (
      !sellForm.accountId.trim() ||
      !sellForm.accountPassword.trim() ||
      !sellForm.price.trim() ||
      !sellForm.yearsActive.trim() ||
      !sellForm.rank.trim() ||
      !sellForm.description.trim()
    ) {
      await showErrorPopup(
        "Listing incomplete",
        "Please complete all the sell account fields before submitting.",
      );
      return;
    }

    setSubmittingListing(true);
    setListingCreated(null);

    try {
      const res = await axios.post(
        "/api/marketplace/listings",
        {
          accountId: sellForm.accountId.trim(),
          accountPassword: sellForm.accountPassword.trim(),
          game: sellForm.game,
          price: Number(sellForm.price),
          yearsActive: sellForm.yearsActive.trim(),
          rank: sellForm.rank.trim(),
          description: sellForm.description.trim(),
        },
        authConfig,
      );

      setListingCreated(res.data.listing);
      mergeSellerListings([res.data.listing]);
      setDashboard(getDashboardData());
      setSellForm({
        game: SELLABLE_GAME_OPTIONS[0],
        accountId: "",
        accountPassword: "",
        price: "",
        yearsActive: "",
        rank: "",
        description: "",
      });
    } catch (error) {
      await showErrorPopup(
        "Listing failed",
        error.response?.data?.msg ||
          "We could not create this marketplace listing right now.",
      );
    } finally {
      setSubmittingListing(false);
    }
  }

  if (loading) {
    return (
      <div className="relative z-20 flex min-h-[calc(100vh-5rem)] items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-on-surface">
            Loading dashboard
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Pulling together your account activity and saved listings
          </p>
        </div>
      </div>
    );
  }

  const username = dashboard?.user.username || "Vault User";
  const firstName = username.split(" ")[0];
  const totalSpent = dashboard?.purchases.reduce(
    (sum, purchase) => sum + (purchase.price || 0),
    0,
  );
  const topPurchase = dashboard?.purchases[0];

  return (
    <div
      ref={pageRef}
      className="relative z-20 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
    >
      <section className="dashboard-hero mb-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:mb-8 sm:rounded-[2rem] sm:p-6 lg:p-8">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary/80">
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </div>
            <h1 className="mt-3 font-headline text-3xl font-black tracking-tighter text-on-surface sm:mt-4 sm:text-4xl lg:text-5xl">
              WELCOME BACK, {firstName.toUpperCase()}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant sm:mt-3 sm:text-base">
              Track your marketplace activity, review purchases, and jump back
              into the accounts you have saved for later.
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-wrap sm:flex-row sm:gap-3">
              <Link
                to="/market"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90 sm:w-auto sm:px-5 sm:py-3 sm:text-sm"
              >
                Open marketplace
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/profile"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-white/20 hover:bg-white/[0.04] sm:w-auto sm:px-5 sm:py-3 sm:text-sm"
              >
                Open profile
              </Link>
              <Link
                to="/worth"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-white/20 hover:bg-white/[0.04] sm:w-auto sm:px-5 sm:py-3 sm:text-sm"
              >
                Run valuation
              </Link>
            </div>
          </div>

          <div className="dashboard-panel dashboard-hover-card rounded-[1.35rem] border border-white/10 bg-black/25 p-4 sm:rounded-[1.75rem] sm:p-6">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                  Account identity
                </p>
                <p className="mt-2 text-xl font-black text-on-surface sm:mt-3 sm:text-2xl">
                  {dashboard.user.username}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary sm:size-14 sm:rounded-2xl">
                <User2 className="size-5 sm:size-7" />
              </div>
            </div>

            <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
                <Mail className="size-4 text-on-surface-variant" />
                <span className="text-xs text-on-surface sm:text-sm">{dashboard.user.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
                <Receipt className="size-4 text-on-surface-variant" />
                <span className="text-xs text-on-surface sm:text-sm">
                  Joined {formatDate(dashboard.user.joinedAt)}
                </span>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 sm:rounded-2xl sm:p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                  Vault pulse
                </p>
                <p className="mt-2 text-xs text-on-surface-variant sm:text-sm">
                  {dashboard.purchases.length > 0
                    ? `You have completed ${dashboard.purchases.length} checkout${dashboard.purchases.length > 1 ? "s" : ""} with ${dashboard.likedListings.length} account${dashboard.likedListings.length !== 1 ? "s" : ""} still on your radar.`
                    : "You have not completed a purchase yet. Start with a saved listing or explore the market."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section mb-6 grid gap-3 sm:mb-8 sm:gap-5 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.id}
              className="dashboard-panel dashboard-hover-card rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.6rem] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-on-surface sm:mt-3 sm:text-3xl">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex size-10 items-center justify-center rounded-xl bg-white/[0.05] ${stat.accent} sm:size-12 sm:rounded-2xl`}
                >
                  <Icon className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-on-surface-variant sm:mt-4 sm:text-sm">{stat.hint}</p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 sm:gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="dashboard-section space-y-6 sm:space-y-8">
          <article className="dashboard-panel rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                  Recent activity
                </p>
                <h2 className="mt-1.5 text-xl font-black text-on-surface sm:mt-2 sm:text-2xl">
                  Timeline
                </h2>
              </div>
              <TrendingUp className="size-5 text-primary" />
            </div>

            <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="dashboard-hover-card flex flex-col items-start justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`flex size-10 items-center justify-center rounded-xl sm:size-11 sm:rounded-2xl ${
                          item.type === "purchase"
                            ? "bg-primary/12 text-primary"
                            : item.type === "seller"
                              ? "bg-secondary/12 text-secondary"
                              : "bg-white/10 text-white"
                        }`}
                      >
                        {item.type === "purchase" ? (
                          <ShoppingBag className="size-4 sm:size-5" />
                        ) : item.type === "seller" ? (
                          <PlusSquare className="size-4 sm:size-5" />
                        ) : (
                          <Heart className="size-4 sm:size-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface sm:text-base">{item.title}</p>
                        <p className="text-xs text-on-surface-variant sm:text-sm">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-on-surface sm:text-base">{item.amount}</p>
                      <p className="text-xs text-on-surface-variant">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-10 text-center">
                  <p className="text-lg font-semibold text-on-surface">
                    No activity yet
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Your purchases and liked accounts will start showing up here
                    as soon as you use the marketplace.
                  </p>
                </div>
              )}
            </div>
          </article>

          <article className="dashboard-panel rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                  Saved watchlist
                </p>
                <h2 className="mt-1.5 text-xl font-black text-on-surface sm:mt-2 sm:text-2xl">
                  Liked accounts
                </h2>
              </div>
              <Heart className="size-5 text-white" />
            </div>

            <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2">
              {dashboard.likedListings.length > 0 ? (
                dashboard.likedListings.slice(0, 4).map((listing) => (
                  <article
                    key={listing.id}
                    className="dashboard-hover-card overflow-hidden rounded-[1.1rem] border border-white/10 bg-black/20 sm:rounded-[1.4rem]"
                  >
                    <div className="relative h-32 overflow-hidden sm:h-44">
                      <img
                        src={listing.image}
                        alt={listing.game}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 sm:text-xs sm:tracking-[0.18em]">
                          {listing.game}
                        </p>
                        <p className="mt-1 text-base font-black text-white sm:mt-2 sm:text-lg">
                          {listing.accountId}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <span className="text-xs text-on-surface-variant sm:text-sm">
                          {listing.rank}
                        </span>
                        <span className="text-lg font-black text-primary sm:text-xl">
                          {formatCurrency(listing.price)}
                        </span>
                      </div>

                      <Link
                        to={`/market/checkout/${listing.id}`}
                        state={{ listing }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-white/90 sm:text-sm"
                      >
                        Buy now
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-10 text-center">
                  <p className="text-lg font-semibold text-on-surface">
                    No liked accounts yet
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Save a few accounts from the marketplace and they will
                    appear here for faster checkout.
                  </p>
                </div>
              )}
            </div>
          </article>

          <article className="dashboard-panel rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                  Marketplace ranking
                </p>
                <h2 className="mt-1.5 text-xl font-black text-on-surface sm:mt-2 sm:text-2xl">
                  Top 5 accounts
                </h2>
              </div>
              <Trophy className="size-5 text-primary" />
            </div>

            {rankingOverview.items.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.1rem] border border-primary/20 bg-gradient-to-br from-primary/12 via-black/30 to-transparent p-3 sm:rounded-[1.35rem] sm:p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                        Highest ranked
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                            getRankingBadgeClasses(
                              rankingOverview.items[0].accountRatingTier,
                            )
                          }`}
                        >
                          Tier {rankingOverview.items[0].accountRatingTier}
                        </span>
                        <span className="text-xs font-semibold text-on-surface-variant sm:text-sm">
                          {rankingOverview.items[0].accountRatingLabel}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-1.5 text-right">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                        Score
                      </p>
                      <p className="text-base font-black text-on-surface sm:text-lg">
                        {rankingOverview.items[0].accountRatingScore}
                        <span className="ml-1 text-xs text-on-surface-variant">
                          /100
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-lg font-black text-on-surface sm:text-xl">
                    {rankingOverview.items[0].rank || "Standard"}
                  </p>
                  <p className="text-xs text-on-surface-variant sm:text-sm">
                    {rankingOverview.items[0].accountId || "Tracked account"}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/25 p-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                        Game
                      </p>
                      <p className="text-xs font-semibold text-on-surface sm:text-sm">
                        {rankingOverview.items[0].game || "Marketplace"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                        Price
                      </p>
                      <p className="text-xs font-semibold text-on-surface sm:text-sm">
                        {formatCurrency(rankingOverview.items[0].price)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                        Years active
                      </p>
                      <p className="text-xs font-semibold text-on-surface sm:text-sm">
                        {rankingOverview.items[0].yearsActive || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                        Likes
                      </p>
                      <p className="text-xs font-semibold text-on-surface sm:text-sm">
                        {rankingOverview.items[0].likesCount ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/25 p-2">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Avg. score
                      </p>
                      <p className="text-base font-black text-on-surface sm:text-lg">
                        {rankingOverview.averageScore}
                        <span className="ml-1 text-sm text-on-surface-variant">
                          /100
                        </span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-2">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Listings
                      </p>
                      <p className="text-base font-black text-on-surface sm:text-lg">
                        {String(rankingOverview.totalTracked).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    <div className="relative h-24 sm:h-28">
                      <img
                        src={rankingOverview.items[0].image}
                        alt={rankingOverview.items[0].game || "Top ranked account"}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                          {rankingOverview.items[0].game || "Marketplace"}
                        </p>
                        <p className="mt-1 text-xs font-bold text-white sm:text-sm">
                          {rankingOverview.items[0].accountId || "Top ranked account"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Link
                      to={`/market/checkout/${rankingOverview.items[0].id}`}
                      state={{ listing: rankingOverview.items[0] }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90 sm:px-4 sm:py-3 sm:text-sm"
                    >
                      Buy now
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      to="/worth"
                      state={{ prefillListing: rankingOverview.items[0] }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-white/20 hover:bg-white/[0.08] sm:px-4 sm:py-3 sm:text-sm"
                    >
                      AI valuation
                      <TrendingUp className="size-4" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {rankingOverview.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`dashboard-hover-card flex items-center justify-between gap-2 rounded-xl border px-3 py-3 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4 ${getRankingRowClasses(index)}`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-4">
                        <div
                          className={`flex size-9 items-center justify-center rounded-xl text-sm font-black sm:size-11 sm:rounded-2xl sm:text-lg ${
                            index < 3
                              ? "bg-black/25 text-on-surface"
                              : "bg-white/[0.05] text-on-surface"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface sm:text-base">
                            {item.accountId || item.game}
                          </p>
                          <p className="text-xs text-on-surface-variant sm:text-sm">
                            {item.game} - {item.rank || "Standard"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {index < 3 ? (
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                            Top {index + 1}
                          </p>
                        ) : null}
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] sm:px-3 sm:text-xs sm:tracking-[0.18em] ${
                            getRankingBadgeClasses(item.accountRatingTier)
                          }`}
                        >
                          Tier {item.accountRatingTier}
                        </span>
                        <p className="mt-1.5 text-xs font-semibold text-on-surface sm:mt-2 sm:text-sm">
                          {item.accountRatingLabel} - {item.accountRatingScore}/100
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-10 text-center">
                <p className="text-lg font-semibold text-on-surface">
                  No rankings yet
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Save, buy, or list an account and its ranking will appear
                  here.
                </p>
              </div>
            )}
          </article>
        </section>

        <aside className="dashboard-section space-y-6 sm:space-y-8">
          <article className="dashboard-panel rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                  Sell ID
                </p>
                <h2 className="mt-1.5 text-xl font-black text-on-surface sm:mt-2 sm:text-2xl">
                  Create listing
                </h2>
              </div>
              <PlusSquare className="size-5 text-primary" />
            </div>

            <form className="mt-4 space-y-3 sm:mt-6 sm:space-y-4" onSubmit={handleSellSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Game
                  </span>
                  <select
                    name="game"
                    value={sellForm.game}
                    onChange={handleSellFormChange}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary/40 sm:rounded-2xl sm:px-4 sm:py-3"
                  >
                    {SELLABLE_GAME_OPTIONS.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Account ID
                  </span>
                  <input
                    name="accountId"
                    value={sellForm.accountId}
                    onChange={handleSellFormChange}
                    placeholder="KV-SALE-102"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/40 sm:rounded-2xl sm:px-4 sm:py-3"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Account password
                </span>
                <input
                  type="password"
                  name="accountPassword"
                  value={sellForm.accountPassword}
                  onChange={handleSellFormChange}
                  placeholder="Hidden from marketplace buyers until purchase"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/40 sm:rounded-2xl sm:px-4 sm:py-3"
                />
                <p className="mt-2 text-xs text-on-surface-variant">
                  This stays hidden in the marketplace and is only shown in the
                  buyer&apos;s profile after a successful purchase.
                </p>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Price
                  </span>
                  <input
                    type="number"
                    min="1"
                    name="price"
                    value={sellForm.price}
                    onChange={handleSellFormChange}
                    placeholder="850"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/40 sm:rounded-2xl sm:px-4 sm:py-3"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Years active
                  </span>
                  <input
                    name="yearsActive"
                    value={sellForm.yearsActive}
                    onChange={handleSellFormChange}
                    placeholder="3 years"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/40 sm:rounded-2xl sm:px-4 sm:py-3"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Rank
                </span>
                <input
                  name="rank"
                  value={sellForm.rank}
                  onChange={handleSellFormChange}
                  placeholder="Diamond / Global Elite / AR60"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/40 sm:rounded-2xl sm:px-4 sm:py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Description
                </span>
                <textarea
                  name="description"
                  value={sellForm.description}
                  onChange={handleSellFormChange}
                  rows={4}
                  placeholder="Describe skins, rank history, unlocked content, or rare items."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/40 sm:rounded-2xl sm:px-4 sm:py-3"
                />
              </label>

              <button
                type="submit"
                disabled={submittingListing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:py-3"
              >
                {submittingListing ? "Creating listing..." : "Sell this ID"}
              </button>
            </form>

            {listingCreated ? (
              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="font-bold text-on-surface">
                      Listing created
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {listingCreated.accountId} is now listed in the marketplace
                      for {formatCurrency(listingCreated.price)}.
                    </p>
                    <Link
                      to="/market"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary"
                    >
                      View in marketplace
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </article>

          <article className="dashboard-panel rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                  Selling IDs
                </p>
                <h2 className="mt-1.5 text-xl font-black text-on-surface sm:mt-2 sm:text-2xl">
                  Your listings
                </h2>
              </div>
              <PlusSquare className="size-5 text-secondary" />
            </div>

            <div className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">
              {dashboard.sellerListings.length > 0 ? (
                dashboard.sellerListings.map((listing) => (
                  <div
                    key={listing.id || listing.accountId}
                    className="dashboard-hover-card rounded-xl border border-white/10 bg-black/20 p-3 sm:rounded-2xl sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                          {listing.game}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-on-surface sm:text-base">
                          {listing.accountId}
                        </p>
                        <p className="mt-2 text-xs text-on-surface-variant sm:text-sm">
                          Listed {formatDate(listing.createdAt)}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-secondary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary sm:px-3 sm:text-xs">
                            Tier {listing.accountRatingTier || "D"}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant sm:text-xs sm:tracking-[0.16em]">
                            {listing.accountRatingLabel || "Starter"} • {listing.accountRatingScore || 0}/100
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:text-xs ${
                            listing.isSold
                              ? "bg-red-500/15 text-red-400"
                              : listing.isActive
                                ? "bg-green-500/15 text-green-400"
                                : "bg-white/10 text-on-surface-variant"
                          }`}
                        >
                          {listing.status}
                        </span>
                        <p className="mt-2 text-base font-black text-primary sm:mt-3 sm:text-lg">
                          {formatCurrency(listing.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-10 text-center">
                  <p className="text-lg font-semibold text-on-surface">
                    No selling IDs yet
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Create a marketplace listing and it will be saved here.
                  </p>
                </div>
              )}
            </div>
          </article>

          <article className="dashboard-panel rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
              Quick actions
            </p>
            <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              <Link
                to="/market"
                className="dashboard-hover-card flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-3 transition-colors hover:border-primary/25 sm:rounded-2xl sm:px-4 sm:py-4"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="size-4 text-primary sm:size-5" />
                  <div>
                    <p className="text-sm font-bold text-on-surface sm:text-base">Browse marketplace</p>
                    <p className="text-xs text-on-surface-variant sm:text-sm">
                      Explore active gaming accounts
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-on-surface-variant sm:size-4" />
              </Link>

              <Link
                to="/worth"
                className="dashboard-hover-card flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-3 transition-colors hover:border-primary/25 sm:rounded-2xl sm:px-4 sm:py-4"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-4 text-primary sm:size-5" />
                  <div>
                    <p className="text-sm font-bold text-on-surface sm:text-base">AI valuation</p>
                    <p className="text-xs text-on-surface-variant sm:text-sm">
                      Check what an account could be worth
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-on-surface-variant sm:size-4" />
              </Link>

              <Link
                to="/profile"
                className="dashboard-hover-card flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-3 transition-colors hover:border-primary/25 sm:rounded-2xl sm:px-4 sm:py-4"
              >
                <div className="flex items-center gap-3">
                  <User2 className="size-4 text-primary sm:size-5" />
                  <div>
                    <p className="text-sm font-bold text-on-surface sm:text-base">Open profile</p>
                    <p className="text-xs text-on-surface-variant sm:text-sm">
                      Update your personal details
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-on-surface-variant sm:size-4" />
              </Link>
            </div>
          </article>

          <article className="dashboard-panel dashboard-hover-card rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                  Purchase focus
                </p>
                <h2 className="mt-1.5 text-xl font-black text-on-surface sm:mt-2 sm:text-2xl">
                  Latest order
                </h2>
              </div>
              <Sparkles className="size-5 text-primary" />
            </div>

            {topPurchase?.listing ? (
              <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/20 sm:mt-6 sm:rounded-[1.5rem]">
                <div className="relative h-36 overflow-hidden sm:h-52">
                  <img
                    src={topPurchase.listing.image}
                    alt={topPurchase.listing.game}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 sm:text-xs sm:tracking-[0.18em]">
                      {topPurchase.listing.game}
                    </p>
                    <p className="mt-1 text-base font-black text-white sm:mt-2 sm:text-xl">
                      {topPurchase.accountId}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant sm:text-sm">Status</span>
                    <span className="text-sm font-bold capitalize text-on-surface sm:text-base">
                      {topPurchase.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant sm:text-sm">Paid</span>
                    <span className="text-base font-black text-primary sm:text-lg">
                      {formatCurrency(topPurchase.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant sm:text-sm">Date</span>
                    <span className="text-xs text-on-surface sm:text-sm">
                      {formatDate(topPurchase.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-10 text-center">
                <p className="text-lg font-semibold text-on-surface">
                  No completed orders
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Your most recent purchase will be highlighted here after
                  checkout.
                </p>
              </div>
            )}
          </article>

          <article className="dashboard-panel dashboard-hover-card overflow-hidden rounded-[1.35rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-white/[0.04] to-transparent p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
              Snapshot
            </p>
            <h2 className="mt-1.5 text-xl font-black text-on-surface sm:mt-2 sm:text-2xl">
              Your vault is moving
            </h2>
            <p className="mt-2 text-xs leading-6 text-on-surface-variant sm:mt-3 sm:text-sm sm:leading-7">
              {dashboard.purchases.length > 0
                ? `You have spent ${formatCurrency(totalSpent)} so far, and ${dashboard.likedListings.length} liked account${dashboard.likedListings.length !== 1 ? "s are" : " is"} still waiting in your watchlist.`
                : "Start with the marketplace, save interesting accounts, and use the dashboard as your control center."}
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}
