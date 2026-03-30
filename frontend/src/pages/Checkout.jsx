"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  showErrorPopup,
  showPurchaseSuccess,
} from "@/lib/marketplaceAlerts";
import { withMarketplaceImage } from "@/lib/marketplaceImages";

gsap.registerPlugin(ScrollTrigger);

const CHECKOUT_STEPS = [
  {
    id: 1,
    eyebrow: "Step 1",
    title: "Review Account",
    description: "Check the listing details before you continue to payment.",
  },
  {
    id: 2,
    eyebrow: "Step 2",
    title: "Payment Details",
    description: "Choose how you want to pay and enter the required details.",
  },
  {
    id: 3,
    eyebrow: "Step 3",
    title: "Confirm Order",
    description: "Review the final summary and submit the payment request.",
  },
];

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit Card",
    description: "Pay instantly with Visa, Mastercard, or RuPay",
    icon: CreditCard,
  },
  {
    id: "upi",
    label: "UPI",
    description: "Pay with any UPI app using your UPI ID",
    icon: Smartphone,
  },
];

export default function Checkout() {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const passedListing = useMemo(
    () =>
      location.state?.listing ? withMarketplaceImage(location.state.listing) : null,
    [location.state?.listing],
  );

  const [listing, setListing] = useState(passedListing);
  const [loading, setLoading] = useState(!passedListing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  const authConfig = useMemo(() => {
    const token = localStorage.getItem("token");
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        fullName: user.username || prev.fullName,
      }));
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      if (passedListing?.id === listingId) {
        setListing(passedListing);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await axios.get("/api/marketplace/listings", authConfig);
        if (!mounted) return;

        const matchedListing = res.data.find((item) => item.id === listingId);

        if (matchedListing) {
          setListing(withMarketplaceImage(matchedListing));
          setError("");
        } else {
          setListing(null);
          setError("We could not load this account for checkout.");
        }
      } catch (fetchError) {
        if (!mounted) return;
        setListing(null);
        setError(
          fetchError.response?.data?.msg ||
            "We could not load this account for checkout.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadListing();
    return () => {
      mounted = false;
    };
  }, [listingId, authConfig, passedListing]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".checkout-hero",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      ).fromTo(
        ".checkout-panel",
        { opacity: 0, y: 36, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
        },
        "-=0.3",
      );

      gsap.utils.toArray(".checkout-reveal").forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 28 },
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
    }, pageRef);

    return () => ctx.revert();
  }, [listing, loading]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".checkout-step-content",
        { opacity: 0, y: 22, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        ".checkout-step-card",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.06,
          ease: "power2.out",
        },
      );

      gsap.fromTo(
        ".checkout-summary-panel",
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          ease: "power2.out",
        },
      );
    }, pageRef);

    return () => ctx.revert();
  }, [step, listing]);

  const fees = listing ? Math.round(listing.price * 0.04) : 0;
  const total = listing ? listing.price + fees : 0;
  const currentStep = CHECKOUT_STEPS.find((item) => item.id === step);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateCurrentStep() {
    if (step === 1) {
      return Boolean(listing);
    }

    if (step === 2) {
      if (!formData.fullName || !formData.email) {
        setError("Please enter your full name and email.");
        return false;
      }

      if (paymentMethod === "card") {
        if (!formData.cardNumber || !formData.expiry || !formData.cvv) {
          setError("Please complete your card details.");
          return false;
        }
      } else if (!formData.upiId) {
        setError("Please enter your UPI ID.");
        return false;
      }
    }

    setError("");
    return true;
  }

  function handleNextStep() {
    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function handlePreviousStep() {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmitOrder() {
    if (!listing) return;

    if (!validateCurrentStep()) return;

    setSubmitting(true);
    try {
      const res = await axios.post(
        `/api/marketplace/listings/${listing.id}/purchase`,
        {
          paymentMethod,
          customerEmail: formData.email,
          upiId: paymentMethod === "upi" ? formData.upiId : undefined,
        },
        authConfig,
      );
      const purchase = res.data?.purchase;

      const storedPurchases = JSON.parse(
        localStorage.getItem("marketplacePurchases") || "[]",
      );
      const purchasedListingIds = JSON.parse(
        localStorage.getItem("purchasedMarketplaceListingIds") || "[]",
      );
      const nextPurchasedListingIds = Array.from(
        new Set([...purchasedListingIds, listing.id]),
      );
      localStorage.setItem(
        "purchasedMarketplaceListingIds",
        JSON.stringify(nextPurchasedListingIds),
      );
      localStorage.setItem(
        "marketplacePurchases",
        JSON.stringify([
          {
            id: purchase?.id || `local-${Date.now()}`,
            accountId: purchase?.accountId || listing.accountId,
            accountPassword: purchase?.accountPassword || null,
            price: purchase?.price || listing.price,
            status: purchase?.status || "initiated",
            createdAt: new Date().toISOString(),
            listing: {
              id: listing.id,
              game: listing.game,
              image: listing.image,
              rank: listing.rank,
              yearsActive: listing.yearsActive,
              isActive: listing.isActive,
            },
          },
          ...storedPurchases,
        ]),
      );

      const storedLikedListings = JSON.parse(
        localStorage.getItem("marketplaceLikedListings") || "[]",
      );
      localStorage.setItem(
        "marketplaceLikedListings",
        JSON.stringify(
          storedLikedListings.filter((item) => item.id !== listing.id),
        ),
      );

      await showPurchaseSuccess(listing);
      navigate("/profile");
    } catch (submitError) {
      await showErrorPopup(
        "Payment failed",
        submitError.response?.data?.msg ||
          "We could not complete this payment request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={pageRef} className="relative z-20 mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
      <div className="checkout-hero mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            to="/market"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ArrowLeft className="size-4" />
            Back to marketplace
          </Link>
          <h1 className="font-headline text-4xl font-black tracking-tighter text-on-surface lg:text-5xl">
            Secure Checkout
          </h1>
          <p className="mt-2 text-on-surface-variant">
            {currentStep?.description}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-on-surface-variant">
          {currentStep?.eyebrow}: {currentStep?.title}
        </div>
      </div>

      {loading ? (
        <div className="checkout-panel flex min-h-[24rem] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="text-center">
            <p className="text-lg font-semibold text-on-surface">Loading checkout</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Fetching the selected listing from the backend
            </p>
          </div>
        </div>
      ) : error && !listing ? (
        <div className="checkout-panel flex min-h-[24rem] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="text-center">
            <p className="text-lg font-semibold text-on-surface">Checkout unavailable</p>
            <p className="mt-2 text-sm text-on-surface-variant">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/market")}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90"
            >
              Return to market
            </button>
          </div>
        </div>
      ) : listing ? (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.75fr]">
          <section className="checkout-panel checkout-reveal rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:p-8">
            <div className="mb-8 flex items-center gap-3">
              {CHECKOUT_STEPS.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div
                    className={`flex size-9 items-center justify-center rounded-full text-sm font-black ${
                      item.id <= step
                        ? "bg-primary text-black"
                        : "bg-white/[0.06] text-on-surface-variant"
                    }`}
                  >
                    {item.id < step ? <CheckCircle2 className="size-4" /> : item.id}
                  </div>
                  {item.id < CHECKOUT_STEPS.length ? (
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-px w-10 ${
                          item.id < step ? "bg-primary/80" : "bg-white/10"
                        }`}
                      />
                      <div className="hidden min-w-0 lg:block">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                          {item.eyebrow}
                        </p>
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden min-w-0 lg:block">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        {item.eyebrow}
                      </p>
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {item.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="checkout-step-card mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                {currentStep?.eyebrow}
              </p>
              <h2 className="mt-2 text-xl font-bold text-on-surface">
                {currentStep?.title}
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                {currentStep?.description}
              </p>
            </div>

            {step === 1 ? (
              <div className="checkout-step-content space-y-6">
                <div className="checkout-step-card overflow-hidden rounded-3xl border border-white/10">
                  <img
                    src={listing.image}
                    alt={listing.game}
                    className="h-72 w-full object-cover"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="checkout-step-card rounded-2xl bg-primary/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      Account ID
                    </p>
                    <p className="mt-2 text-lg font-bold text-primary">
                      {listing.accountId}
                    </p>
                  </div>
                  <div className="checkout-step-card rounded-2xl bg-secondary/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      Rank
                    </p>
                    <p className="mt-2 text-lg font-bold text-secondary">
                      {listing.rank}
                    </p>
                  </div>
                  <div className="checkout-step-card rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      Game
                    </p>
                    <p className="mt-2 text-lg font-bold text-on-surface">
                      {listing.game}
                    </p>
                  </div>
                  <div className="checkout-step-card rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      Years Active
                    </p>
                    <p className="mt-2 text-lg font-bold text-on-surface">
                      {listing.yearsActive}
                    </p>
                  </div>
                </div>

                <div className="checkout-step-card rounded-2xl border border-white/10 bg-black/10 p-5">
                  <p className="text-sm leading-7 text-on-surface-variant">
                    {listing.description}
                  </p>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="checkout-step-content space-y-6">
                <div className="checkout-step-card">
                  <h2 className="text-xl font-bold text-on-surface">
                    Payment Details
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Choose your preferred payment option and billing details.
                  </p>
                </div>

                <div className="grid gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const selected = paymentMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`checkout-step-card flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
                          selected
                            ? "border-primary/40 bg-primary/12"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20"
                        }`}
                      >
                        <div
                          className={`rounded-xl p-2 ${
                            selected ? "bg-primary/18" : "bg-white/[0.05]"
                          }`}
                        >
                          <Icon
                            className={`size-5 ${
                              selected ? "text-primary" : "text-on-surface-variant"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">
                            {method.label}
                          </p>
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {method.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="checkout-step-content grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                      Full Name
                    </span>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary/40"
                      placeholder="Your full name"
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
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary/40"
                      placeholder="you@example.com"
                    />
                  </label>
                      {paymentMethod === "card" ? (
                    <>
                      <label className="block md:col-span-2">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                          Card Number
                        </span>
                        <input
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary/40"
                          placeholder="1234 5678 9012 3456"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                          Expiry
                        </span>
                        <input
                          name="expiry"
                          value={formData.expiry}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary/40"
                          placeholder="MM/YY"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                          CVV
                        </span>
                        <input
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary/40"
                          placeholder="123"
                        />
                      </label>
                    </>
                  ) : (
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                        UPI ID
                      </span>
                      <input
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-on-surface outline-none transition-colors focus:border-primary/40"
                        placeholder="name@bank"
                      />
                    </label>
                  )}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="checkout-step-content space-y-6">
                <div className="checkout-step-card">
                  <h2 className="text-xl font-bold text-on-surface">
                    Confirm Payment
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Review your order and place the payment request.
                  </p>
                </div>

                <div className="checkout-step-card rounded-2xl border border-primary/20 bg-primary/8 p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 text-primary" />
                    <div>
                      <p className="font-semibold text-on-surface">
                        Protected checkout
                      </p>
                      <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                        Your order will be recorded in the backend and prepared
                        for fulfilment after payment review.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="checkout-step-card rounded-2xl bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-on-surface-variant">
                      Account
                    </p>
                    <p className="mt-2 font-semibold text-on-surface">
                      {listing.game}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {listing.accountId}
                    </p>
                  </div>
                  <div className="checkout-step-card rounded-2xl bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-on-surface-variant">
                      Payment Method
                    </p>
                    <p className="mt-2 font-semibold text-on-surface">
                      {paymentMethod === "card" ? "Credit Card" : "UPI"}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {paymentMethod === "card" ? formData.email : formData.upiId}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-300">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={step === 1}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-surface transition-colors hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={submitting || !listing.isActive}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </section>

          <aside className="checkout-panel checkout-summary-panel checkout-reveal rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:p-8">
            <div className="checkout-step-card overflow-hidden rounded-2xl border border-white/10">
              <img
                src={listing.image}
                alt={listing.game}
                className="h-52 w-full object-cover"
              />
            </div>

            <div className="checkout-step-card mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                {listing.game}
              </p>
              <h2 className="mt-2 font-headline text-3xl font-black tracking-tight text-on-surface">
                {listing.accountId}
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                {listing.description}
              </p>
            </div>

            <div className="checkout-step-card mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/10 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Listing price</span>
                <span className="font-semibold text-on-surface">${listing.price}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Service fee</span>
                <span className="font-semibold text-on-surface">${fees}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">
                  Total
                </span>
                <span className="font-headline text-2xl font-black text-primary">
                  ${total}
                </span>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
