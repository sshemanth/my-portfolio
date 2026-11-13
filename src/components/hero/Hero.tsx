import { hero, site } from "@/content/site";
import { Icon } from "@/components/ui/Icon";

/** One screen with the name and links, then the short introduction straight after it. */
export function Hero() {
  return (
    <section id="top" className="hero" aria-label="Introduction">
      <div className="hero-veil" aria-hidden="true" />
      <div className="wrap">
        <div className="beat beat-1">
          <p className="eyebrow">{site.locationLine}</p>
          <h1 className="hero-name">{site.name}</h1>
          <p className="hero-role">{site.role}</p>
          <div className="actions">
            <a className="btn btn-solid" href={hero.primary.href}>{hero.primary.label}<Icon name="arrow-down" /></a>
            <a className="btn btn-ghost" href={hero.secondary.href}><Icon name="mail" />{hero.secondary.label}</a>
          </div>
          <ul className="profiles" aria-label="Profiles">
            {site.profiles.map((p) => (
              <li key={p.href}><a href={p.href} target="_blank" rel="noopener noreferrer"><Icon name={p.icon} />{p.label}</a></li>
            ))}
          </ul>
        </div>
        <div className="beat beat-2" data-reveal>
          <p className="eyebrow">{hero.work.label}</p>
          <p className="hero-lead">{hero.work.lead}</p>
          <p className="hero-rest">{hero.work.rest}</p>
        </div>
      </div>
    </section>
  );
}
