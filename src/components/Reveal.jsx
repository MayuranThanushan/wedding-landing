import { useEffect, useRef, useState } from 'react';

/**
 * Animates children in when they scroll into view.
 *   variant: 'up' (default) | 'left' | 'right' | 'scale' | 'fade'
 *   delay:   seconds, for staggering lists (e.g. delay={i * 0.08})
 */
export default function Reveal({ as: Tag = 'div', className = '', variant = 'up', delay = 0, style, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${variant !== 'up' ? `v-${variant}` : ''} ${shown ? 'is-in' : ''} ${className}`}
      style={delay ? { ...style, '--d': `${delay}s` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
