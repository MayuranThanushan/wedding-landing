import Reveal from '../Reveal.jsx';

/**
 * Editorial section shell.
 *   <Section id="travel" tone="cream|blush|pink|plum" num="06" kicker="Travel & Stay"
 *            title={<>Getting <em>there</em></>} lead="…" center motif>
 * `title` may contain <em> for the italic accent word.
 */
export default function Section({ id, tone = 'cream', num, kicker, title, lead, center = false, motif = false, className = '', children }) {
  return (
    <section id={id} className={`sec tone-${tone} ${motif ? 'has-motif' : ''} ${className}`}>
      <div className="wrap">
        {(kicker || title) && (
          <Reveal className={`sec-head ${center ? 'center' : ''}`}>
            {kicker && <p className="sec-kicker">{num && <span className="num">{num}</span>}{kicker}</p>}
            {title && <h2 className="sec-title">{title}</h2>}
            {lead && <p className="sec-lead">{lead}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
