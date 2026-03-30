import React from "react";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import { FireworksBackground } from "@/components/animate-ui/components/backgrounds/fireworks";
import { animateSwalOpen } from "@/lib/alertAnimations";
import { mountSwalFlipButtons } from "@/lib/swalFlipButtons";

const marketplaceSwal = Swal.mixin({
  background: "rgba(0, 0, 0, 0.42)",
  backdrop: "rgba(0, 0, 0, 0.82)",
  color: "#dee5ff",
  allowOutsideClick: true,
  allowEscapeKey: true,
  reverseButtons: true,
  buttonsStyling: false,
  customClass: {
    container: "market-swal-container",
    popup: "market-swal-popup",
    title: "market-swal-title",
    htmlContainer: "market-swal-html",
    confirmButton: "market-swal-confirm",
    cancelButton: "market-swal-cancel",
    actions: "market-swal-actions",
    closeButton: "market-swal-close",
  },
  didOpen: animateSwalOpen,
});

export async function confirmBuyPopup(card) {
  let cleanupButtons = null;
  const result = await marketplaceSwal.fire({
    title: `Buy ${card.game}?`,
    html: `
      <div class="market-swal-card">
        <img src="${card.image}" alt="${card.game}" class="market-swal-image" />
        <div class="market-swal-meta">
          <div class="market-swal-price">$${card.price}</div>
          <div class="market-swal-copy">${card.rank} • ${card.yearsActive}</div>
        </div>
        <p class="market-swal-description">${card.description}</p>
      </div>
    `,
    showCloseButton: true,
    showCancelButton: true,
    confirmButtonText: "Continue",
    cancelButtonText: "Later",
    didOpen: (popup) => {
      animateSwalOpen(popup);
      cleanupButtons = mountSwalFlipButtons(popup, {
        confirmText: "Continue",
        cancelText: "Later",
      });
    },
    didDestroy: () => {
      cleanupButtons?.();
      cleanupButtons = null;
    },
  });

  return result.isConfirmed;
}

export async function showPurchaseSuccess(card) {
  let fireworksRoot = null;
  let cleanupButtons = null;

  await marketplaceSwal.fire({
    title: "Payment successful",
    html: `
      <div class="market-swal-success-shell">
        <div class="market-swal-fireworks"></div>
        <div class="market-swal-success-copy">
          <p class="market-swal-success-text">
            ${card.game} has been reserved for checkout review.
          </p>
        </div>
      </div>
    `,
    confirmButtonText: "Nice",
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: "market-swal-popup market-swal-success-popup",
      title: "market-swal-title",
      htmlContainer: "market-swal-html",
      confirmButton: "market-swal-confirm",
      actions: "market-swal-actions",
    },
    didOpen: (popup) => {
      animateSwalOpen(popup);
      cleanupButtons = mountSwalFlipButtons(popup, {
        confirmText: "Nice",
      });
      const fireworksNode = popup.querySelector(".market-swal-fireworks");
      if (!fireworksNode) return;

      fireworksRoot = createRoot(fireworksNode);
      fireworksRoot.render(
        React.createElement(FireworksBackground, {
          className: "market-swal-fireworks-canvas",
          color: ["#ffffff", "#cf96ff", "#00f4fe"],
          population: 1.4,
        }),
      );
    },
    didDestroy: () => {
      cleanupButtons?.();
      cleanupButtons = null;
      fireworksRoot?.unmount();
      fireworksRoot = null;
    },
  });
}

export async function showErrorPopup(title, text) {
  let cleanupButtons = null;
  await marketplaceSwal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "Close",
    didOpen: (popup) => {
      animateSwalOpen(popup);
      cleanupButtons = mountSwalFlipButtons(popup, {
        confirmText: "Close",
        confirmVariant: "destructive",
      });
    },
    didDestroy: () => {
      cleanupButtons?.();
      cleanupButtons = null;
    },
  });
}

export function showLikePopup(card, liked) {
  return marketplaceSwal.fire({
    toast: true,
    position: "top-start",
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
    backdrop: false,
    allowOutsideClick: true,
    allowEscapeKey: true,
    icon: liked ? "success" : "info",
    title: liked
      ? `${card.game} added to liked accounts`
      : `${card.game} removed from liked accounts`,
    customClass: {
      container: "market-swal-toast-container",
      popup: "market-swal-like-popup",
      title: "market-swal-title",
    },
  });
}

export async function confirmClearFilters(activeCount) {
  let cleanupButtons = null;
  const result = await marketplaceSwal.fire({
    icon: "question",
    title: "Clear all filters?",
    text: `This will remove ${activeCount} active filter${activeCount !== 1 ? "s" : ""}.`,
    showCancelButton: true,
    confirmButtonText: "Clear filters",
    cancelButtonText: "Keep them",
    didOpen: (popup) => {
      animateSwalOpen(popup);
      cleanupButtons = mountSwalFlipButtons(popup, {
        confirmText: "Clear filters",
        cancelText: "Keep them",
      });
    },
    didDestroy: () => {
      cleanupButtons?.();
      cleanupButtons = null;
    },
  });

  if (!result.isConfirmed) return false;

  let cleanupDoneButtons = null;
  await marketplaceSwal.fire({
    icon: "success",
    title: "Filters cleared",
    text: "The marketplace is back to the full listing view.",
    confirmButtonText: "Done",
    didOpen: (popup) => {
      animateSwalOpen(popup);
      cleanupDoneButtons = mountSwalFlipButtons(popup, {
        confirmText: "Done",
      });
    },
    didDestroy: () => {
      cleanupDoneButtons?.();
      cleanupDoneButtons = null;
    },
  });

  return true;
}
