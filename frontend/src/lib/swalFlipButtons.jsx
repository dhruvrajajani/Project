import React from "react";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/animate-ui/components/buttons/flip";

export function mountSwalFlipButtons(
  popup,
  {
    confirmText = "Done",
    cancelText = null,
    confirmVariant = "default",
    cancelVariant = "outline",
  } = {},
) {
  if (!popup) {
    return () => {};
  }

  const existing = popup.querySelector(".market-swal-flip-actions-mount");
  existing?.remove();

  const mountNode = document.createElement("div");
  mountNode.className = "market-swal-flip-actions-mount";

  const htmlContainer = popup.querySelector(".swal2-html-container");
  const titleNode = popup.querySelector(".swal2-title");
  const anchor = htmlContainer || titleNode;

  if (anchor?.parentNode) {
    anchor.parentNode.insertBefore(mountNode, anchor.nextSibling);
  } else {
    popup.appendChild(mountNode);
  }

  const root = createRoot(mountNode);
  root.render(
    <div className="market-swal-flip-actions">
      {cancelText ? (
        <FlipButton
          variant={cancelVariant}
          size="lg"
          from="bottom"
          onClick={() => Swal.clickCancel()}
        >
          <FlipButtonFront>{cancelText}</FlipButtonFront>
          <FlipButtonBack>{cancelText}</FlipButtonBack>
        </FlipButton>
      ) : null}

      <FlipButton
        variant={confirmVariant}
        size="lg"
        from="top"
        onClick={() => Swal.clickConfirm()}
      >
        <FlipButtonFront>{confirmText}</FlipButtonFront>
        <FlipButtonBack>{confirmText}</FlipButtonBack>
      </FlipButton>
    </div>,
  );

  return () => {
    root.unmount();
    mountNode.remove();
  };
}
