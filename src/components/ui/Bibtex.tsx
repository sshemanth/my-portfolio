"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** Disclosure for a BibTeX entry with a copy button. Copy reports its real outcome. */
export function Bibtex({ entry }: { entry: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2400);
  };

  return (
    <>
      <button className="text-link" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        BibTeX
      </button>
      <div id={id} className="bibtex" hidden={!open}>
        <pre tabIndex={0} aria-label="BibTeX entry"><code>{entry}</code></pre>
        <button className="btn btn-ghost btn-sm" type="button" onClick={copy}>
          <Icon name={status === "copied" ? "check" : "copy"} />
          {status === "copied" ? "Copied" : status === "failed" ? "Copy failed, select the text" : "Copy"}
        </button>
        <span className="sr-only" role="status">{status === "copied" ? "BibTeX copied to clipboard" : status === "failed" ? "Copy failed" : ""}</span>
      </div>
    </>
  );
}
