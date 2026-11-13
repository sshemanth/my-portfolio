"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Page-wide motion outside the hero, all on the same GSAP/ScrollTrigger system:
 * reveals for [data-reveal], bars that grow for [data-chart], the research-path line and the
 * header progress hairline. Skipped entirely when motion is reduced (content is then static).
 */
export function Motion() {
  useGSAP(() => {
    const html = document.documentElement;
    if (html.dataset.motion !== "full") return;
    html.dataset.live = "1"; // tells the gate in layout.tsx that the motion script took over

    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, overwrite: true }),
    });

    gsap.utils.toArray<HTMLElement>("[data-chart]").forEach((chart) => {
      gsap.fromTo(chart.querySelectorAll(".bar-fill"), { scaleX: 0 }, {
        scaleX: 1, duration: 1.1, ease: "power3.out", stagger: 0.06,
        scrollTrigger: { trigger: chart, start: "top 85%", once: true },
      });
    });

    const line = document.querySelector(".path-line-fill");
    if (line) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".path-steps", start: "top 60%", end: "bottom 60%", scrub: true } });

    gsap.fromTo(".scroll-progress", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

    // Web fonts change text height; re-measure once they are in so trigger positions stay exact.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });
  return null;
}
