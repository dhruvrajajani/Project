import Swal from "sweetalert2";
import { animateSwalOpen } from "@/lib/alertAnimations";
import { mountSwalFlipButtons } from "@/lib/swalFlipButtons";

const authSwal = Swal.mixin({
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

export async function showLoginSuccess(user) {
  let cleanupButtons = null;
  await authSwal.fire({
    icon: "success",
    title: `Welcome back${user?.username ? `, ${user.username}` : ""}`,
    text: "Your account is ready and the vault has been unlocked.",
    confirmButtonText: "Enter vault",
    didOpen: (popup) => {
      animateSwalOpen(popup);
      cleanupButtons = mountSwalFlipButtons(popup, {
        confirmText: "Enter vault",
      });
    },
    didDestroy: () => {
      cleanupButtons?.();
      cleanupButtons = null;
    },
  });
}

export async function confirmLogoutPopup() {
  let cleanupButtons = null;
  const result = await authSwal.fire({
    icon: "question",
    title: "Log out now?",
    text: "Your current session will be closed on this device.",
    showCancelButton: true,
    confirmButtonText: "Log out",
    cancelButtonText: "Stay here",
    didOpen: (popup) => {
      animateSwalOpen(popup);
      cleanupButtons = mountSwalFlipButtons(popup, {
        confirmText: "Log out",
        cancelText: "Stay here",
      });
    },
    didDestroy: () => {
      cleanupButtons?.();
      cleanupButtons = null;
    },
  });

  return result.isConfirmed;
}

export async function showLogoutSuccess() {
  let cleanupButtons = null;
  await authSwal.fire({
    icon: "success",
    title: "Logged out",
    text: "You have safely exited the vault.",
    confirmButtonText: "Done",
    didOpen: (popup) => {
      animateSwalOpen(popup);
      cleanupButtons = mountSwalFlipButtons(popup, {
        confirmText: "Done",
      });
    },
    didDestroy: () => {
      cleanupButtons?.();
      cleanupButtons = null;
    },
  });
}
