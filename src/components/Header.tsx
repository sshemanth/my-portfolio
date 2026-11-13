"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/content/site";
import { Icon } from "@/components/ui/Icon";

/** Site header. On narrow screens the links move into a dialog-style sheet with managed focus. */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState("");
  const toggle = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  // Glass background once the page has moved; highlight the section in view.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    nav.forEach((n) => { const el = document.querySelector(n.href); if (el) io.observe(el); });
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  // Menu: lock scroll, trap Tab, close on Escape or when the layout widens, return focus on close.
  useEffect(() => {
    if (!open) return;
    const panel = sheet.current!;
    const opener = toggle.current;
    const wide = window.matchMedia("(min-width: 961px)");
    const focusables = () => [opener!, ...panel.querySelectorAll<HTMLElement>("a[href], button")];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab") return;
      const items = focusables(), first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const onWide = () => wide.matches && setOpen(false);
    const main = document.querySelector("main"), footer = document.querySelector("footer");
    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    panel.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      opener?.focus();
    };
  }, [open]);

  return (
    <header className="site-header" data-scrolled={scrolled || open} data-open={open}>
      <a className="skip" href="#content">Skip to content</a>
      <div className="wrap header-row">
        <a className="brand" href="#top" aria-label={`${site.name}, back to top`}>{site.name}</a>
        <nav className="nav-links" aria-label="Main">
          {nav.map((n) => (
            <a key={n.href} href={n.href} aria-current={current === n.href ? "true" : undefined}>{n.label}</a>
          ))}
        </nav>
        <a className="btn btn-solid btn-sm header-cta" href={`mailto:${site.email}`}>Get in touch</a>
        <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="menu-sheet" onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? "close" : "menu"} size={22} />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      <div ref={sheet} id="menu-sheet" className="menu-sheet" hidden={!open}>
        <nav className="wrap" aria-label="Main, mobile">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>
          ))}
          <a className="btn btn-solid" href={`mailto:${site.email}`} onClick={() => setOpen(false)}><Icon name="mail" />Get in touch</a>
        </nav>
      </div>
      <div className="scroll-progress" aria-hidden="true" />
    </header>
  );
}
