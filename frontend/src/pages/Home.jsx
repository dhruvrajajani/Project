import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TiltedCard from "@/components/TiltedCard";
import BorderGlow from "@/components/BorderGlow";
import { MotionCarousel } from "@/components/animate-ui/components/community/motion-carousel";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: "1.2M+", label: "Accounts Valued" },
  { value: "$45M", label: "Total Worth Checked" },
  { value: "98%", label: "Accuracy Rate" },
  { value: "< 2s", label: "AI Analysis Time" },
];

const GAMES = [
  { name: "VALORANT", tag: "Tactical Shooter", icon: "target" },
  { name: "CS2", tag: "FPS Classic", icon: "precision_manufacturing" },
  { name: "LEAGUE OF LEGENDS", tag: "MOBA", icon: "castle" },
  { name: "APEX LEGENDS", tag: "Battle Royale", icon: "rocket_launch" },
  { name: "FORTNITE", tag: "Battle Royale", icon: "storm" },
  { name: "GENSHIN IMPACT", tag: "Open World RPG", icon: "landscape" },
];

const STEPS = [
  {
    num: "01",
    title: "Select Your Game",
    desc: "Choose from our growing library of supported titles.",
  },
  {
    num: "02",
    title: "Enter Account Details",
    desc: "Provide your in-game ID or link your profile securely.",
  },
  {
    num: "03",
    title: "AI Analyzes Assets",
    desc: "Our engine evaluates skins, rank, playtime, rarities, and more.",
  },
  {
    num: "04",
    title: "Get Your Valuation",
    desc: "Receive a detailed breakdown with market comparisons in seconds.",
  },
  {
    num: "05",
    title: "Buy or Sell",
    desc: "List your account at the AI-recommended price or browse verified listings to buy.",
  },
];

export default function Home() {
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const h1Ref = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);

  const gamesRef = useRef(null);
  const stepsRef = useRef(null);
  const finalRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Hero entrance ──
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6 },
      )
        .fromTo(
          h1Ref.current,
          { opacity: 0, y: 60, skewY: 3 },
          { opacity: 1, y: 0, skewY: 0, duration: 0.9 },
          "-=0.2",
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4",
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3",
        );

      // ── Stats ──
      gsap.fromTo(
        ".stat-card",
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            end: "top 5%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // ── Game tiles ──
      gsap.fromTo(
        ".game-tile",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gamesRef.current,
            start: "top 50%",
            end: "top -20%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // ── Final CTA ──
      gsap.fromTo(
        finalRef.current,
        { opacity: 0, scale: 0.95, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: finalRef.current,
            start: "top 80%",
            end: "top 5%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative z-10">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-60px)] items-center overflow-hidden">
        <div className="container mx-auto grid items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
          {/* Left copy */}
          <div className="max-w-xl">
            <span
              ref={badgeRef}
              className="inline-block opacity-0 py-1 px-4 mb-6 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase border border-primary/20"
            >
              AI-POWERED VALUATION ENGINE
            </span>

            <h1
              ref={h1Ref}
              className="mb-6 opacity-0 font-headline text-4xl font-black leading-[0.92] tracking-tighter text-on-surface sm:text-5xl md:text-7xl"
            >
              KNOW THE
              <br />
              <span className="text-primary italic">TRUE WORTH</span>
              <br />
              OF YOUR LEGACY.
            </h1>

            <p
              ref={subRef}
              className="mb-8 opacity-0 text-base leading-relaxed text-on-surface-variant sm:mb-10 sm:text-lg md:text-xl"
            >
              Instantly evaluate any gaming account with our AI engine —
              analyzing skins, rank, playtime, and rarity across every major
              title.
            </p>

            <div
              ref={ctaRef}
              className="opacity-0 flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/worth"
                className="primary-gradient-bg text-black px-8 py-4 rounded-xl font-headline font-black text-base uppercase tracking-widest shadow-[0_0_30px_rgba(207,150,255,0.3)] hover:shadow-[0_0_50px_rgba(207,150,255,0.5)] transition-all active:scale-95 text-center"
              >
                Check My Worth
              </Link>
              <Link
                to="/signup"
                className="bg-white/5 border border-white/10 text-on-surface px-8 py-4 rounded-xl font-headline font-black text-base uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 text-center"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Right — TiltedCard with engine overlay */}
          <div className="hidden lg:flex justify-center items-center">
            <TiltedCard
              imageSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23120a1e'/%3E%3Cstop offset='50%25' stop-color='%230d1117'/%3E%3Cstop offset='100%25' stop-color='%23060a10'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='500' fill='url(%23bg)'/%3E%3C/svg%3E"
              altText="Kinetic Engine Analysis"
              captionText="Kinetic AI Engine"
              containerHeight="500px"
              containerWidth="400px"
              imageHeight="500px"
              imageWidth="400px"
              rotateAmplitude={12}
              scaleOnHover={1.05}
              showMobileWarning={false}
              showTooltip
              displayOverlayContent
              overlayContent={
                <div className="w-full h-full rounded-[15px] bg-white/[0.04] backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-secondary animate-pulse text-2xl">
                        neurology
                      </span>
                      <div>
                        <p className="font-headline font-black text-sm tracking-widest text-white">
                          KINETIC ENGINE
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          Analyzing account…
                        </p>
                      </div>
                    </div>

                    {/* Analysis bars */}
                    <div className="space-y-4 mb-6">
                      {[
                        {
                          label: "Skin Rarity Index",
                          w: "92%",
                          color: "from-purple-400 to-purple-600",
                        },
                        {
                          label: "Rank Prestige",
                          w: "78%",
                          color: "from-cyan-400 to-cyan-600",
                        },
                        {
                          label: "Playtime Value",
                          w: "65%",
                          color: "from-lime-400 to-lime-600",
                        },
                        {
                          label: "Collection Depth",
                          w: "88%",
                          color: "from-purple-400 to-cyan-400",
                        },
                      ].map(({ label, w, color }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-400">{label}</span>
                            <span className="text-white font-bold">{w}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${color} rounded-full`}
                              style={{ width: w }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result */}
                  <div>
                    <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.08] text-center mb-4">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                        Estimated Account Value
                      </p>
                      <p className="font-headline text-3xl font-black text-cyan-400">
                        $2,840
                      </p>
                      <p className="text-xs text-lime-400 font-bold mt-1">
                        Top 5% of all VALORANT accounts
                      </p>
                    </div>

                    {/* Pulse */}
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400"></span>
                      </span>
                      <span className="text-xs text-gray-400">
                        Analysis complete · 1.4s
                      </span>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────── */}
      <section ref={statsRef} className="border-y border-white/[0.06] py-14 sm:py-16">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <BorderGlow
                key={label}
                className="stat-card opacity-0"
                edgeSensitivity={30}
                glowColor="270 80 80"
                backgroundColor="rgba(11, 11, 12, 0.95)"
                borderRadius={16}
                glowRadius={30}
                glowIntensity={0.8}
                coneSpread={25}
                colors={["#c084fc", "#00e5ff", "#c3ff57"]}
                fillOpacity={0.3}
              >
                <div className="p-5 text-center sm:p-6">
                  <p className="mb-2 font-headline text-3xl font-black text-on-surface sm:text-4xl">
                    {value}
                  </p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest">
                    {label}
                  </p>
                </div>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section ref={stepsRef} className="relative py-20 sm:py-24 lg:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <span className="text-xs uppercase tracking-widest text-tertiary font-bold block mb-3">
              Simple Process
            </span>
            <h2 className="font-headline text-3xl font-black tracking-tight text-on-surface sm:text-4xl md:text-5xl">
              HOW IT <span className="text-secondary italic">WORKS</span>
            </h2>
          </div>

          <MotionCarousel
            slides={Array.from(Array(STEPS.length).keys())}
            options={{ loop: true }}
            renderSlide={(index, isActive) => {
              const step = STEPS[index];
              return (
                <div
                  className={`flex h-full w-full flex-col justify-center rounded-2xl border p-6 transition-all sm:p-8 ${
                    isActive
                      ? "bg-white/[0.06] border-primary/30 shadow-[0_0_30px_rgba(207,150,255,0.1)]"
                      : "bg-white/[0.02] border-white/[0.06]"
                  }`}
                >
                  <span
                    className={`mb-4 block font-headline text-4xl font-black leading-none transition-colors sm:text-5xl ${
                      isActive ? "text-primary/60" : "text-primary/15"
                    }`}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-headline text-lg md:text-xl font-black text-on-surface mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            }}
          />
        </div>
      </section>

      {/* ── SUPPORTED GAMES ──────────────────────────── */}
      <section ref={gamesRef} className="border-t border-white/[0.06] py-20 sm:py-24 lg:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-3">
              Growing Library
            </span>
            <h2 className="font-headline text-3xl font-black tracking-tight text-on-surface sm:text-4xl md:text-5xl">
              SUPPORTED <span className="text-secondary italic">TITLES</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {GAMES.map(({ name, tag, icon }) => (
              <div
                key={name}
                className="game-tile group flex cursor-default items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 opacity-0 transition-all hover:border-white/[0.12] hover:bg-white/[0.06] sm:p-6"
              >
                <div className="w-12 h-12 rounded-xl primary-gradient-bg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-black text-xl">
                    {icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-sm text-on-surface tracking-wider">
                    {name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">{tag}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-on-surface-variant text-sm mt-8">
            …and more titles being added every month.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
        <div ref={finalRef} className="mx-auto max-w-4xl text-center opacity-0">
          <div
            className="relative p-px rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(207,150,255,0.4), rgba(0,229,255,0.3), rgba(195,255,87,0.2))",
            }}
          >
            <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-background p-4 sm:p-10 lg:p-16">
              <div className="pointer-events-none absolute inset-0 bg-primary/[0.03]" />
              <div className="pointer-events-none absolute -top-16 left-1/2 h-[130px] w-[220px] -translate-x-1/2 rounded-full bg-primary/15 blur-[70px] sm:-top-20 sm:h-[200px] sm:w-[400px] sm:blur-[80px]" />

              <span className="relative z-10 mb-3 block text-[11px] font-bold uppercase tracking-widest text-primary sm:mb-4 sm:text-xs">
                Get Started Today
              </span>
              <h2 className="relative z-10 mb-4 font-headline text-[1.7rem] font-black leading-tight sm:mb-6 sm:text-4xl md:text-6xl">
                WHAT'S YOUR <span className="text-primary italic">ACCOUNT</span>{" "}
                WORTH?
              </h2>
              <p className="relative z-10 mx-auto mb-6 max-w-xl text-sm text-on-surface-variant sm:mb-10 sm:text-lg">
                Join 200,000+ gamers who've discovered the true value of their
                gaming legacy with our AI-powered engine.
              </p>
              <div className="relative z-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  to="/worth"
                  className="primary-gradient-bg rounded-xl px-8 py-3 text-center font-headline text-sm font-black uppercase tracking-widest text-black shadow-[0_0_40px_rgba(207,150,255,0.3)] transition-all hover:shadow-[0_0_60px_rgba(207,150,255,0.5)] active:scale-95 sm:px-10 sm:py-4 sm:text-base"
                >
                  Check My Worth
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-center font-headline text-sm font-black uppercase tracking-widest text-on-surface transition-all hover:bg-white/10 active:scale-95 sm:px-10 sm:py-4 sm:text-base"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
