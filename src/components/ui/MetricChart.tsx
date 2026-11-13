import type { Chart } from "@/content/site";

/**
 * Horizontal bars for scores between 0 and 1. Values are printed next to every bar, so the chart
 * is readable without colour and exposes real text to assistive technology.
 */
export function MetricChart({ chart }: { chart: Chart }) {
  return (
    <figure className="chart" data-chart>
      <figcaption className="chart-title">{chart.title}</figcaption>
      {chart.kind === "pairs" ? (
        <>
          <p className="chart-legend" aria-hidden="true">
            <span><i className="swatch" />{chart.legend[0]}</span>
            <span><i className="swatch swatch-hi" />{chart.legend[1]}</span>
          </p>
          <ul className="chart-rows">
            {chart.rows.map((r) => (
              <li key={r.label} className="chart-row">
                <span className="chart-label">{r.label}</span>
                <span className="bars" aria-hidden="true">
                  <span className="bar"><i className="bar-fill" style={{ width: `${r.from * 100}%` }} /></span>
                  <span className="bar"><i className="bar-fill bar-hi" style={{ width: `${r.to * 100}%` }} /></span>
                </span>
                <span className="chart-value num">
                  <span className="sr-only">{chart.legend[0]} </span>{r.from.toFixed(3)}
                  <span aria-hidden="true"> → </span><span className="sr-only">, {chart.legend[1]} </span>
                  <strong>{r.to.toFixed(3)}</strong>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul className="chart-rows">
          {chart.rows.map((r) => (
            <li key={r.label} className="chart-row">
              <span className="chart-label">{r.label}</span>
              <span className="bars" aria-hidden="true">
                <span className="bar"><i className={`bar-fill${r.highlight ? " bar-hi" : ""}`} style={{ width: `${r.value * 100}%` }} /></span>
              </span>
              <span className="chart-value num">{r.highlight ? <strong>{r.display}</strong> : r.display}</span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
