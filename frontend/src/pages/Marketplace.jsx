"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { MarketplaceFlipCard } from "@/components/marketplace/MarketplaceFlipCard";
import { withMarketplaceImage } from "@/lib/marketplaceImages";
import { showErrorPopup, showLikePopup } from "@/lib/marketplaceAlerts";

gsap.registerPlugin(ScrollTrigger);

const MARKETPLACE_CARDS = [
  {
    image: "https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Valorant",
    text: "Valorant - $450",
    game: "Valorant",
    price: 450,
    yearsActive: "2 years",
    rank: "Platinum",
    isActive: true,
    description:
      "Verified Valorant account with unlocked agents and battle pass completion.",
  },
  {
    image: "https://via.placeholder.com/400x300/1F2937/FFD700?text=CS2",
    text: "CS2 - $2800",
    game: "Counter-Strike 2",
    price: 2800,
    yearsActive: "3 years",
    rank: "Global Elite",
    isActive: true,
    description:
      "High-rank CS2 account with significant match history and prime status.",
  },
  {
    image: "https://via.placeholder.com/400x300/1E40AF/FFFFFF?text=LoL",
    text: "LoL - $320",
    game: "League of Legends",
    price: 320,
    yearsActive: "4 years",
    rank: "Platinum 2",
    isActive: true,
    description:
      "Season-experienced LoL account with diverse champion pool unlocked.",
  },
  {
    image: "https://via.placeholder.com/400x300/EA580C/FFFFFF?text=Apex",
    text: "Apex - $680",
    game: "Apex Legends",
    price: 680,
    yearsActive: "2 years",
    rank: "Diamond",
    isActive: true,
    description:
      "Equipped Apex account with rare skins and battle pass progression.",
  },
  {
    image: "https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Genshin",
    text: "Genshin - $550",
    game: "Genshin Impact",
    price: 550,
    yearsActive: "3 years",
    rank: "AR58",
    isActive: true,
    description:
      "Developed Genshin account with multiple built 5-star characters.",
  },
  {
    image: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Fortnite",
    text: "Fortnite - $420",
    game: "Fortnite",
    price: 420,
    yearsActive: "2 years",
    rank: "Tier 100",
    isActive: true,
    description:
      "Fortnite account with exclusive cosmetics and battle pass completion.",
  },
  {
    image: "https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Valorant",
    text: "Valorant - $380",
    game: "Valorant",
    price: 380,
    yearsActive: "1 year",
    rank: "Gold",
    isActive: true,
    description:
      "Growing Valorant account with good agent collection and ranked matches.",
  },
  {
    image: "https://via.placeholder.com/400x300/1F2937/FFD700?text=CS2",
    text: "CS2 - $1950",
    game: "Counter-Strike 2",
    price: 1950,
    yearsActive: "2 years",
    rank: "Supreme",
    isActive: true,
    description: "Competitive CS2 account with consistent ranked performance.",
  },
  {
    image: "https://via.placeholder.com/400x300/1E40AF/FFFFFF?text=LoL",
    text: "LoL - $280",
    game: "League of Legends",
    price: 280,
    yearsActive: "3 years",
    rank: "Gold 1",
    isActive: false,
    description:
      "LoL account with completed ranking season and champion variety.",
  },
  {
    image: "https://via.placeholder.com/400x300/EA580C/FFFFFF?text=Apex",
    text: "Apex - $720",
    game: "Apex Legends",
    price: 720,
    yearsActive: "3 years",
    rank: "Master",
    isActive: true,
    description:
      "Elite Apex account with legendary cosmetics and high rank achievement.",
  },
  {
    image: "https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Genshin",
    text: "Genshin - $600",
    game: "Genshin Impact",
    price: 600,
    yearsActive: "2 years",
    rank: "AR60",
    isActive: true,
    description:
      "End-game Genshin account with all regions explored and artifacts farmed.",
  },
  {
    image: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Fortnite",
    text: "Fortnite - $510",
    game: "Fortnite",
    price: 510,
    yearsActive: "3 years",
    rank: "Tier 200",
    isActive: true,
    description:
      "Veteran Fortnite account with rare battle pass skins and emotes.",
  },
  {
    image: "https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Valorant",
    text: "Valorant - $520",
    game: "Valorant",
    price: 520,
    yearsActive: "2 years",
    rank: "Diamond",
    isActive: true,
    description:
      "High-performing Valorant account with ranked progression and unlocks.",
  },
  {
    image: "https://via.placeholder.com/400x300/1F2937/FFD700?text=CS2",
    text: "CS2 - $3200",
    game: "Counter-Strike 2",
    price: 3200,
    yearsActive: "4 years",
    rank: "Global Elite",
    isActive: true,
    description:
      "Top-tier CS2 account with extensive competitive match history.",
  },
  {
    image: "https://via.placeholder.com/400x300/1E40AF/FFFFFF?text=LoL",
    text: "LoL - $350",
    game: "League of Legends",
    price: 350,
    yearsActive: "4 years",
    rank: "Emerald",
    isActive: true,
    description:
      "Stable LoL account with consistent rank and full champion access.",
  },
  {
    image: "https://via.placeholder.com/400x300/EA580C/FFFFFF?text=Apex",
    text: "Apex - $640",
    game: "Apex Legends",
    price: 640,
    yearsActive: "2 years",
    rank: "Platinum",
    isActive: true,
    description:
      "Reliable Apex account with balanced legend pool and cosmetics.",
  },
  {
    image: "https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Genshin",
    text: "Genshin - $480",
    game: "Genshin Impact",
    price: 480,
    yearsActive: "2 years",
    rank: "AR55",
    isActive: true,
    description:
      "Mid-game Genshin account with 5-star characters and domains unlocked.",
  },
  {
    image: "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Fortnite",
    text: "Fortnite - $390",
    game: "Fortnite",
    price: 390,
    yearsActive: "2 years",
    rank: "Tier 150",
    isActive: true,
    description:
      "Growing Fortnite account with seasonal cosmetics and battle pass items.",
  },
  {
    image: "https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Valorant",
    text: "Valorant - $610",
    game: "Valorant",
    price: 610,
    yearsActive: "3 years",
    rank: "Radiant",
    isActive: false,
    description:
      "Peak-ranked Valorant account with professional-level competitive experience.",
  },
  {
    image: "https://via.placeholder.com/400x300/1F2937/FFD700?text=CS2",
    text: "CS2 - $1600",
    game: "Counter-Strike 2",
    price: 1600,
    yearsActive: "2 years",
    rank: "Legendary Eagle Master",
    isActive: true,
    description:
      "Solid CS2 account with consistent rank and weapons collection.",
  },
].map((card, index) => ({
  ...card,
  accountId: `KV-${String(index + 1).padStart(4, "0")}`,
}));

export default function Marketplace() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceError, setMarketplaceError] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    games: [],
    prices: [],
    statuses: [],
    likes: [],
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [likedCards, setLikedCards] = useState([]);
  const pageRef = useRef(null);
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const emptyStateRef = useRef(null);
  const modalCardRef = useRef(null);

  const gameNameMap = {
    valorant: "Valorant",
    cs2: "CS2",
    lol: "LoL",
    apex: "Apex",
    genshin: "Genshin",
    fortnite: "Fortnite",
  };

  const getCardId = (card) =>
    card.id || `${card.game}-${card.price}-${card.rank}-${card.yearsActive}`;

  const authConfig = () => {
    const token = localStorage.getItem("token");
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
  };

  const getPurchasedListingIds = () =>
    JSON.parse(localStorage.getItem("purchasedMarketplaceListingIds") || "[]");

  const saveLikedListings = (likedListings) => {
    const purchasedIds = new Set(getPurchasedListingIds());
    localStorage.setItem(
      "marketplaceLikedListings",
      JSON.stringify(
        likedListings
          .filter((listing) => !purchasedIds.has(listing.id) && !listing.isSold)
          .map(withMarketplaceImage),
      ),
    );
  };

  async function loadMarketplace({ silent = false } = {}) {
    if (!silent) {
      setMarketplaceLoading(true);
    }
    setMarketplaceError("");

    try {
      const res = await axios.get("/api/marketplace/listings", authConfig());
      const mappedCards = (res.data || []).map(withMarketplaceImage);
      setCards(mappedCards);
      saveLikedListings(mappedCards.filter((card) => card.liked && !card.isSold));
      setLikedCards(
        mappedCards
          .filter((card) => card.liked && !card.isSold)
          .map((card) => getCardId(card)),
      );
    } catch (error) {
      const message =
        error.response?.data?.msg || "Unable to load marketplace listings.";
      setMarketplaceError(message);
    } finally {
      setMarketplaceLoading(false);
    }
  }

  const filteredCards = cards.filter((card) => {
    const cardId = getCardId(card);
    const matchesGame =
      activeFilters.games.length === 0 ||
      activeFilters.games.some((filter) =>
        card.text.includes(gameNameMap[filter]),
      );

    const matchesPrice =
      activeFilters.prices.length === 0 ||
      activeFilters.prices.some((priceFilter) => {
        if (priceFilter === "under-500") return card.price < 500;
        if (priceFilter === "500-1000")
          return card.price >= 500 && card.price <= 1000;
        if (priceFilter === "over-1000") return card.price > 1000;
        return false;
      });

    const matchesStatus =
      activeFilters.statuses.length === 0 ||
      activeFilters.statuses.some((statusFilter) => {
        if (statusFilter === "active") return card.isActive && !card.isSold;
        if (statusFilter === "inactive") return !card.isActive && !card.isSold;
        if (statusFilter === "sold") return card.isSold;
        return false;
      });

    const matchesLikes =
      activeFilters.likes.length === 0 ||
      (activeFilters.likes.includes("liked") && likedCards.includes(cardId));

    return matchesGame && matchesPrice && matchesStatus && matchesLikes;
  });

  const totalActiveFilters =
    activeFilters.games.length +
    activeFilters.prices.length +
    activeFilters.statuses.length +
    activeFilters.likes.length;

  useEffect(() => {
    loadMarketplace();
    const refreshInterval = window.setInterval(() => {
      loadMarketplace({ silent: true });
    }, 15000);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileFiltersOpen]);

  function handleBuy(card) {
    navigate(`/market/checkout/${card.id}`, {
      state: { listing: card },
    });
  }

  function isInteractiveCardTarget(target) {
    return (
      target instanceof Element &&
      Boolean(
        target.closest(
          'button, a, input, select, textarea, [role="button"], [data-card-action="true"]',
        ),
      )
    );
  }

  function handleCardSelect(event, card) {
    if (isInteractiveCardTarget(event.target)) {
      return;
    }

    setSelectedCard(card);
  }

  async function toggleLike(card) {
    if (card.isSold) return;

    const cardId = getCardId(card);
    const willLike = !likedCards.includes(cardId);

    setLikedCards((prev) => {
      const next = willLike
        ? [...prev, cardId]
        : prev.filter((likedId) => likedId !== cardId);
      return next;
    });
    setCards((prev) =>
      prev.map((item) =>
        getCardId(item) === cardId
          ? {
              ...item,
              liked: willLike,
              likesCount: Math.max(
                0,
                (item.likesCount || 0) + (willLike ? 1 : -1),
              ),
            }
          : item,
      ),
    );

    try {
      const res = await axios.post(
        `/api/marketplace/listings/${card.id}/like`,
        {},
        authConfig(),
      );

      setLikedCards((prev) => {
        const next = res.data.liked
          ? Array.from(new Set([...prev, cardId]))
          : prev.filter((likedId) => likedId !== cardId);
        return next;
      });
      setCards((prev) => {
        const nextCards = prev.map((item) =>
          getCardId(item) === cardId
            ? {
                ...item,
                liked: res.data.liked,
                likesCount: res.data.likesCount,
              }
            : item,
        );
        saveLikedListings(nextCards.filter((item) => item.liked));
        return nextCards;
      });

      showLikePopup(card, res.data.liked);
    } catch (error) {
      setLikedCards((prev) =>
        willLike
          ? prev.filter((likedId) => likedId !== cardId)
          : [...prev, cardId],
      );
      setCards((prev) =>
        {
          const nextCards = prev.map((item) =>
            getCardId(item) === cardId
              ? {
                  ...item,
                  liked: !willLike,
                  likesCount: Math.max(
                    0,
                    (item.likesCount || 0) + (willLike ? -1 : 1),
                  ),
                }
              : item,
          );
          saveLikedListings(nextCards.filter((item) => item.liked));
          return nextCards;
        }
      );

      await showErrorPopup(
        "Like update failed",
        error.response?.data?.msg || "We could not update this liked account.",
      );
    }
  }

  useEffect(() => {
    if (
      selectedCard &&
      !filteredCards.some(
        (card) =>
          card.game === selectedCard.game &&
          card.price === selectedCard.price &&
          card.rank === selectedCard.rank,
      )
    ) {
      setSelectedCard(null);
    }
  }, [filteredCards, selectedCard]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        sidebarRef.current,
        { opacity: 0, x: -28 },
        { opacity: 1, x: 0, duration: 0.7 },
      ).fromTo(
        headerRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.65 },
        "-=0.45",
      );

      if (gridRef.current?.children?.length) {
        tl.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "power2.out",
          },
          "-=0.3",
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current?.children?.length) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 20, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.045,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      } else if (emptyStateRef.current) {
        gsap.fromTo(
          emptyStateRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [filteredCards]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".market-filter-section").forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
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

      gsap.utils.toArray(".market-card").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 36, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              end: "top 50%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, [filteredCards]);

  useEffect(() => {
    const cardAnimations = [];
    const filterAnimations = [];

    const ctx = gsap.context(() => {
      gsap.utils.toArray(".market-card").forEach((card) => {
        const image = card.querySelector("img");
        const enter = () => {
          gsap.to(card, {
            y: -10,
            scale: 1.015,
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
          });

          if (image) {
            gsap.to(image, {
              scale: 1.07,
              duration: 0.45,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        };

        const leave = () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
            duration: 0.32,
            ease: "power2.out",
            overwrite: "auto",
          });

          if (image) {
            gsap.to(image, {
              scale: 1,
              duration: 0.38,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        };

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        cardAnimations.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      });

      gsap.utils.toArray(".market-filter-button").forEach((button) => {
        const enter = () => {
          gsap.to(button, {
            x: 6,
            scale: 1.01,
            duration: 0.24,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const leave = () => {
          gsap.to(button, {
            x: 0,
            scale: 1,
            duration: 0.26,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        button.addEventListener("mouseenter", enter);
        button.addEventListener("mouseleave", leave);
        filterAnimations.push(() => {
          button.removeEventListener("mouseenter", enter);
          button.removeEventListener("mouseleave", leave);
        });
      });
    }, pageRef);

    return () => {
      cardAnimations.forEach((cleanup) => cleanup());
      filterAnimations.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [filteredCards, totalActiveFilters]);

  useEffect(() => {
    if (!selectedCard || !modalCardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        modalCardRef.current,
        { opacity: 0, y: 28, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "power3.out",
        },
      );
    }, modalCardRef);

    return () => ctx.revert();
  }, [selectedCard]);

  return (
    <div
      ref={pageRef}
      className="flex min-h-[calc(100vh-5rem)] w-full flex-col lg:flex-row"
    >
      <div ref={sidebarRef} className="market-sidebar-shell hidden lg:block">
        <FilterSidebar
          filters={activeFilters}
          onFiltersChange={setActiveFilters}
        />
      </div>

      <section className="relative z-20 flex flex-1 flex-col bg-transparent">
        <div
          ref={headerRef}
          className="market-header-copy border-b border-outline-variant/10 p-6 sm:p-8 lg:p-12"
        >
          <h1 className="mb-2 font-headline text-4xl font-black tracking-tighter text-on-surface lg:text-5xl">
            ACCOUNT MARKETPLACE
          </h1>
          <p className="text-on-surface-variant">
            {marketplaceLoading
              ? "Loading marketplace listings..."
              : marketplaceError
                ? marketplaceError
                : totalActiveFilters > 0
              ? `Showing ${filteredCards.length} filtered accounts`
              : `Browse ${cards.length} verified gaming accounts`}
          </p>
        </div>

        <div className="relative z-20 flex-1 w-full bg-transparent p-5 sm:p-8 lg:p-12">
          <div className="mb-5 flex items-center justify-between gap-4 lg:hidden">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                Marketplace filters
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {totalActiveFilters > 0
                  ? `${totalActiveFilters} active filter${totalActiveFilters !== 1 ? "s" : ""}`
                  : "Browse all available filters"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              aria-label="Open marketplace filters"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
            >
                <SlidersHorizontal className="size-4" />
                Filters
                {totalActiveFilters > 0 ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-black">
                    {totalActiveFilters}
                  </span>
                ) : null}
            </button>
          </div>

          <div
            className={`fixed inset-0 z-[70] lg:hidden ${
              mobileFiltersOpen ? "" : "pointer-events-none"
            }`}
            aria-hidden={!mobileFiltersOpen}
          >
            <div
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                mobileFiltersOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setMobileFiltersOpen(false)}
            />

            <aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-filters-title"
              aria-describedby="mobile-filters-description"
              className={`absolute right-0 top-20 flex h-[calc(100%-5rem)] w-[min(100vw,24rem)] flex-col overflow-hidden rounded-tl-2xl border-l border-t border-white/10 bg-black text-on-surface shadow-2xl transition-transform duration-300 ease-out ${
                mobileFiltersOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 px-5 pb-5 pt-6">
                <div>
                  <h2
                    id="mobile-filters-title"
                    className="font-headline text-2xl font-bold text-on-surface"
                  >
                    Filters
                  </h2>
                  <p
                    id="mobile-filters-description"
                    className="mt-1 text-sm text-on-surface-variant"
                  >
                    Filter marketplace accounts by game, price, status, and saved listings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close marketplace filters"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <FilterSidebar
                  filters={activeFilters}
                  onFiltersChange={setActiveFilters}
                  sticky={false}
                  className="h-full rounded-none border-0 bg-black"
                />
              </div>
            </aside>
          </div>

          {marketplaceLoading ? (
            <div className="flex h-full min-h-[24rem] items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-lg font-semibold text-on-surface">
                  Loading listings
                </p>
                <p className="text-sm text-on-surface-variant">
                  Pulling the latest marketplace data from the backend
                </p>
              </div>
            </div>
          ) : marketplaceError ? (
            <div className="flex h-full min-h-[24rem] items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-lg font-semibold text-on-surface">
                  Marketplace unavailable
                </p>
                <p className="text-sm text-on-surface-variant">
                  {marketplaceError}
                </p>
                <button
                  type="button"
                  onClick={loadMarketplace}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredCards.length > 0 ? (
            <div
              ref={gridRef}
              className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3"
            >
              {filteredCards.map((card, index) => {
                const cardId = getCardId(card);
                const isLiked = likedCards.includes(cardId);

                return (
                  <article
                    key={`${cardId}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleCardSelect(e, card)}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) {
                        return;
                      }
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedCard(card);
                      }
                    }}
                    className="market-card group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] text-left transition-colors hover:border-primary/40 hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-primary/40 sm:rounded-2xl"
                  >
                    <div className="relative h-20 overflow-hidden sm:h-56">
                      <img
                        src={card.image}
                        alt={card.game}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-1 sm:p-5">
                        <div className="flex items-end justify-between gap-2 sm:gap-4">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-xs sm:tracking-[0.24em]">
                              {card.game}
                            </p>
                            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/55 sm:mt-2 sm:text-[11px] sm:tracking-[0.18em]">
                              Account ID: {card.accountId}
                            </p>
                            <h3 className="text-[13px] font-black text-white sm:mt-1 sm:text-2xl">
                              ${card.price}
                            </h3>
                          </div>
                          <span
                            className={`rounded-full px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide sm:px-3 sm:py-1 sm:text-xs ${
                              card.isSold || !card.isActive
                                ? "bg-red-500/20 text-red-300"
                                : "bg-green-500/15 text-green-400"
                            }`}
                          >
                            {card.isSold || !card.isActive ? "Sold" : "Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 p-1 sm:space-y-4 sm:p-5">
                      <p className="line-clamp-1 text-[10px] text-on-surface-variant sm:line-clamp-2 sm:text-sm">
                        {card.description}
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:gap-3 sm:text-sm">
                        <div className="rounded-lg bg-primary/10 p-1 sm:rounded-xl sm:p-3">
                          <p className="text-[10px] text-on-surface-variant sm:text-xs">Rank</p>
                          <p className="mt-0.5 font-bold text-primary">
                            {card.rank}
                          </p>
                        </div>
                        <div className="rounded-lg bg-secondary/10 p-1 sm:rounded-xl sm:p-3">
                          <p className="text-[10px] text-on-surface-variant sm:text-xs">
                            Years Active
                          </p>
                          <p className="mt-0.5 font-bold text-secondary">
                            {card.yearsActive}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pt-0 sm:gap-3 sm:pt-1">
                        <button
                          type="button"
                          data-card-action="true"
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!card.isSold && card.isActive) {
                              handleBuy(card);
                            }
                          }}
                          disabled={card.isSold || !card.isActive}
                          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-1 py-1 text-[8px] font-bold uppercase tracking-[0.03em] text-black transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-on-surface-variant sm:gap-2 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm sm:tracking-wide"
                        >
                          <ShoppingBag className="size-3 sm:size-4" />
                          {card.isSold || !card.isActive ? "Sold" : "Buy"}
                        </button>
                        <button
                          type="button"
                          aria-pressed={isLiked}
                          data-card-action="true"
                          disabled={card.isSold}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!card.isSold) {
                              toggleLike(card);
                            }
                          }}
                          className={`inline-flex items-center justify-center gap-2 rounded-lg border px-1 py-1 transition-colors sm:rounded-xl sm:px-4 sm:py-3 ${
                            card.isSold
                              ? "cursor-not-allowed border-white/10 bg-white/[0.02] text-on-surface-variant/50"
                              : 
                            isLiked
                              ? "border-primary/40 bg-primary/12 text-primary"
                              : "border-white/10 bg-white/[0.03] text-on-surface-variant hover:border-primary/30 hover:text-primary"
                          }`}
                        >
                          <Heart
                            className={`size-3.5 sm:size-5 ${isLiked ? "fill-current" : ""}`}
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div
              ref={emptyStateRef}
              className="flex h-full min-h-[24rem] items-center justify-center"
            >
              <div className="text-center">
                <p className="mb-2 text-lg font-semibold text-on-surface">
                  No accounts found
                </p>
                <p className="text-sm text-on-surface-variant">
                  Try adjusting your filters
                </p>
              </div>
            </div>
          )}

          {selectedCard && (
            <div
              className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedCard(null);
                }
              }}
            >
              <div
                ref={modalCardRef}
                className="relative h-[min(24rem,calc(100vh-7rem))] w-[min(20rem,calc(100vw-2rem))] sm:h-96 sm:w-80"
              >
                <button
                  onClick={() => setSelectedCard(null)}
                  className="absolute -top-10 right-0 z-40 text-2xl text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  X
                </button>
                <MarketplaceFlipCard data={selectedCard} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
