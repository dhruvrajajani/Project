import { useLocation } from "react-router-dom";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function WorthChecker() {
  const location = useLocation();
  const prefillListing = location.state?.prefillListing || null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12">
      {/* Hero Section */}
      <header className="relative mb-12 sm:mb-16">
        <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-[100px] sm:-left-24 sm:-top-24 sm:h-96 sm:w-96 sm:blur-[120px]"></div>
        <h1 className="mb-4 max-w-3xl font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
          AI ACCOUNT <span className="text-primary">VALUATION</span> ENGINE
        </h1>
        <p className="max-w-xl text-base text-on-surface-variant sm:text-lg">
          Precision metrics meet neural analysis. Get instant, market-accurate worth for your gaming legacy across 50+ titles.
        </p>
        {prefillListing ? (
          <div className="mt-6 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
              Selected account
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                {prefillListing.game || "Marketplace"}
              </span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                {prefillListing.rank || "Standard"}
              </span>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {formatCurrency(prefillListing.price)}
              </span>
            </div>
            <p className="mt-3 text-lg font-bold text-on-surface">
              {prefillListing.accountId || "Top ranked account"}
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Opening AI valuation for the selected marketplace account.
            </p>
          </div>
        ) : null}
      </header>

      {/* Valuation Interface Grid */}
      <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-12">
        {/* Step 1: Input Form (Bento Style) */}
        <section className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border-l-4 border-secondary bg-surface-container-low p-5 shadow-lg sm:p-8">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <span className="bg-secondary/20 text-secondary w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
              <h2 className="font-headline text-2xl font-bold">Select Battlefield</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <button className="flex flex-col items-center rounded-xl border border-secondary/30 bg-surface-container-highest p-4 transition-all hover:bg-surface-bright sm:p-6 sm:ring-2 sm:ring-secondary/50">
                <span className="material-symbols-outlined mb-2 text-3xl text-secondary sm:mb-3 sm:text-4xl">sports_esports</span>
                <span className="font-headline font-bold">VALORANT</span>
              </button>
              <button className="flex flex-col items-center rounded-xl border border-outline-variant/15 bg-surface-container-high p-4 transition-all hover:bg-surface-bright sm:p-6">
                <span className="material-symbols-outlined mb-2 text-3xl sm:mb-3 sm:text-4xl">swords</span>
                <span className="font-headline font-bold">LEAGUE</span>
              </button>
              <button className="flex flex-col items-center rounded-xl border border-outline-variant/15 bg-surface-container-high p-4 transition-all hover:bg-surface-bright sm:p-6">
                <span className="material-symbols-outlined mb-2 text-3xl sm:mb-3 sm:text-4xl">shield</span>
                <span className="font-headline font-bold">OVERWATCH</span>
              </button>
            </div>
          </div>
          <div className="rounded-xl border-l-4 border-primary bg-surface-container-low p-5 shadow-lg sm:p-8">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
              <h2 className="font-headline text-2xl font-bold">Technical Metrics</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="worth-global-rank"
                  className="text-xs font-headline font-bold tracking-widest uppercase text-on-surface-variant"
                >
                  Global Rank
                </label>
                <div className="bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/15">
                  <select
                    id="worth-global-rank"
                    className="w-full bg-transparent border-none text-on-surface focus:ring-0 font-headline font-bold p-3 outline-none"
                  >
                    <option>Radiant / Challenger</option>
                    <option>Immortal / Grandmaster</option>
                    <option>Diamond</option>
                    <option>Platinum</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="worth-kd-ratio"
                  className="text-xs font-headline font-bold tracking-widest uppercase text-on-surface-variant"
                >
                  K/D Ratio
                </label>
                <div className="bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/15">
                  <input
                    id="worth-kd-ratio"
                    className="w-full bg-transparent border-none text-on-surface focus:ring-0 font-headline font-bold p-3 outline-none"
                    type="text"
                    defaultValue="1.45"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="worth-win-rate"
                  className="text-xs font-headline font-bold tracking-widest uppercase text-on-surface-variant"
                >
                  Win Rate %
                </label>
                <div className="bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/15">
                  <input
                    id="worth-win-rate"
                    className="w-full bg-transparent border-none text-on-surface focus:ring-0 font-headline font-bold p-3 outline-none"
                    type="text"
                    defaultValue="58.2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="worth-account-level"
                  className="text-xs font-headline font-bold tracking-widest uppercase text-on-surface-variant"
                >
                  Account Level
                </label>
                <div className="bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/15">
                  <input
                    id="worth-account-level"
                    className="w-full bg-transparent border-none text-on-surface focus:ring-0 font-headline font-bold p-3 outline-none"
                    type="number"
                    defaultValue="240"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border-l-4 border-tertiary bg-surface-container-low p-5 shadow-lg sm:p-8">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <span className="bg-tertiary/20 text-tertiary w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
              <h2 className="font-headline text-2xl font-bold">Rare Gear Registry</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-xl border-r-4 border-tertiary bg-surface-container-highest p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-tertiary-container/10 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">diamond</span>
                  </div>
                  <div>
                    <div className="font-headline font-bold">Champions 2021 Vandal</div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-tighter">Event Exclusive</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-error">close</span>
              </div>
              <div className="flex flex-col gap-3 rounded-xl border-r-4 border-primary bg-surface-container-highest p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-container/10 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">swords</span>
                  </div>
                  <div>
                    <div className="font-headline font-bold">Arcane Sheriff</div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-tighter">Limited Collection</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-error">close</span>
              </div>
              <button className="w-full py-4 border-2 border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 font-bold">
                <span className="material-symbols-outlined">add_circle</span>
                Add More Items
              </button>
            </div>
          </div>
          <button className="primary-gradient-bg w-full rounded-xl py-4 font-headline text-lg font-black tracking-tighter text-black shadow-[0_0_40px_rgba(207,150,255,0.08)] transition-all hover:scale-[1.02] active:scale-95 sm:py-6 sm:text-2xl">
            VALUE MY ACCOUNT
          </button>
        </section>

        {/* Step 2: Value Breakdown */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-high rounded-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Live Valuation</span>
            </div>
            <div className="p-5 sm:p-8">
              <h3 className="font-headline text-on-surface-variant uppercase tracking-[0.2em] text-sm mb-2">Estimated Market Worth</h3>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-headline text-4xl font-bold text-secondary sm:text-6xl">$1,248</span>
                <span className="text-tertiary font-bold text-lg">+12.4%</span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2">
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <div className="text-xs text-on-surface-variant mb-1 uppercase font-bold tracking-tight">Rarity Score</div>
                  <div className="text-2xl font-headline font-bold">88<span className="text-sm text-outline">/100</span></div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg">
                  <div className="text-xs text-on-surface-variant mb-1 uppercase font-bold tracking-tight">Liquidity Index</div>
                  <div className="text-2xl font-headline font-bold">High</div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-highest p-5 sm:p-8">
              <h4 className="font-headline font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">psychology</span>
                AI INSIGHTS
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1 bg-primary rounded-full"></div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <span className="text-on-surface font-bold">Rare Item Alert:</span> Your "Champions 2021" set has increased by 15% in demand over the last 30 days due to market scarcity.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 bg-secondary rounded-full"></div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <span className="text-on-surface font-bold">Rank Premium:</span> Being in the top 0.5% of players adds an estimated <span className="text-secondary">$140</span> performance premium to your base valuation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
