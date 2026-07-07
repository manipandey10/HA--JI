import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');

  useEffect(() => {
    if (location.pathname !== (displayChildren as React.ReactElement)?.props?.location?.pathname) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayChildren]);

  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('fadeIn');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, children]);

  return (
    <div
      key={location.pathname}
      className={transitionStage === 'fadeIn' ? 'animate-fade-in-up' : 'opacity-0 transition-opacity duration-150'}
    >
      {displayChildren}
    </div>
  );
}

export function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}

export function StaggerGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  index,
  className = '',
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  const delay = Math.min(index * 0.05, 0.3);
  return (
    <div className={`animate-fade-in-up ${className}`} style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}>
      {children}
    </div>
  );
}
