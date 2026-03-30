import { gsap } from "gsap";

export function animateSwalOpen(popup) {
  const container = popup?.closest(".swal2-container");

  if (container) {
    gsap.fromTo(
      container,
      { backdropFilter: "blur(0px)" },
      {
        backdropFilter: "blur(12px)",
        duration: 0.28,
        ease: "power2.out",
        overwrite: "auto",
      },
    );
  }

  gsap.fromTo(
    popup,
    {
      opacity: 0,
      y: 28,
      scale: 0.94,
      rotateX: 8,
      transformPerspective: 1000,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      duration: 0.42,
      ease: "power3.out",
      overwrite: "auto",
    },
  );
}
