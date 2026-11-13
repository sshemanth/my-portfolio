import { contact, education, facts, path, projects, publications, site, technology, themes, type LinkItem } from "@/content/site";
import { asset } from "@/lib/asset";
import { Icon, Logo } from "@/components/ui/Icon";
import { MetricChart } from "@/components/ui/MetricChart";
import { Bibtex } from "@/components/ui/Bibtex";

/* Shared pieces ---------------------------------------------------------------------------- */

function SectionHead({ index, label, heading, id }: { index: string; label: string; heading: string; id: string }) {
  return (
    <header className="sec-head" data-reveal>
      <p className="eyebrow"><span className="num">{index}</span>{label}</p>
      <h2 id={id} className="sec-title">{heading}</h2>
    </header>
  );
}

function Links({ items }: { items: LinkItem[] }) {
  if (!items.length) return null;
  return (
    <>
      {items.map((l) =>
        l.external ? (
          <a key={l.href} className="text-link" href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}<Icon name="arrow-up-right" size={14} /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <a key={l.href} className="text-link" href={l.href}>{l.label}<Icon name="arrow-down" size={14} /></a>
        ),
      )}
    </>
  );
}

/* Sections --------------------------------------------------------------------------------- */

export function Facts() {
  return (
    <section className="facts" aria-label="Key results">
      <dl className="wrap facts-grid">
        {facts.map((f) => (
          <div key={f.value} data-reveal>
            <dt className="num">{f.value}</dt>
            <dd>{f.caption}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ResearchPath() {
  return (
    <section id="path" className="block" aria-labelledby="path-h">
      <div className="wrap">
        <SectionHead index="01" label={path.label} heading={path.heading} id="path-h" />
        <p className="sec-intro" data-reveal>{path.intro}</p>
        <div className="path-steps">
          <span className="path-line" aria-hidden="true"><span className="path-line-fill" /></span>
          <ol>
            {path.steps.map((s) => (
              <li key={s.id} id={s.id} className="step" data-now={s.status ? "" : undefined}>
                <div className="step-rail">
                  <span className="step-dot" aria-hidden="true" />
                  <span className="step-no num">{s.no}</span>
                  <span className="step-kind">{s.kind.map((k) => <span key={k}>{k}</span>)}</span>
                </div>
                <div className="step-body">
                  <h3 data-reveal>{s.title}</h3>
                  {s.body.map((p) => <p key={p.slice(0, 24)} className="prose" data-reveal>{p}</p>)}
                  {s.figure && (
                    <figure className="figure" data-reveal>
                      <a href={asset(`${s.figure.src}-1600.jpg`)} target="_blank" rel="noopener noreferrer" aria-label="Open the framework diagram at full size in a new tab">
                        <picture>
                          <source type="image/webp" srcSet={`${asset(`${s.figure.src}-800.webp`)} 800w, ${asset(`${s.figure.src}-1600.webp`)} 1600w`} sizes="(min-width: 1000px) 760px, 92vw" />
                          <img src={asset(`${s.figure.src}-1600.jpg`)} alt={s.figure.alt} width={s.figure.width} height={s.figure.height} loading="lazy" decoding="async" />
                        </picture>
                      </a>
                      <figcaption>{s.figure.caption}</figcaption>
                    </figure>
                  )}
                  {s.charts.length > 0 && (
                    <div className="charts" data-reveal>{s.charts.map((c) => <MetricChart key={c.title} chart={c} />)}</div>
                  )}
                  {s.note && <p className="note" data-reveal>{s.note}</p>}
                  {s.open && (
                    <aside className="glass open-card" data-reveal>
                      <p className="eyebrow">What it left open</p>
                      <p>{s.open}</p>
                    </aside>
                  )}
                  {s.status && <p className="status" data-reveal><span className="live-dot" aria-hidden="true" />{s.status}</p>}
                  {s.links.length > 0 && <p className="link-row" data-reveal><Links items={s.links} /></p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Publications() {
  return (
    <section id="publications" className="block" aria-labelledby="pub-h">
      <div className="wrap">
        <SectionHead index="02" label={publications.label} heading={publications.heading} id="pub-h" />
        <ul className="rows">
          {publications.items.map((p) => (
            <li key={p.title} className="row" data-reveal>
              <span className="row-meta num">{p.year}</span>
              <div>
                <h3>{p.title}</h3>
                <p className="cite"><strong>{p.author}</strong> · {p.venue}</p>
                <div className="link-row"><Links items={p.links} /><Bibtex entry={p.bibtex} /></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section id="work" className="block" aria-labelledby="work-h">
      <div className="wrap">
        <SectionHead index="03" label={projects.label} heading={projects.heading} id="work-h" />
        <div className="projects">
          {projects.items.map((p, i) => (
            <article key={p.title} className="project">
              <div className="project-head" data-reveal>
                <p className="row-meta"><span className="num">{String(i + 1).padStart(2, "0")}</span>{p.year} · {p.context}</p>
                <h3>{p.title}</h3>
                <p className="question">{p.question}</p>
              </div>
              <div className="project-cols">
                <div data-reveal>
                  <p className="prose">{p.body}</p>
                  {p.miniFacts.length > 0 && (
                    <dl className="mini-facts">
                      {p.miniFacts.map((f) => <div key={f.value}><dt className="num">{f.value}</dt><dd>{f.caption}</dd></div>)}
                    </dl>
                  )}
                  {p.finding && (
                    <aside className="finding">
                      <p className="eyebrow">Finding</p>
                      <p>{p.finding}</p>
                    </aside>
                  )}
                  {p.note && <p className="note">{p.note}</p>}
                  {p.links.length > 0 && <p className="link-row"><Links items={p.links} /></p>}
                </div>
                {p.charts.length > 0 && (
                  <div className="glass charts" data-reveal>{p.charts.map((c) => <MetricChart key={c.title} chart={c} />)}</div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Themes() {
  return (
    <section id="themes" className="block" aria-labelledby="themes-h">
      <div className="wrap">
        <SectionHead index="04" label={themes.label} heading={themes.heading} id="themes-h" />
        <ol className="themes">
          {themes.items.map((t, i) => (
            <li key={t.title} data-reveal>
              <span className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Technology() {
  return (
    <section id="skills" className="block" aria-labelledby="skills-h">
      <div className="wrap">
        <SectionHead index="05" label={technology.label} heading={technology.heading} id="skills-h" />
        <div className="tech">
          {technology.groups.map((g) => (
            <div key={g.title} className="glass tech-group" data-reveal>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((item) => <li key={item}><Logo name={item} />{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Education() {
  return (
    <section id="education" className="block" aria-labelledby="edu-h">
      <div className="wrap">
        <SectionHead index="06" label={education.label} heading={education.heading} id="edu-h" />
        <ul className="rows">
          {education.items.map((e) => (
            <li key={e.title} className="row" data-reveal>
              <span className="row-meta num">{e.years}</span>
              <div>
                <h3>{e.title}</h3>
                <p className="cite">{e.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-h">
      <div className="wrap contact-inner">
        <p className="eyebrow" data-reveal><span className="num">07</span>{contact.label}</p>
        <h2 id="contact-h" data-reveal>{contact.heading}</h2>
        <p className="contact-body" data-reveal>{contact.body}</p>
        <a className="mail-link" href={`mailto:${site.email}`} data-reveal>{site.email}</a>
        <ul className="profiles" aria-label="Profiles" data-reveal>
          {site.profiles.map((p) => (
            <li key={p.href}><a href={p.href} target="_blank" rel="noopener noreferrer"><Icon name={p.icon} />{p.label}<span className="sr-only"> (opens in a new tab)</span></a></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>{site.footer}</span>
        <span className="num">{site.year}</span>
      </div>
    </footer>
  );
}
