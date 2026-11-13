"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import type { NetworkScene } from "@/components/hero/networkScene";

/**
 * A light 3D neural network fixed behind the whole page. Scrolling moves the camera forward
 * through its layers; it is full strength behind the hero and softer behind the content.
 * Without WebGL, or on Save-Data and 2G connections, a still of the same network is shown.
 * With reduced motion the network is drawn once per scroll position, with no animation.
 */
export function NetworkBackground() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const lightweight = !!conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "");
    let scene: NetworkScene | null = null;
    let disposed = false;

    const fallback = () => {
      el.dataset.fallback = "";
      el.style.backgroundImage = `url(${asset("hero-network/poster-landscape-1600.jpg")})`;
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const past = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      el.style.setProperty("--net-strength", (1 - past * 0.45).toFixed(3));
      scene?.setProgress(p);
    };

    if (lightweight) fallback();
    else
      import("@/components/hero/networkScene")
        .then(({ createNetworkScene }) => {
          if (disposed) return;
          scene = createNetworkScene(el, { animate: !reduce });
          onScroll();
          el.dataset.ready = "";
          // Hook for scripts/build-posters.mjs, which renders the stills from this exact scene.
          if (new URLSearchParams(location.search).has("still")) (window as Window & { __netScene?: NetworkScene }).__netScene = scene;
        })
        .catch(fallback);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      scene?.dispose();
    };
  }, []);

  return <div ref={host} className="bg-net" aria-hidden="true" />;
}
