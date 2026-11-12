// Page motion built on Motion (motion.dev): hero entrance, scroll reveals, scroll-linked hero depth
// and a gentle 3D tilt on the main cards. Everything is skipped when the visitor prefers reduced motion.
import { animate, scroll, inView, stagger } from "motion";

const root = document.documentElement;
root.classList.add("motion-ready");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = [0.2, 0.7, 0.2, 1];

const showAll = () => document.querySelectorAll(".rise").forEach((el) => (el.style.opacity = 1));

if (reduceMotion) {
  showAll();
} else {
  heroEntrance();
  revealOnScroll();
  heroDepth();
  progressBar();
  tiltCards();
}

function heroEntrance() {
  const title = document.querySelector(".hero h1");
  if (title && !title.dataset.split) {
    // Split the name into words so each one can rise in turn.
    title.dataset.split = "1";
    title.innerHTML = title.textContent
      .trim()
      .split(/\s+/)
      .map((w) => `<span class="word"><span>${w}</span></span>`)
      .join(" ");
  }
  const intro = document.querySelectorAll(".hero .intro > *:not(h1)");
  animate(".hero h1 .word > span", { y: ["105%", "0%"] }, { duration: 0.9, ease, delay: stagger(0.08, { startDelay: 0.15 }) });
  animate(intro, { opacity: [0, 1], y: [16, 0] }, { duration: 0.7, ease, delay: stagger(0.08, { startDelay: 0.35 }) });
  document.querySelector(".hero .intro")?.style.setProperty("opacity", 1);
  animate("#bg-scene", { opacity: [0, 1], scale: [1.04, 1] }, { duration: 1.8, ease, delay: 0.05 });
}

function revealOnScroll() {
  // Single blocks fade and rise; lists and grids stagger their children.
  inView(
    ".rise:not(.stagger)",
    ({ target }) => {
      animate(target, { opacity: [0, 1], y: [24, 0] }, { duration: 0.8, ease });
    },
    { margin: "0px 0px -10% 0px" }
  );
  inView(
    ".stagger",
    ({ target }) => {
      target.style.opacity = 1;
      animate(Array.from(target.children), { opacity: [0, 1], y: [28, 0] }, { duration: 0.7, ease, delay: stagger(0.07) });
    },
    { margin: "0px 0px -10% 0px" }
  );
}

function heroDepth() {
  const hero = document.querySelector(".hero-wrap");
  if (!hero) return;
  // Hero text drifts up and fades a little as it scrolls away.
  scroll(animate(".hero .intro", { y: [0, -80], opacity: [1, 0.2] }, { ease: "linear" }), {
    target: hero,
    offset: ["start start", "end start"],
  });
}

function progressBar() {
  const bar = document.querySelector(".progress");
  if (bar) scroll(animate(bar, { scaleX: [0, 1] }, { ease: "linear" }));
}

function tiltCards() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const max = Number(card.dataset.tilt) || 4;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
      card.style.setProperty("--my", `${(py + 0.5) * 100}%`);
      animate(card, { rotateY: px * max * 2, rotateX: -py * max * 2 }, { duration: 0.4, ease });
    });
    card.addEventListener("pointerleave", () => {
      animate(card, { rotateY: 0, rotateX: 0 }, { type: "spring", stiffness: 180, damping: 18 });
    });
  });
}
