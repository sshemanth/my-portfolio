"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { hero, site } from "@/content/site";
import { asset } from "@/lib/asset";
import { Icon } from "@/components/ui/Icon";
import { heroConfig as cfg } from "./hero.config";
import { poster } from "./network.assets";
import type { NetworkScene } from "./networkScene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Orientation = "landscape" | "portrait";
const posterSet = (o: Orientation, format: "webp" | "jpg") =>
  poster[o].map((w) => `${asset(`hero-network/poster-${o}-${w}.${format}`)} ${w}w`).join(", ");

/**
 * Cinematic hero: a bounded sticky scene whose scroll progress (0–1) drives one GSAP timeline.
 * That timeline owns both the camera move through the 3D neural network and the three blocks of
 * copy, so they cannot drift apart. Without JS, without WebGL or with reduced motion the same
 * markup reads as a normal stacked section over a still of the network.
 */
export function HeroSequence() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      const html = document.documentElement;
      if (html.dataset.motion !== "full") return;

      const holder = section.querySelector<HTMLElement>(".hero-net")!;
      const beats = gsap.utils.toArray<HTMLElement>(".beat", section);
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      const lightweight = !!conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "");
      const cam = { p: 0 }; // 0–1 through the camera move

      // The network loads once the hero is within a screen of the viewport (e.g. reload mid-page).
      let scene: NetworkScene | null = null;
      let disposed = false;
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          if (lightweight) return void (section.dataset.frames = "off");
          import("./networkScene")
            .then(({ createNetworkScene }) => {
              if (disposed) return;
              scene = createNetworkScene(holder, { portrait: window.matchMedia("(orientation: portrait)").matches, animate: true });
              scene.setProgress(cam.p);
              section.dataset.frames = "on";
              // Hook for scripts/build-posters.mjs, which renders the stills from this exact scene.
              if (new URLSearchParams(location.search).has("still")) (window as Window & { __heroScene?: NetworkScene }).__heroScene = scene;
            })
            .catch(() => (section.dataset.frames = "off")); // no WebGL: the poster takes a slow push instead
        },
        { rootMargin: "100% 0px" },
      );
      io.observe(section);

      /* ---- One timeline, scrubbed by the section's scroll progress ---------------------- */
      gsap.set(beats.slice(1), { opacity: 0, y: 28 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: cfg.smoothing || true, invalidateOnRefresh: true },
      });
      // Mirror timeline progress into CSS and the canvas. Runs on GSAP's ticker rather than the
      // timeline's own callback, so it also catches silent jumps (scroll restored on reload, refresh).
      let lastP = -1;
      const sync = () => {
        const p = tl.progress();
        if (p === lastP) return;
        lastP = p;
        section.style.setProperty("--p", p.toFixed(4));
        section.dataset.beat = String(cfg.beats.reduce((a, b, i) => (p >= b.in[0] ? i : a), 0));
        scene?.setProgress(cam.p);
      };
      gsap.ticker.add(sync);
      tl.to(cam, { p: 1, ease: cfg.camera.ease, duration: cfg.camera.end - cfg.camera.start }, cfg.camera.start);
      cfg.beats.forEach((b, i) => {
        const el = beats[i];
        if (!el) return;
        if (b.in[1] > b.in[0]) tl.to(el, { opacity: 1, y: 0, ease: "power2.out", duration: b.in[1] - b.in[0] }, b.in[0]);
        if (b.out) tl.to(el, { opacity: 0, y: -28, ease: "power1.in", duration: b.out[1] - b.out[0] }, b.out[0]);
      });
      tl.to({}, { duration: 0.001 }, 1 - 0.001); // pad the timeline to exactly 0–1
      html.dataset.live = "1";

      // Keyboard: tabbing into copy that is currently off screen scrolls its beat into place.
      const onFocus = (e: FocusEvent) => {
        const beat = (e.target as HTMLElement).closest<HTMLElement>(".beat");
        const st = tl.scrollTrigger;
        if (!beat || !st || Number(getComputedStyle(beat).opacity) > 0.6) return;
        window.scrollTo({ top: st.start + (st.end - st.start) * cfg.anchors[beats.indexOf(beat)] });
      };
      section.addEventListener("focusin", onFocus);

      return () => {
        gsap.ticker.remove(sync);
        section.removeEventListener("focusin", onFocus);
        io.disconnect();
        disposed = true;
        scene?.dispose();
        delete section.dataset.frames;
      };
    },
    { scope: root },
  );

  const travel = { "--travel-l": cfg.travel.landscape, "--travel-p": cfg.travel.portrait } as React.CSSProperties;

  return (
    <section ref={root} id="top" className="hero" style={travel} aria-label="Introduction">
      <div className="hero-stage">
        <div className="hero-media">
          <picture className="hero-poster">
            <source media="(orientation: portrait)" type="image/webp" srcSet={posterSet("portrait", "webp")} sizes="100vw" />
            <source type="image/webp" srcSet={posterSet("landscape", "webp")} sizes="100vw" />
            <img src={asset("hero-network/poster-landscape-1600.jpg")} alt={hero.posterAlt} width={1600} height={900} fetchPriority="high" decoding="async" />
          </picture>
          <div className="hero-net" aria-hidden="true" />
        </div>
        <div className="hero-veil" aria-hidden="true" />

        <div className="hero-copy wrap">
          <div className="beat beat-1">
            <p className="eyebrow">{site.locationLine}</p>
            <h1 className="hero-name">{site.name}</h1>
            <p className="hero-role">{site.role}</p>
            <HeroActions />
            <ul className="profiles" aria-label="Profiles">
              {site.profiles.map((p) => (
                <li key={p.href}><a href={p.href} target="_blank" rel="noopener noreferrer"><Icon name={p.icon} />{p.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="beat beat-2">
            <p className="eyebrow">{hero.work.label}</p>
            <p className="hero-lead">{hero.work.lead}</p>
            <p className="hero-rest">{hero.work.rest}</p>
            <p className="hero-stat"><span className="num">{hero.work.stat.value}</span><span>{hero.work.stat.caption}</span></p>
          </div>

          <div className="beat beat-3">
            <p className="eyebrow"><span className="live-dot" aria-hidden="true" />{hero.ask.label}</p>
            <p className="hero-lead">{hero.ask.lead}</p>
            <p className="hero-rest">{hero.ask.rest}</p>
            <HeroActions emailFirst />
          </div>
        </div>

        <div className="hero-ticks" aria-hidden="true"><i /><i /><i /></div>
        <p className="hero-cue" aria-hidden="true"><span />Scroll</p>
      </div>
    </section>
  );
}

function HeroActions({ emailFirst = false }: { emailFirst?: boolean }) {
  const read = <a key="r" className={`btn ${emailFirst ? "btn-ghost" : "btn-solid"}`} href={hero.primary.href}>{hero.primary.label}<Icon name="arrow-down" /></a>;
  const mail = <a key="m" className={`btn ${emailFirst ? "btn-solid" : "btn-ghost"}`} href={hero.secondary.href}><Icon name="mail" />{hero.secondary.label}</a>;
  return <div className="actions">{emailFirst ? [mail, read] : [read, mail]}</div>;
}
