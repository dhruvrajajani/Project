"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarDays,
  Check,
  Heart,
  Mail,
  Pencil,
  ShoppingBag,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Carousel from "@/components/profile/Carousel";
import Stack from "@/components/profile/Stack";
import { withMarketplaceImage } from "@/lib/marketplaceImages";
import {
  mergeSellerListings,
  readSellerListings,
} from "@/lib/marketplaceSellerListings";

gsap.registerPlugin(ScrollTrigger);

function formatDate(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getFallbackProfile() {
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
  const storedSellerListings = readSellerListings();

  return {
    id: storedUser?.id || "local-user",
    username: storedUser?.username || "Vault User",
    email: storedUser?.email || "Not available",
    joinedAt: storedUser?.createdAt || null,
    likedListings: storedLikedListings
      .filter((listing) => !purchasedListingIds.has(listing.id))
      .map(withMarketplaceImage),
    sellerListings: storedSellerListings,
    purchases: storedPurchases.map((purchase) => ({
      ...purchase,
      listing: purchase.listing ? withMarketplaceImage(purchase.listing) : null,
    })),
  };
}

export default function Profile() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const authConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const nextProfile = getFallbackProfile();
      if (!mounted) return;

      setProfile(nextProfile);
      setFormData({
        username: nextProfile.username,
        email: nextProfile.email,
      });
      setLoading(false);

      try {
        const res = await axios.get("/api/marketplace/my-listings", authConfig);
        if (!mounted) return;

        const sellerListings = mergeSellerListings(res.data?.listings || []);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                sellerListings,
              }
            : prev,
        );
      } catch {
        // Keep local fallback silently.
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const hoverCleanups = [];
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".profile-hero",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      ).fromTo(
        ".profile-panel",
        { opacity: 0, y: 30, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
        },
        "-=0.3",
      );

      gsap.utils.toArray(".profile-section").forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 86%",
              end: "top 45%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray(".profile-hover-card").forEach((card) => {
        const enter = () => {
          gsap.to(card, {
            y: -8,
            scale: 1.015,
            boxShadow: "0 24px 56px rgba(0, 0, 0, 0.2)",
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
  }, [profile, loading]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleStartEdit() {
    if (!profile) return;

    setFormData({
      username: profile.username,
      email: profile.email,
    });
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (!profile) return;

    setFormData({
      username: profile.username,
      email: profile.email,
    });
    setIsEditing(false);
  }

  function handleSaveProfile() {
    if (!profile) return;

    const nextUsername = formData.username.trim() || profile.username;
    const nextEmail = formData.email.trim() || profile.email;
    const nextProfile = {
      ...profile,
      username: nextUsername,
      email: nextEmail,
    };

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...storedUser,
        id: nextProfile.id,
        username: nextUsername,
        email: nextEmail,
      }),
    );

    setProfile(nextProfile);
    setIsEditing(false);
  }

  function handleBuyLiked(listing) {
    navigate(`/market/checkout/${listing.id}`, {
      state: { listing },
    });
  }

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : "KV";
  const likedCards = profile?.likedListings.map((listing, index) => (
    <div
      key={`${listing.id || listing.accountId}-${index}`}
      className="relative h-full w-full overflow-hidden"
    >
      <img
        src={listing.image}
        alt={listing.game}
        className="stack-card-image"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 sm:text-xs sm:tracking-[0.18em]">
          {listing.game}
        </p>
        <p className="mt-1 text-base font-black leading-tight text-white sm:mt-2 sm:text-lg">
          {listing.accountId}
        </p>
        <p className="mt-1 text-xs font-semibold text-primary sm:text-sm">
          ${listing.price}
        </p>
      </div>
    </div>
  ));
  const historyCards = profile?.purchases.map((purchase, index) => ({
    id: purchase.id || index + 1,
    content: (
      <div className="flex h-full flex-col">
        {purchase.listing?.image ? (
          <div className="relative h-36 overflow-hidden sm:h-48">
            <img
              src={purchase.listing.image}
              alt={purchase.listing?.game || purchase.accountId}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 sm:text-xs sm:tracking-[0.18em]">
                {purchase.listing?.game || "Marketplace account"}
              </p>
              <p className="mt-1 text-base font-black leading-tight text-white sm:mt-2 sm:text-lg">
                {purchase.accountId}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Purchase status
            </p>
            <p className="mt-1.5 text-base font-bold text-on-surface sm:mt-2 sm:text-lg">
              {purchase.status}
            </p>
            <p className="mt-2 text-xs text-on-surface-variant sm:mt-3 sm:text-sm">
              {formatDate(purchase.createdAt)}
            </p>
          </div>

          {purchase.accountPassword ? (
            <div className="mt-4 rounded-xl border border-white/8 bg-black/20 p-3 sm:mt-5 sm:rounded-2xl sm:p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                Account password
              </p>
              <p className="mt-2 break-all font-mono text-xs font-semibold text-on-surface sm:text-sm">
                {purchase.accountPassword}
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between sm:mt-6">
            <span className="text-xs font-semibold text-on-surface-variant sm:text-sm">
              Paid
            </span>
            <span className="text-xl font-black text-primary sm:text-2xl">
              ${purchase.price}
            </span>
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <div
      ref={pageRef}
      className="relative z-20 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10"
    >
      <div className="profile-hero mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary/80">
            My Profile
          </p>
          <h1 className="mt-2 font-headline text-[1.8rem] font-black tracking-tighter text-on-surface sm:mt-3 sm:text-4xl lg:text-5xl">
            ACCOUNT OVERVIEW
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant sm:text-base">
            Manage your profile details and review your history, liked accounts,
            and collection in one place.
          </p>
        </div>

        <Link
          to="/market"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-white/20 sm:px-5 sm:py-3 sm:text-sm"
        >
          Back to market
        </Link>
      </div>

      {loading ? (
        <div className="profile-panel flex min-h-[24rem] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="text-center">
            <p className="text-lg font-semibold text-on-surface">
              Loading profile
            </p>
          </div>
        </div>
      ) : profile ? (
        <div className="space-y-6 sm:space-y-8">
          <section className="profile-panel profile-section rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 sm:rounded-3xl sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-primary/15 text-xl font-black text-primary sm:size-20 sm:rounded-3xl sm:text-2xl">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                          Name
                        </span>
                        <input
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary/40 sm:px-4 sm:py-3 sm:text-base"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                          Email
                        </span>
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary/40 sm:px-4 sm:py-3 sm:text-base"
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-black tracking-tight text-on-surface sm:text-3xl">
                        {profile.username}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-on-surface-variant sm:gap-3 sm:text-sm">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1.5 sm:px-3">
                          <Mail className="size-4" />
                          {profile.email}
                        </span>
                        {profile.joinedAt ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1.5 sm:px-3">
                            <CalendarDays className="size-4" />
                            Joined {formatDate(profile.joinedAt)}
                          </span>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90 sm:px-5 sm:py-3 sm:text-sm"
                    >
                      <Check className="size-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-white/20 sm:px-5 sm:py-3 sm:text-sm"
                    >
                      <X className="size-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-primary/30 hover:text-primary sm:px-5 sm:py-3 sm:text-sm"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="profile-section grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
            <div className="profile-panel profile-hover-card rounded-xl bg-primary/10 p-4 sm:rounded-2xl sm:p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                History
              </p>
              <p className="mt-2 text-2xl font-black text-primary sm:text-3xl">
                {profile.purchases.length}
              </p>
            </div>
            <div className="profile-panel profile-hover-card rounded-xl bg-white/[0.08] p-4 sm:rounded-2xl sm:p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                Liked
              </p>
              <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
                {profile.likedListings.length}
              </p>
            </div>
            <div className="profile-panel profile-hover-card rounded-xl bg-secondary/10 p-4 sm:rounded-2xl sm:p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                Selling IDs
              </p>
              <p className="mt-2 text-2xl font-black text-secondary sm:text-3xl">
                {profile.sellerListings.length}
              </p>
            </div>
          </section>

          <section className="profile-section grid gap-6 sm:gap-8 xl:grid-cols-2">
            <div className="profile-panel profile-hover-card rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 sm:rounded-3xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                    History
                  </p>
                  <h3 className="mt-1.5 text-xl font-bold text-on-surface sm:mt-2 sm:text-2xl">
                    Purchase history
                  </h3>
                </div>
                <ShoppingBag className="size-5 text-primary" />
              </div>

              {profile.purchases.length > 0 ? (
                <div className="mx-auto w-full max-w-[16rem] sm:max-w-[22rem]">
                  <Carousel
                    items={historyCards}
                    baseWidth={260}
                    itemHeight={300}
                    autoplay={false}
                    autoplayDelay={3000}
                    pauseOnHover={false}
                    loop={false}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <p className="text-lg font-semibold text-on-surface">
                    No history yet
                  </p>
                </div>
              )}
            </div>

            <div className="profile-panel profile-hover-card rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 sm:rounded-3xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                    Liked
                  </p>
                  <h3 className="mt-1.5 text-xl font-bold text-on-surface sm:mt-2 sm:text-2xl">
                    Saved accounts
                  </h3>
                </div>
                <Heart className="size-5 text-white" />
              </div>

              {profile.likedListings.length > 0 ? (
                <div className="space-y-4 sm:space-y-5">
                  <div className="mx-auto h-64 w-48 max-w-full sm:h-96 sm:w-72">
                    <Stack
                      randomRotation={false}
                      sensitivity={180}
                      sendToBackOnClick={true}
                      cards={likedCards}
                      autoplay={false}
                      autoplayDelay={3000}
                      pauseOnHover={false}
                      mobileClickOnly={true}
                    />
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {profile.likedListings.map((listing) => (
                      <div
                        key={listing.id || listing.accountId}
                        className="flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-2xl sm:p-4"
                      >
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                            {listing.game}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-on-surface sm:text-base">
                            {listing.accountId}
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
                          <span className="inline-flex items-center justify-center rounded-full border border-white/10 p-2 text-white">
                            <Heart className="size-3.5" />
                          </span>
                          <span className="text-sm font-bold text-primary sm:text-base">
                            ${listing.price}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleBuyLiked(listing)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90 sm:px-4 sm:text-xs"
                          >
                            <ShoppingBag className="size-4" />
                            Buy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <p className="text-lg font-semibold text-on-surface">
                    No liked accounts
                  </p>
                </div>
              )}
            </div>

          </section>

          <section className="profile-section">
            <div className="profile-panel profile-hover-card rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 sm:rounded-3xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                    Selling IDs
                  </p>
                  <h3 className="mt-1.5 text-xl font-bold text-on-surface sm:mt-2 sm:text-2xl">
                    Your active listings
                  </h3>
                </div>
                <ShoppingBag className="size-5 text-secondary" />
              </div>

              {profile.sellerListings.length > 0 ? (
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {profile.sellerListings.map((listing) => (
                    <div
                      key={listing.id || listing.accountId}
                      className="rounded-xl border border-white/10 bg-black/10 p-3 sm:rounded-2xl sm:p-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        {listing.game}
                      </p>
                      <p className="mt-1.5 text-base font-bold text-on-surface sm:mt-2 sm:text-lg">
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
                      <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:text-xs ${
                            listing.isSold
                              ? "bg-red-500/15 text-red-400"
                              : listing.isActive
                                ? "bg-green-500/15 text-green-400"
                                : "bg-white/10 text-on-surface-variant"
                          }`}
                        >
                          {listing.status}
                        </span>
                        <span className="text-sm font-black text-primary sm:text-base">
                          ${listing.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <p className="text-lg font-semibold text-on-surface">
                    No selling IDs yet
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
