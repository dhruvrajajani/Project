"use client";
import {
  CircleDollarSign,
  Gamepad2,
  Heart,
  Shield,
  ToggleLeft,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { confirmClearFilters } from "@/lib/marketplaceAlerts";

const GAME_FILTERS = [
  {
    id: "valorant",
    name: "Valorant",
    info: "Competitive agent accounts",
    icon: Gamepad2,
  },
  {
    id: "cs2",
    name: "CS2",
    info: "Premium ranked ready",
    icon: Trophy,
  },
  {
    id: "lol",
    name: "League of Legends",
    info: "High elo ranked accounts",
    icon: Zap,
  },
  {
    id: "apex",
    name: "Apex Legends",
    info: "Unlocked characters",
    icon: Shield,
  },
  {
    id: "genshin",
    name: "Genshin Impact",
    info: "Built characters",
    icon: Users,
  },
  {
    id: "fortnite",
    name: "Fortnite",
    info: "Battle pass ready",
    icon: Gamepad2,
  },
];

const PRICE_FILTERS = [
  {
    id: "under-500",
    name: "Under $500",
    info: "Budget friendly accounts",
    icon: CircleDollarSign,
  },
  {
    id: "500-1000",
    name: "$500 to $1000",
    info: "Mid-range accounts",
    icon: CircleDollarSign,
  },
  {
    id: "over-1000",
    name: "Over $1000",
    info: "Premium listings",
    icon: CircleDollarSign,
  },
];

const STATUS_FILTERS = [
  {
    id: "active",
    name: "Active",
    info: "Available right now",
    icon: ToggleLeft,
  },
  {
    id: "inactive",
    name: "Inactive",
    info: "Currently unavailable",
    icon: ToggleLeft,
  },
  {
    id: "sold",
    name: "Sold",
    info: "Already purchased",
    icon: ToggleLeft,
  },
];

const LIKE_FILTERS = [
  {
    id: "liked",
    name: "Liked accounts",
    info: "Show only saved listings",
    icon: Heart,
  },
];

function FilterButton({ item, selected, onClick }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "market-filter-button flex w-full items-center justify-between gap-4 rounded-2xl border p-3 text-left transition-colors",
        selected
          ? "border-primary/40 bg-primary/12"
          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "rounded-xl p-2",
            selected ? "bg-primary/18" : "bg-background",
          ].join(" ")}
        >
          <Icon
            className={[
              "size-5",
              selected ? "text-primary" : "text-on-surface-variant",
            ].join(" ")}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-on-surface">{item.name}</p>
          <p className="text-xs text-on-surface-variant">{item.info}</p>
        </div>
      </div>

      <span
        className={[
          "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
          selected
            ? "bg-primary text-black"
            : "bg-white/8 text-on-surface-variant",
        ].join(" ")}
      >
        {selected ? "On" : "Off"}
      </span>
    </button>
  );
}

function FilterSection({ title, items, selectedValues, onToggle }) {
  return (
    <div className="market-filter-section">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <FilterButton
            key={item.id}
            item={item}
            selected={selectedValues.includes(item.id)}
            onClick={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  className = "",
  sticky = true,
}) {
  const selectedGames = filters?.games || [];
  const selectedPrices = filters?.prices || [];
  const selectedStatuses = filters?.statuses || [];
  const selectedLikes = filters?.likes || [];

  const activeCount =
    selectedGames.length +
    selectedPrices.length +
    selectedStatuses.length +
    selectedLikes.length;

  function updateFilterGroup(group, nextValues) {
    onFiltersChange({
      ...filters,
      [group]: nextValues,
    });
  }

  function toggleSelection(group, selectedValues, id) {
    updateFilterGroup(
      group,
      selectedValues.includes(id)
        ? selectedValues.filter((item) => item !== id)
        : [...selectedValues, id],
    );
  }

  function resetFilters() {
    onFiltersChange({
      games: [],
      prices: [],
      statuses: [],
      likes: [],
    });
  }

  async function handleClearFilters() {
    if (activeCount === 0) return;

    const confirmed = await confirmClearFilters(activeCount);
    if (confirmed) {
      resetFilters();
    }
  }

  return (
    <aside
      className={[
        "relative z-20 overflow-hidden rounded-2xl border border-outline-variant/10",
        sticky ? "lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:w-80 lg:self-start" : "",
        className,
      ].join(" ").trim()}
    >
      <div className="flex h-full flex-col bg-transparent">
        <div className="border-b border-outline-variant/10 px-6 pb-5 pt-6">
          <h2 className="mb-2 font-headline text-2xl font-bold text-on-surface">
            Filters
          </h2>
          <p className="text-sm text-on-surface-variant">
            Filter by game, price, and listing status
          </p>
        </div>

        <div className="marketplace-sidebar-scroll flex-1 space-y-8 overflow-y-auto px-6 py-6 scroll-smooth lg:pr-4">
          <FilterSection
            title="Games"
            items={GAME_FILTERS}
            selectedValues={selectedGames}
            onToggle={(id) => toggleSelection("games", selectedGames, id)}
          />

          <FilterSection
            title="Price"
            items={PRICE_FILTERS}
            selectedValues={selectedPrices}
            onToggle={(id) => toggleSelection("prices", selectedPrices, id)}
          />

          <FilterSection
            title="Status"
            items={STATUS_FILTERS}
            selectedValues={selectedStatuses}
            onToggle={(id) => toggleSelection("statuses", selectedStatuses, id)}
          />

          <FilterSection
            title="Saved"
            items={LIKE_FILTERS}
            selectedValues={selectedLikes}
            onToggle={(id) => toggleSelection("likes", selectedLikes, id)}
          />
        </div>

        <div className="border-t border-outline-variant/10 bg-transparent px-6 py-5">
          <p className="mb-3 text-xs font-semibold text-on-surface-variant">
            {activeCount} ACTIVE FILTER{activeCount !== 1 ? "S" : ""}
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={activeCount === 0}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:text-on-surface-variant/50"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </aside>
  );
}
